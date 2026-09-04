import { graph } from "@/graph";
import * as grpc from "@grpc/grpc-js";



export async function Chat(call: grpc.ServerWritableStream<any, any>) {
    const { userId,threadId, message,agentId } = call.request;

    const graphStream = await graph.stream(
        {
            messages: [{ role: "user", content: message }],
            userId,threadId,agentId
        },
        {
            streamMode: "custom",
            subgraphs: true,
            recursionLimit: 400,
            configurable: {
                userId
            },
        }
    );

    let inThinking = false;

    for await (const [, chunk] of graphStream) {

        const content = (chunk as any).content;
        if (!content) continue;

        const parts = content.split(/(<think>|<\/think>)/);
        for (const part of parts) {

            if (part === "<think>") {
                inThinking = true;
                continue;
            }

            if (part === "</think>") {
                inThinking = false;
                continue;
            }

            if (!part) continue;

            call.write({
                type: inThinking ? "THINKING" : "CONTENT",
                content: part
            });
        }
    }

    call.write({
        type: "DONE",
        content: ""
    });

    call.end();
}



