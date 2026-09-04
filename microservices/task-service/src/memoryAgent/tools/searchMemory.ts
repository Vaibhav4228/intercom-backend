import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Document } from "@langchain/core/documents";
import { queryVectordb } from "../pipelines/retrieving-pipeline";
import { customLLMExtractor } from "../pipelines/customer-llm-extrator";
import { WorkingMemoryArchiveService } from "@/services/WorkingMemoryArhiveService";
import { bm25Retriever } from "../pipelines/BM25Retriever-pipeline";

export const formatDocumentsAsString = (documents: Document[]) => {
    return documents.map((doc) => doc?.pageContent).join("\n\n");
};

export const searchMemoryTool = tool(
    async ({ query }, config) => {

        const userId = config.configurable?.userId;
        const threadId = config.configurable?.threadId;
        const agentId = config.configurable?.agentId;


        let relevantLongTermMemory = ''

        const workingMemoryArchive = WorkingMemoryArchiveService.getInstance()

        const vectorData = await queryVectordb({ userId: userId,agentId, query })
        const docToString = formatDocumentsAsString(vectorData?.retrievedDocs)
        relevantLongTermMemory += `\n\n#<data_retrieved_from_vector_db> \n${docToString}\n\n</data_retrieved_from_vector_db>`


        const workingMemoryArchiveData = await workingMemoryArchive.convertWorkingMemoryArchiveToMarkdown({ userId,agentId, threadId })
        const bm25Data = await bm25Retriever(workingMemoryArchiveData, query)
        relevantLongTermMemory += `\n\n#<data_retrieved_from_daily_log_archive> ${bm25Data}</data_retrieved_from_daily_log_archive>`;


        // this is an extraction layer
        const filteredData = await customLLMExtractor(query, relevantLongTermMemory)
        const longTermMemory = `# Relevant LTM Layer\n${filteredData || "No relevant long-term memories found."}`
        
        return `${longTermMemory}`
    },
    {
        name: "search_memory",
        description: `
Retrieve relevant long-term memory (LTM) entries based on the user query.

This tool searches a vector database of previously stored summaries and returns
high-level contextual information about the user, such as preferences, goals,
past interactions, and important background knowledge.

Use this tool when:
- The query depends on past conversations or long-term context
- You need to recall user-specific information (preferences, habits, goals, etc.)
- The current input is ambiguous and may benefit from historical context
- Personalization or continuity is required

Do NOT use this tool for:
- Simple factual questions that do not depend on user history
- Real-time or short-term conversation context (use short-term memory instead)

Returns:
- A list of summarized memory entries relevant to the query
`,
        schema: z.object({
            query: z.string().describe("The semantic search query used to retrieve relevant long-term memory.")
        }),
    }
);


