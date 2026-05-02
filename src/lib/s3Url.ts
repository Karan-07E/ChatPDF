export function getS3Url(file_key: string){
        const url = `https://${process.env.S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${file_key}`;
        return url;
}