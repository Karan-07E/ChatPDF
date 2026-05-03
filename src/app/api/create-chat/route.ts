import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { loadS3toPinecone } from "@/app/api/vectors/pinecone";
import { getS3Url } from "@/lib/s3Url";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { get } from "http";

// /api/create-chat
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log(file_key, file_name);
    const pages = await loadS3toPinecone(file_key);
    
    //create a new chat in the database
    const chat_id = await db.insert((chats)).values({
      filekey: file_key,
      pdfname: file_name,
      pdfurl: getS3Url(file_key),
      userId,
    }).returning({
      insertedId: chats.id
    });

    return NextResponse.json({
      chat_id: chat_id[0].insertedId,
    }, { status: 200 });
  } 
  catch (error) {
    console.error(error);
    
    // Check for specific error types
    const errorMessage = error instanceof Error ? error.message : "internal server error";
    
    if (errorMessage.includes("quota") || errorMessage.includes("429")) {
      return NextResponse.json(
        { error: "OpenAI API quota exceeded. Please check your billing and API plan." },
        { status: 402 }
      );
    }
    
    if (errorMessage.includes("Failed to download") || errorMessage.includes("NoSuchKey")) {
      return NextResponse.json(
        { error: "Failed to download file from S3. Please try uploading again." },
        { status: 400 }
      );
    }
    
    if (errorMessage.includes("embeddings")) {
      return NextResponse.json(
        { error: "Failed to generate embeddings. " + errorMessage },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}