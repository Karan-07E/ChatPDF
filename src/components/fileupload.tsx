"use client";
import { Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/uploads", formData);
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds limit");
        return;
      }
      try {
        setUploading(true);
        mutate(file, {
          onSuccess: async (uploadResponse) => {
            const { file_key, file_name } = uploadResponse;
            try {
              const chatResponse = await axios.post("/api/create-chat", {
                file_key,
                file_name,
              });
              toast.success("chat created!");
              router.push(`/chat/${chatResponse.data.chat_id}`);
            } catch (error: any) {
              console.error("Error creating chat:", error);
              const errorMessage = error.response?.data?.error || "Failed to create chat";
              toast.error(errorMessage);
            }
          },
          onError: (error) => {
            console.error("Error uploading file:", error);
            toast.error("Failed to upload file to S3");
          },
        });
      } catch (error) {
        console.log("Something went wrong");
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-gray-300 rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 border-gray-400 rounded-xl cursor-pointer bg-gray-200 py-8 flex flex-col justify-center items-center",
        })}
      >
        <input {...getInputProps()} />
        {isPending || uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
            <p className="text-sm mt-2 text-slate-400">
              Hang On, Uploading Your PDF...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-purple-800" />
            <p className="mt-2 text-slate-400 text-sm">Drop Your PDF Here </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
