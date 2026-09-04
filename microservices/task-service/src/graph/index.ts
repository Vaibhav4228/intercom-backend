import {
    END,
    START,
    StateGraph, StateSchema,
    ReducedValue,
    MessagesValue
} from "@langchain/langgraph";

import z from "zod/v4";
import { memoryAgentNode } from "./nodes/memoryAgentNode";
import { workerAgentNode } from "./nodes/workerAgentNode";

export const MessagesState = new StateSchema({
    messages: MessagesValue,
    userId: z.string().default(''),
    threadId: z.string().default(''),
    agentId: z.string().default(''),
    nextNode: z.string().default(''),
    workerAgentContext: z.string().default(''),
});


const workflow = new StateGraph(MessagesState)
    .addNode("memoryAgent", memoryAgentNode)
    .addNode("workerAgent", workerAgentNode)

    .addEdge(START, "memoryAgent")
    .addConditionalEdges('memoryAgent', (state) => {
        if (state.nextNode === "workerAgent") {
            return "workerAgent"
        }
        return END
    })
    .addEdge("workerAgent", END)
.addEdge("memoryAgent", END)


export const graph = workflow.compile();