



import { Response, Request, NextFunction } from "express";
import { chathistoryClient } from "../gRPCTaskClient";




export function getChathistorygRPC(req:Request,res:Response,next:NextFunction){
    try {
        
        const {userId,threadId,agentId}=req.query


         chathistoryClient.GetChatHistory({
            userId,
            threadId,
            agentId
        }, (err: any, response: any) => {
                if (err) {
                    return res.status(500).json({
                        message: err.message,
                    });
                }

                return res.json(response);
            }
        );
        
    } catch (error) {
        next(error)
    }
}
