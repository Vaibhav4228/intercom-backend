

import { Response, Request, NextFunction } from "express";
import { chatClient } from "../gRPCTaskClient";
import { broadcast } from "../../websocket/websocketServer";


export async function postChatgRPC(req: Request, res: Response, next: NextFunction) {
    try {

        const { userId, threadId, agentId, message,sender,takeOverChat } = req.body;


        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();




        if (takeOverChat) {

            // WebSocket broadcast
            broadcast({
                type: "takeOverChat",
                threadId,
                agentId,
                userId,
                takeOverChat,
                sender,
                message: message,
            });


            res.write(`event:end\ndata:${JSON.stringify({
                reason: "human_takeover"
            })}\n\n`);
            // Close SSE connection
            res.end();


        } else {




            // WebSocket broadcast
            broadcast({
                type: "userMessage",
                threadId,
                agentId,
                userId,
                message: message,
            });

            const grpcStream = chatClient.Chat({
                userId,
                message,
                threadId,
                agentId
            });

            grpcStream.on("data", (chunk: any) => {


                switch (chunk.type) {
                    case "CONTENT":
                        res.write(
                            `event:message\ndata:${JSON.stringify({
                                message: chunk.content
                            })}\n\n`
                        );

                        // WebSocket broadcast
                        broadcast({
                            type: "CONTENT",
                            threadId,
                            agentId,
                            message: chunk.content,
                        });


                        break;

                    case "THINKING":
                        res.write(
                            `event:thinking\ndata:${JSON.stringify({
                                thinking: chunk.content
                            })}\n\n`
                        );
                        break;

                    case "DONE":
                        res.write(`event:end\ndata:{}\n\n`);
                        res.end();
                        break;
                }
            });

            grpcStream.on("error", (err: any) => {

                res.write(
                    `event:error\ndata:${JSON.stringify({
                        error: err.message
                    })}\n\n`
                );

                res.end();

            });

            grpcStream.on("end", () => {
                res.end();
            });

        }

    } catch (error) {
        next(error)
    }
}