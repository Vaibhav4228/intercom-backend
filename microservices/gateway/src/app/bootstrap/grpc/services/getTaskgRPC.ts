
import { Response, Request, NextFunction } from "express";
import { taskClient } from "../gRPCTaskClient";



export function getTaskgRPC(req:Request,res:Response,next:NextFunction){
    try {

        taskClient.GetTasks({}, (err: any, response: any) => {
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
