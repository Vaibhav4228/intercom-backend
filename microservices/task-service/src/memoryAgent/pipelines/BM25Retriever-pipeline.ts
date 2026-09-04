
import { BM25Retriever } from "@langchain/community/retrievers/bm25";

import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { formatDocumentsAsString } from "../tools/searchMemory";




export async function bm25Retriever(document:string, query:string) {
    const newDoc = new Document({
        pageContent: document,
        metadata: {
            title: "user   :" + "DAILY_LOG_ARCHIVE"
        }
    })

    
    const docSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1200, chunkOverlap: 300 });
    const splitDocs = await docSplitter.splitDocuments([newDoc]);

    const retriever = BM25Retriever.fromDocuments([...splitDocs], { k: 4 });

    // Will return the 4 documents reranked by the BM25 algorithm
    const data = await retriever.invoke(query);
    
    const docTostring = formatDocumentsAsString(data)


    return docTostring
}


