

import { tool, createAgent, createMiddleware } from "langchain";
import {
    HumanMessage,
    AIMessage,
} from "@langchain/core/messages";
import { LLM } from "../llm/LLM";
import { generateB2BWebAgentPrompt } from "./prompt";
import { AgentService } from "@/services/AgentService";
import { Types } from "mongoose";
import { searchKnowledgeBaseTool } from "@/workerAgent/tools/seachKnowledgeBaseTool";
import { captureLeadTool } from "./tools/captureLeadTool";
import { updateLeadTool } from "./tools/updateLeadTool";




export async function workerAgent( props: { userId: Types.ObjectId,agentId:string ,userInput: string, config: any, }) {

   try {
     
    const {userId,agentId,userInput,config}=props
    console.log('=======================INSIDE WORKER AGENT=================')
    
    // For the Main Manager Agent
    const agentService = AgentService.getInstance();
    const agentData = await agentService.getAgentById({ userId, agentId })

    const buildPrompt = generateB2BWebAgentPrompt({
        category: agentData?.category as string,
        userId:agentData?.userId,
        persona: agentData?.persona as string,
        goal:agentData?.goal as string,
        name: agentData?.name as string,
        companyContext: agentData?.companyContext as string
    })
    // 
    const agent = createAgent({
        model: LLM.getInstance('fireworks_minimax'),
        systemPrompt: buildPrompt,
        tools: [
            searchKnowledgeBaseTool,captureLeadTool,updateLeadTool
        ],

    });


    const agentStream = await agent.stream(
        {
            messages: [
                new HumanMessage(` <user_instructions>
                     userInput:${userInput}
                     </user_instructions> `),
            ]
        },
        {
            ...config,
            streamMode: "updates", 
             callbacks: [], 
            configurable: {
                ...config?.configurable,
                userId,
                agentId
            }
        }
    );




    let fullContent = "";

    for await (const chunk of await agentStream) {
        const updates = chunk?.tools?.messages
        const req = chunk?.model_request?.messages;

        if (updates && updates.length > 0) {
            //tool message goes here
        }


        if (req && req.length > 0) {
            const aiMsg = req[0];
            const content = aiMsg?.content ?? "";

            const hasToolCalls = (aiMsg as any).tool_calls && (aiMsg as any).tool_calls.length > 0;

            if (hasToolCalls) {
                // ai thinking

            } else {
                fullContent += content;
                config.writer({
                    manager_name: "workerAgent",
                    content: content
                });

            }
        }
    }


    return fullContent

   } catch (error) {
    console.log("Error occur in worker agent ://"+(error as Error)?.message)
    
   }

}
