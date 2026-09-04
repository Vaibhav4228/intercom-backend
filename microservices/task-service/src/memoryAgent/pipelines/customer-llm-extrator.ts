
import { LLM } from "@/llm/LLM";
import { createAgent, HumanMessage } from "langchain";
import { CUSTOM_LLM_EXTRACTOR_PROMPT } from "../prompt/llm-extrator-prompt";


export async function customLLMExtractor(query: string, doc: string) {



  const llm = LLM.getInstance('fireworks_minimax')
  const agent = createAgent({
    model: llm,
    systemPrompt: CUSTOM_LLM_EXTRACTOR_PROMPT
  })


  const agentOutput = await agent.invoke({
    messages: [new HumanMessage(`
            User Question:
            <user_questions>
            ${query}
            </user_questions>

            Retrieved Data:
            <retrieved_data>
            ${doc}
            </retrieved_data>

      `)],
  });
  const aiResponse = agentOutput.messages[agentOutput.messages.length - 1]?.content
  return aiResponse

}

