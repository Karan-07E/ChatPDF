import { Pinecone } from "@pinecone-database/pinecone";
import { downloadfromS3 } from "@/lib/s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "@/lib/embeddings";
import md5 from "md5";
import { conveertToASCII } from "@/lib/utils";

let pinecone: Pinecone | null = null;

export const getPineconeClient = () => {
    if (!pinecone) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
    }
    return pinecone;
};

//all custom types
type Vector = {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
};

type PDFPage = {
    pageContent: string;    //custom type of our page content as required to me
    metadata: {
        loc: {pageNumber: number}
    }
}

//chunckedUpsert utility function
export async function chunkedUpsert(
  pineconeIndex: any,
  vectors: Vector[],
  namespace: string,
  batchSize: number
) {
  if (!vectors || vectors.length === 0) {
    throw new Error('No vectors to upsert. Check if embeddings were generated successfully.');
  }
  
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);

    if (namespace) {
      await pineconeIndex.namespace(namespace).upsert(batch);
    } else {
      await pineconeIndex.upsert(batch);
    }
  }
}

export async function loadS3toPinecone(filekey: string){
    // 1. obtain pdf and read from it
    console.log('downloading s3 into file system');
    const file_name = await downloadfromS3(filekey);

    if(!file_name){
        throw new Error('Failed to download file from S3');
    }

    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];  //my actual pdf contents

    //pages=array[13] to some docs of array[100]
    //each page into several paragraphs

    //2. preparePDF is a function that will split the page into smaller chunks and return an array of documents
    const documents = await Promise.all(pages.map(preparePDF));
    
    //3. now vectorizing the docs
    const vectors = await Promise.all(documents.flat().map(embedDocument));

    // Filter out any failed embeddings
    const validVectors = vectors.filter(v => v !== null && v !== undefined) as Vector[];
    
    if (validVectors.length === 0) {
      throw new Error('Failed to generate embeddings for all documents. Please check your OpenAI quota and billing.');
    }

    //4. upload to pinecone
    const client = getPineconeClient();
    const pineconeIndex = client.index({name: 'chatpdf-project'});  //newer sdk api

    console.log('uploading vectors to pinecone');
    const namespace = conveertToASCII(filekey);

    await chunkedUpsert(pineconeIndex, validVectors, namespace, 10);

    return documents[0];
}


async function embedDocument(doc: Document){
    try{
        const embeddings = await getEmbeddings(doc.pageContent);
        const hash = md5(doc.pageContent);

        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber,
            }
        };
    }
    catch(error){
        console.error('Error embedding document', error);
    }
}

export const truncateString = (str: string, byte: number) => {
    const encoder = new TextEncoder();
    return new TextDecoder('utf-8').decode(encoder.encode(str).slice(0, byte));
}
//we dont need every text in the pdf, so we prepare a docs with only few important stuff

async function preparePDF(page: PDFPage){
    let { pageContent, metadata } = page;
    pageContent = pageContent.replace(/\n/g, " "); //remove newlines

    //split the docs
    const splitter = new RecursiveCharacterTextSplitter();
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncateString(pageContent, 36000) //truncate the text to 1000 bytes (or any limit you want)
            }
        })
    ]);
    return docs;
}