import { tool } from "@langchain/core/tools";
import z from "zod";



const SUB_AGENTS = ["workerAgent"]

export const delegateAgentTool = tool(
    async ({ context, agent_name }, config) => {
        try {
            if (agent_name == "workerAgent") {
                console.log('===IN DELEGATE AGENT TOOL====')
                return `<think>__TRANSFER_WORKER_AGENT__ + ${context}</think>`;
            }

        } catch (error) {
            return JSON.stringify({ error: "failed to deleage task to the worker agent" })
        }

    },
    {
        name: "delegate_agent",
        description: `this tool allows you to transfert control to another Agent.
    you should return this to the user to as final response to initiate transfert
   
    eg:
    <think>__TRANSFER_WORKER_AGENT__+
    The user wants you to check the example folder for the multi-agent-builder skill. They noticed that in some examples, there's a tool object passed to an agent but the icon prop for image is missing. Please investigate the example files and identify 
    where the icon prop is missing from tool objects that are passed to agents.
    </think>
    Note you should respect this format:

    <think>__TRANSFER_WORKER_AGENT__ + context 
    </think>

    Available agents:${SUB_AGENTS.join(',')} Is a B2B conversetional Agent
    `,
        schema: z.object({
            context: z.string().describe(
                "Context to Transfert to another agent"
            ),
            agent_name: z
                .enum(SUB_AGENTS)
                .describe("agent to delegate the work or user input"),
        }),
    }
);


