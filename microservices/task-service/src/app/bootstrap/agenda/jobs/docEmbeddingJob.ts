import { loadDocument } from "@/knowledgebase/document-loader/document-loader";
import { kbEmbeddingPipeline } from "@/knowledgebase/pipelines/kbEmbedddingPipeline";
import { docEmbedding } from "@/memoryAgent/pipelines/embedding-pipeline";
import { Document } from "@langchain/core/documents";


export function runJobs(agenda: any) {
    console.log("job defined.....")
    agenda.define('docEmbeddingJob', async (job: any) => {
        const { userId,agentId, content } = job.attrs.data;
        await docEmbedding({
            userId,
            agentId,
            allDocs: [

                new Document({
                    pageContent: content,
                    metadata: {
                        title: "user daily log summary",
                        userId,
                        agentId
                    }
                })

            ]
        })

    })



     agenda.define('knowledbaseJob', async (job: any) => {
        const { userId,filePath } = job.attrs.data;

        console.log("run job ://",{userId,filePath })
            const documentContent=await loadDocument(filePath)
            await kbEmbeddingPipeline({allDocs:documentContent,userId})
        

    })
}