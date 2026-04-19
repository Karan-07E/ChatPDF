import AWS from 'aws-sdk';

export async function uploadToS3(file: File){
    try {
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
        });

        const s3 = new AWS.S3({
            params: {
                BUCKET: process.env.NEXT_PUBLIC_S3_BUCKET_NAME
            },
            region: process.env.NEXT_PUBLIC_S3_REGION,
        });

        const file_key = `/uploads` + Date.now().toString() + file.name.replace(' ', '-');

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key: file_key,
            Body: file
        }

        const upload = s3.putObject(params).on('httpUploadProgress', evt => {
            console.log('uploading to S3...', parseInt(((evt.loaded*100) / evt.total).toString() + '%'));
        }).promise();

        await upload.then(data => {
            console.log('successfully uploaded to S3!', file_key);
        })

        Promise.resolve({
            file_key,
            file_name: file.name
        }); //because its async function, we need to return a promise
    }
    catch (error){
        console.log('error uploading to S3', error);
    }
}

export function getS3Url(file_key: string){
        const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${file_key}`; //a speciffic format for s3 files on aws
        return url;
}