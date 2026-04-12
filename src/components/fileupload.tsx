'use client'
import { Inbox } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";

const FileUpload = () => {
    const { getRootProps, getInputProps } = useDropzone({
        accept: {"application/pdf": ['.pdf']},
        maxFiles: 1,
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