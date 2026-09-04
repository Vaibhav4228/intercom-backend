
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { LLM } from "@/llm/LLM";
import { COMPRESSION_SYSTEM_PROMPT } from "../prompt/compression-prompt";






export async function compressSTM(content: string) {
    try {

        const llm = LLM.getInstance('fireworks_minimax')

        const res = await llm.invoke([
            new SystemMessage(COMPRESSION_SYSTEM_PROMPT),
            new HumanMessage(content),
        ]);


        return res?.content;
    } catch (error) {
        throw new Error("Compression pipeline : failed to compress content")
    }
}
