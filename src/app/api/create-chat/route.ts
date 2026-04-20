import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // S3 upload (server-side, has access to env vars)
        const s3Client = new S3Client({
            region: process.env.S3_REGION!,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            }
        });

        const file_key = `/uploads/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const buffer = await file.arrayBuffer();

        const params = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: file_key,
            Body: new Uint8Array(buffer),
            ContentType: file.type,
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        console.log('successfully uploaded to S3!', file_key);

        return NextResponse.json({
            file_key,
            file_name: file.name
        });
    }
    catch (error) {
        console.error('error uploading to S3', error);
        return NextResponse.json({ error: 'Failed to upload file to S3' }, { status: 500 });
    }
}