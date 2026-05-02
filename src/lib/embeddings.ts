import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

export async function getEmbeddings(text: string){
    try{
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.replace(/\n/g, " "),
        });
        if(!response.data?.length){
            throw new Error("No embedding returned from OpenAI");
        }
        
        return response.data[0].embedding;
    }
    catch(error){
        console.log("Error getting embeddings: ", error);
        throw error;
    }
}