import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function conveertToASCII(str: string){
  //remove non-ASCII characters
  const asciiString =  str.replace(/[^\x00-\x7F]/g, "");
  return asciiString;
}


