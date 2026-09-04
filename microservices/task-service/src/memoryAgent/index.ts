

import { createAgent, createMiddleware, HumanMessage } from "langchain";
import { MEMORY_BASE_SYSTEM_PROMPT } from "./prompt/memo-prompt";
import { writeMemoryTool } from "./tools/writeMemory";
import { ContextAssembler } from "./context/ContextAssembler";
import { searchMemoryTool } from "./tools/searchMemory";
import { toolMonitoringMiddleware } from "@/app/middleware/toolMonotoringMiddleware";
import { delegateAgentTool } from "./tools/delegate";

export type memoAgentInput = {
    model: any
    modelContextLimit?: number
    userId: string
    threadId: string
    agentId: string
}

/**
 * 
 * Memory augmented agent
 */
export async function memoAgent({
    model = "",
    modelContextLimit = 3000,
    userId = "",
    threadId = "", agentId = ""
}: memoAgentInput) {

    const contextAssembler = new ContextAssembler({ agentId, userId, threadId, modelContextLimit })

    const agent = createAgent({
        model,
        tools: [writeMemoryTool, searchMemoryTool, delegateAgentTool],
        systemPrompt: MEMORY_BASE_SYSTEM_PROMPT,
        middleware: [toolMonitoringMiddleware]
    });


    async function streamAgent(userInput: string, config: any) {
        // write to chat history 

        let fullContent = "";

        const { llmContext } = await contextAssembler.assembleContext(userInput)

        for await (const chunk of await agent.stream(
            { messages: [{ role: "user", content: llmContext }] },
            {
                ...config,
                streamMode: "updates",
                callbacks: [],
                configurable: {
                    ...config?.configurable,
                    threadId,
                    userId,
                    agentId
                }
            }
        )) {
            const updates = chunk?.tools?.messages
            const req = chunk?.model_request?.messages;


            // Handle Routing logic
            if (updates && updates.length > 0) {

                if (updates[0].name === "delegate_agent") {

                    console.log("====HANDLE ROUTING LOGIC====")
                    fullContent += '<think>' + updates[0].content + '</think>'
                    
                    return { fullContent, llmContext }
                }
            }

            if (req && req.length > 0) {
                const aiMsg = req[0];
                const content = aiMsg?.content ?? "";

                const hasToolCalls = (aiMsg as any)?.tool_calls && (aiMsg as any)?.tool_calls.length > 0;


                if (hasToolCalls) {
                    // ai thinking
                    fullContent += content
                    config.writer({
                        manager_name: "memoryManager",
                        content: '<think>' + content + '</think>'
                    });

                } else {
                    fullContent += content;
                    config.writer({
                        manager_name: "memoryManager",
                        content: content
                    });

                }
            }
        }

        // write to chat history
        return { fullContent, llmContext }
    }


    return {
        streamAgent
    }

}