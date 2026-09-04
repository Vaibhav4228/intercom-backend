// loaders.js


import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";





export async function loadPDF(filePath:string) {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();
   return docs
}



export async function loadDocument(
  filePath: string
) {

  const docNameExtentionWithoutDot=path.extname(filePath).replace('.',' ')
  let docs=null;

  switch  (docNameExtentionWithoutDot.trim()) {
    case 'pdf':
      docs = await loadPDF(filePath);
      break;
    default:
      throw new Error(`Unsupported file `);
  }

  return docs
}






