
import { CohereEmbeddings } from "@langchain/cohere";
import {
    ContextualCompressionRetriever
} from "@langchain/classic/retrievers/contextual_compression";
import { LLMChainExtractor } from "@langchain/classic/retrievers/document_compressors/chain_extract";
import { LLM } from "@/llm/LLM";
import { initPgVector } from "@/app/config/pgVector";


export async function kbRetrievingPipeline(props: { userId: string, query: string }) {

    const { userId, query } = props;
    const kParents = 3;
    const embeddings = new CohereEmbeddings({
        model: "embed-english-v3.0",
        apiKey: process.env.COHERE_API_KEY,
    });

      const vectorStore = await initPgVector(embeddings);
    
    const childDocs = await vectorStore.similaritySearch(query, 6, {
        docType: "child-doc-knowledgebase",
        userId: userId
    });

    const parentChunkIds = [...new Set(childDocs.map(c => c.metadata.parentId))];

    if (parentChunkIds.length === 0) {
        return { query, retrievedDocs: [] };
    }

    const compressor = LLMChainExtractor.fromLLM(
        LLM.getInstance('fireworks_minimax')
    );

   const retriever = new ContextualCompressionRetriever({
        baseCompressor: compressor,
        baseRetriever: vectorStore.asRetriever({
            k: kParents,
            filter: {
                docType: "parent-doc-knowledgebase",
                source: { in: parentChunkIds }
            }
        })
    })


    const retrievedDocs = await retriever.invoke(query);

    return {
        query,
        retrievedDocs
    };
}
