
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { formatDocumentsAsString } from "@/memoryAgent/tools/searchMemory";
import { kbRetrievingPipeline } from "../../knowledgebase/pipelines/kbRetrievingPipeline";



export const searchKnowledgeBaseTool = tool(
  async ({ query }, config) => {
      const userId = config.configurable?.userId;
   

        const vectorData = await kbRetrievingPipeline({ userId: userId, query })
        const docToString = formatDocumentsAsString(vectorData?.retrievedDocs)

        console.log("========KNOW LEDGE BASE =======",{docToString})

       return `<Knowledgebase_data> \n${docToString}\n\n</Knowledgebase_data>`

  },
  {
    name: "search_knowledgebase",
    description: `
Search the organization's knowledge base to retrieve factual information needed to answer user questions.

Use this tool whenever the answer depends on company-specific or business-specific information that is not part of your general knowledge.

The knowledge base may contain:
- Frequently Asked Questions (FAQs)
- Product documentation and feature descriptions
- Product specifications
- Pricing, plans, subscriptions, and licensing information
- Company policies and procedures
- Enterprise documentation
- Internal knowledge articles
- Troubleshooting guides
- User manuals
- API and technical documentation
- Business processes
- Customer support articles
- Service limitations
- Release notes
- Any indexed enterprise documents

Always use this tool before answering questions about products, services, pricing, company policies, documentation, or any organization-specific information. Base your response on the retrieved knowledge rather than making assumptions.

If the retrieved information is incomplete, answer only with what was found and clearly state any missing details.
`,
    schema: z.object({
      query: z.string().describe(
        "A natural language search query describing the information to retrieve from the knowledge base. Include key product names, topics, error messages, or relevant details."
      ),
    }),
  }
);