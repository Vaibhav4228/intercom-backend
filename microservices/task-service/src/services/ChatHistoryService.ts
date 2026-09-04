import { ChatHistory, IMessage, MessageType } from "@/models/chathistoryModel";
import { randomUUID } from "crypto";

interface InsertIntoChatHistoryParams  {
    userId: string;
    threadId: string
    agentId:string
    role:MessageType;
    message: string;
}

export class ChatHistoryService {

    private static instance: ChatHistoryService;

    public static getInstance(): ChatHistoryService {
        if (!ChatHistoryService.instance) {
            ChatHistoryService.instance = new ChatHistoryService();
        }
        return ChatHistoryService.instance;
    }


    async insertIntoChatHistory({ userId, threadId,agentId, message ,role}: InsertIntoChatHistoryParams) {

       try {
          await ChatHistory.create({
            userId,
            threadId,
            agentId,
            messages: [
                {
                    id: randomUUID(),
                    threadId,
                    role,
                     agentId,
                    userId,
                    content: message,
                    hitl: {
                        status: false,
                    },
                },
            ],
        });
       } catch (error) {
        throw new Error("Failed to insert in chathistory")
       }
    }


    async getChatHistory(props:{
         agentId:string
        userId:string,
        threadId: string
   } ): Promise<IMessage[]> {
    const {userId,threadId, agentId}=props
       try {
        
          const chatHistories = await ChatHistory.find(
            { userId,threadId , agentId},
            { messages: 1, _id: 0 }
        )
        .sort({ createdAt: 1 })
        .lean();


        const data= chatHistories.flatMap(
            (chat) => chat.messages
        );

     
return data
       } catch (error) {
        throw new Error("Failed to retrieve chathistory")
       }
    }

}

