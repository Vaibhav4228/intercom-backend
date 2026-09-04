
import {
    Command,
    END,
} from "@langchain/langgraph";
import {
    AIMessage
} from "@langchain/core/messages";
import { WorkingMemoryService } from "@/services/WorkingMemoryService";
import { workerAgent } from "@/workerAgent/workerAgent";
import { removeThinkTag } from "@/utils/removeThinkTag";
import { ChatHistoryService } from "@/services/ChatHistoryService";


export const workerAgentNode = async (state: any, config: any) => {
    const { userId, threadId, agentId } = state


    const last = state.messages
        .filter((m: any) => m._getType() === "ai")
        .slice(-1)[0];

    const cleanMessage = removeThinkTag(last?.content)
    const workingMemory = WorkingMemoryService.getInstance()
    const chatHistory = ChatHistoryService.getInstance()

    const input = `
    <ongoing_user_input>  
    Message from Manager 
    Agent on behalf of the user : ${cleanMessage}
    </ongoing_user_input>
    \n\n
   <chat_history_data>  ${state.workerAgentContext}</chat_history_data> `


    const aiMessage = await workerAgent({ userInput: input, agentId, config, userId }) as any



    const [] = await Promise.all([
        workingMemory.appendWorkingMemory({
            userId,
            role: "ai",
            content: aiMessage as string,
            threadId,
            agentId
        }),
        chatHistory.insertIntoChatHistory({ userId, agentId, threadId, role: "ai", message: aiMessage as string })

    ])


    return new Command({
        update: { messages: [new AIMessage(aiMessage)] },
        goto: END,
    });


};