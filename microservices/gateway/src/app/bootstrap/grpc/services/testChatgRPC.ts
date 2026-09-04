

import { Response, Request, NextFunction } from "express";
import { chatClient } from "../gRPCTaskClient";


export async function testChatgRPC(req: Request, res: Response, next: NextFunction) {
    try {

        const { userId, threadId, agentId, message } = req.body;


        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();


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

        

    } catch (error) {
        next(error)
    }
}