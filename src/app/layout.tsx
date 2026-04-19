import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "ChatPDF",
  description: "a pdf rag",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/" >
      <Providers>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </Providers>
    </ClerkProvider>
  );
}
