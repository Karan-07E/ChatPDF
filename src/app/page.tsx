import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LogIn } from "lucide-react"
import FileUpload from "@/components/fileupload";

export default async function Home() {
  const {userId} = await auth();
  const isAuth = !!userId

  return (
     <div className="w-screen min-h-screen bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold duration-200 hover:text-gray-500 hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] cursor-pointer">
              Chat with any PDF
            </h1>
            <UserButton />
           </div>
           <div className="flex mt-2">
              {isAuth && 
                <Button className="p-4">Go to chats</Button>
              }
            </div>
            <p className="max-w-xl mt-1 text-lg text-slate-600">
              Upload your PDF and start chatting with it. Get instant answers, summaries, and insights from your documents.
            </p>
            <div className="w-full mt-4">
              {isAuth ? (
                <FileUpload />
              ):(
                <Link href="/sign-in">
                  <Button className="p-5">
                    Login to get started
                    <LogIn className="w-4 h-4 ml-1"/>
                  </Button>
                </Link>
              )}
            </div>
        </div>
      </div>
     </div>
  );
}