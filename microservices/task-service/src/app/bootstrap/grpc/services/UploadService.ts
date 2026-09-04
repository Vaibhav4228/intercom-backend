import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { loadDocument } from "@/knowledgebase/document-loader/document-loader";
import { kbEmbeddingPipeline } from "@/knowledgebase/pipelines/kbEmbedddingPipeline";
import { KnowledgeBaseService } from "@/services/knowledgeBaseService";
import { agenda } from "../../agenda/agenda";

export async function uploadFile(call: any, callback: any) {
  try {
    const {
      userId,
      filename,
      mimeType,
      file,
    } = call.request;

    const uploadDir = path.join(process.cwd(),"public", "uploads");

    await fs.mkdir(uploadDir, { recursive: true });

    const extension = path.extname(filename);
    const uniqueName = `${randomUUID()}${extension}`;

    const filePath = path.join(uploadDir, uniqueName);

    await fs.writeFile(filePath, file);

   
    
    const kb=KnowledgeBaseService.getInstance()
    const kbService=await kb.createKnowledgeBase({fileName:filename,userId})

    

     await agenda.now('knowledbaseJob',{
      filePath:`${uploadDir}/${uniqueName}`,
      userId
    })
    console.log("==== Finished running job====")


    callback(null, {
      success: true,
      message: "File uploaded successfully.",
      filePath,
    });
  } catch (err) {
    callback(err, null);
  }
}