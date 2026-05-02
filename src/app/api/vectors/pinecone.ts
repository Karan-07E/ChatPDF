import { Pinecone } from "@pinecone-database/pinecone";
import { downloadfromS3 } from "@/lib/s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document, RecursiveCharacterTextSplitter } from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "@/lib/embeddings";
import md5 from "md5";

let pinecone: Pinecone | null = null;

export const getPineconeClient = () => {
    if (!pinecone) {
        pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
    }
    return pinecone;
};

type PDFPage = {
    pageContent: string;    //custom type of our page content as required to me
    metadata: {
        loc: {pageNumber: number}
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
}


//3. now vectorizing the docs and upload to pinecone
async function embedDocument(doc: Document){
    try{
        const embeddings = await getEmbeddings(doc.pageContent);
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