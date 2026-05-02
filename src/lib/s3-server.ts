import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

export const downloadfromS3 = async (filekey: string) => {
    try {
        const s3 = new S3Client({
            region: process.env.S3_REGION!,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            }
        })

        const params = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: filekey,
        }

        const obj = await s3.send(new GetObjectCommand(params));

        const filename = `/tmp/pdf-${Date.now()}.pdf`;
        fs.writeFileSync(filename, Buffer.from(await obj.Body!.transformToByteArray()));

        return filename;
    }
    catch(error){
        console.error('error downloading from S3', error);
        return null;
    }
}