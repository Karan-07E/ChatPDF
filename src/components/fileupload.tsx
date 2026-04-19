'use client'
import { Inbox } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type UploadPayload = {
        file_key: string;
        file_name: string;
};

const FileUpload = () => {
        const { mutate } = useMutation<unknown, Error, UploadPayload>({
            mutationFn: async ({ file_key, file_name }) => {
        const response = await axios.post("/api/create-chat", {
          file_key,
          file_name,
        });
        return response.data;
      },
    });


    const { getRootProps, getInputProps } = useDropzone({
        accept: {"application/pdf": ['.pdf']},
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            console.log(acceptedFiles);
            const file = acceptedFiles[0];

            if (!file) {
                return;
            }

            if(file.size > 10 * 1024 * 1024) {
                alert('File size exceeds 10MB limit');
                return;
            }

            try {
                const data = (await uploadToS3(file)) as UploadPayload | undefined; // upload to s3 and get the file key and name
                if(!data?.file_key || !data.file_name) {
                    alert('something went wrong');
                    return;
                }
                
                mutate(data, {
                    onSuccess: (responseData) => {
                        console.log(responseData);
                    },
                    onError: (err: Error) => {
                        console.log(err);
                    }
                })
            }
            catch(error) {
                console.log('Error uploading file:', error);
            }
        }
    });
    return (
        <div className="p-2 bg-gray-300 rounded-xl">
            <div {...getRootProps({
                className: "border-dashed border-2 border-gray-400 rounded-xl cursor-pointer bg-gray-200 py-8 flex flex-col justify-center items-center",
            })}>
                <input {...getInputProps()}/>
                <>
                    <Inbox className="w-10 h-10 text-purple-800"/>
                    <p className="mt-2 text-slate-400 text-sm">Drop Your PDF Here </p>
                </>
            </div>
        </div>
    );
}

export default FileUpload;