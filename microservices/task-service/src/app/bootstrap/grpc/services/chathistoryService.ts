

import { ChatHistoryService } from "@/services/ChatHistoryService";


export async function getChatHistory(call: any, callback: any) {
    try {
          const { userId,threadId, agentId } = call.request;
           const chatHistory=ChatHistoryService.getInstance()
        
        const messages =await chatHistory.getChatHistory({userId,threadId, agentId})

        callback(null, {
            messages: messages,
        });

    } catch (err) {
        callback(err, null);
    }
}

