
import { createAgentgRPC, getAgentgRPC, getAgentsgRPC, updateAgentgRPC } from "@/app/bootstrap/grpc/services/agentgRPC";
import { getChathistorygRPC } from "@/app/bootstrap/grpc/services/getChathistorygRPC";
import { getTaskgRPC } from "@/app/bootstrap/grpc/services/getTaskgRPC";
import { postChatgRPC } from "@/app/bootstrap/grpc/services/postChatgRPC";
import { uploadFilegRPC } from "@/app/bootstrap/grpc/services/uploadgRPC";
import { VerifyExpressToken } from "@/middleware/jwt";
import { Router } from "express";
import { multerConfig } from "./multerConfig";
import { getCustomersgRPC } from "@/app/bootstrap/grpc/services/customergRPC";
import { getKnowledgeBasegRPC } from "@/app/bootstrap/grpc/services/getKnowledgeBasegRPC";
import { createSessiongRPC, getSessionsgRPC, updateSessiongRPC } from "@/app/bootstrap/grpc/services/sessiongRPC";
import { broadcast } from "@/app/bootstrap/websocket/websocketServer";


import { Response, Request, NextFunction } from "express";
import { testChatgRPC } from "@/app/bootstrap/grpc/services/testChatgRPC";

export function taskRoutes(router: Router) {
    router.get('/tasks', VerifyExpressToken, getTaskgRPC)
    router.post('/chats', postChatgRPC)
    router.get('/chathistory', getChathistorygRPC)
    router.post('/test-chats',testChatgRPC)


    // agent
    router.post('/agents', createAgentgRPC)
    router.put('/agents/:agentId', updateAgentgRPC)
    router.get('/agents/:agentId', getAgentgRPC)
    router.get('/agents', getAgentsgRPC)

    // end agent

    router.post(
        "/upload",
        multerConfig.single("file"),
        uploadFilegRPC
    );


    // customers

    router.get('/customers', getCustomersgRPC)
    router.get('/knowledbases', getKnowledgeBasegRPC)


    // sessions
    router.post('/sessions', createSessiongRPC)
    router.put('/sessions/:id', updateSessiongRPC)
    router.get('/sessions', getSessionsgRPC)

    router.get('/ai-take-over',async(
         req: Request,
          res: Response,
          next: NextFunction
    )=>{
        const actor=req.query.actor
          if(actor=="ai"){
                broadcast({
                    type: "takeOverChat",
                    takeOverChat:false,
                });
                return res.status(200).send({ message: "Success"})
            }

            if(actor=="human"){
                broadcast({
                    type: "takeOverChat",
                    takeOverChat:true,
                });
                return res.status(200).send({ message: "Success"})
            }

    })


          
    

    return router
}