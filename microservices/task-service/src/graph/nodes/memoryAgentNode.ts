
import { memoAgent } from "@/memoryAgent";
import {

    GraphNode,
    Command,
    END,
} from "@langchain/langgraph";
import {
    AIMessage
} from "@langchain/core/messages";
import { MessagesState } from "..";
import { LLM } from "@/llm/LLM";
import { ChatHistoryService } from "@/services/ChatHistoryService";
import { WorkingMemoryService } from "@/services/WorkingMemoryService";
import { getNextNode } from "@/utils/getNextNode";


export const memoryAgentNode: GraphNode<typeof MessagesState> = async (state, config: any) => {

    const { userId, agentId, threadId } = state

    const lastHuman = state.messages
        .filter((m: any) => m._getType() === "human")
        .slice(-1)[0];


    const llm = LLM.getInstance('fireworks_glm')
    const chatHistory = ChatHistoryService.getInstance()
    const workingMemory = WorkingMemoryService.getInstance()

    const { streamAgent } = await memoAgent({ model: llm, threadId, userId, agentId })


    const [result, c, w] = await Promise.all([
        streamAgent(lastHuman?.content as string, config),
        chatHistory.insertIntoChatHistory({
            userId, agentId,
            threadId,
            role: "user",
            message: lastHuman?.content as string
        }),
        workingMemory.appendWorkingMemory({
            agentId,
            userId,
            role: "user",
            content: lastHuman?.content as string,
            threadId
        })
    ])


    const [] = await Promise.all([
        workingMemory.appendWorkingMemory({
            agentId,
            userId,
            role: "ai",
            content: result?.fullContent as string,
            threadId

        }),


    ])


    const { nextNode, shouldHandoff } = getNextNode(result?.fullContent)

    // we remove transfer message from chathistory
    // we only take the final message
    if (!shouldHandoff) {
        await chatHistory.insertIntoChatHistory({
            userId,
            agentId,
            threadId,
            role: "ai", message: result?.fullContent as string
        })
    }




    if (shouldHandoff) {
        return new Command({
            update: {
                messages: [new AIMessage(result?.fullContent)],
                nextNode: nextNode,
                workerAgentContext: result?.llmContext
            },
            goto: nextNode,
        });
    }



    return new Command({
        update: { messages: [new AIMessage(result?.fullContent)], nextNode: END },
        goto: END
    });

    

}