
import { PGVectorStore, PGVectorStoreArgs } from "@langchain/pgvector";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { initPgVector } from "@/app/config/pgVector";
import { v4 as uuidv4 } from 'uuid';
import type { Document } from "@langchain/core/documents";


async function loadRawDocs(allDocs:Document[]) {
    
    return allDocs.flat();
}

async function createParentDocs(props:{rawDocs:Document[],userId:string,agentId:string}) {
    const {rawDocs,userId,agentId}=props
    const parentSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 400 });
    const parentSplits = await parentSplitter.splitDocuments(rawDocs);

    return parentSplits.map((split) => {
        const chunkId = uuidv4();  // UNIQUE ID per chunk
        split.metadata.docType = "parent";
        split.metadata.chunkId = chunkId;
        split.metadata.parentId = chunkId;  // Self-reference
        split.metadata.source = chunkId;
          split.metadata.userId = userId;  
          split.metadata.agentId = agentId;  

 
        return split;
    });
}

async function createChildDocs(props:{parentDocs:Document[],agentId:string,userId:string}) {
    const {parentDocs,userId,agentId}=props
    const childSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 800, chunkOverlap: 100 });
    const childSplits = await childSplitter.splitDocuments(parentDocs);

    return childSplits.map((split, i) => {
        // Get parent metadata for this child
        const parentIndex = Math.floor(i / 4); // ~4 children per parent chunk
        const parentMetadata = parentDocs[parentIndex]?.metadata;

        split.metadata.docType = "child";
        split.metadata.parentId = parentMetadata?.chunkId;  // Link to parent UUID
        split.metadata.chunkId = `child-${parentMetadata?.chunkId}-${i}`;
        split.metadata.source = split.metadata.chunkId;
         split.metadata.userId = userId;  
         split.metadata.agentId = agentId; 
     
        return split;
    });
}

export async function docEmbedding(props: { allDocs: Document[],agentId:string, userId: string }) {
    const { allDocs, userId ,agentId} = props;
    
    const embeddings = new CohereEmbeddings({
        model: "embed-english-v3.0",
        apiKey: process.env.COHERE_API_KEY,
    });

    console.log("🔄 Loading raw documents...");
    const rawDocs = await loadRawDocs(allDocs);

    console.log("🔄 Creating parent chunks...");
    const parentDocs = await createParentDocs({ rawDocs, userId ,agentId});
    // console.log('parentDoc   : ', parentDocs);

    console.log("🔄 Creating child chunks...");
    const childDocs = await createChildDocs({ parentDocs, userId ,agentId});

    console.log("💾 Storing in PostgreSQL (pgvector)...");
   

    // 2. Initialize the vector store using the factory method
    const vectorStore = await initPgVector(embeddings);

    // Store BOTH parent and child chunks in same table
    await vectorStore.addDocuments([...parentDocs, ...childDocs]);

    console.log(`✅ Single table: ${parentDocs.length} parent chunks + ${childDocs.length} child chunks`);
    console.log(`📊 Total documents: ${parentDocs.length + childDocs.length}`);
}
