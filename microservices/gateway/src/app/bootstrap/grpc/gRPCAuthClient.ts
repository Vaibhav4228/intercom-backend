import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { Response, Request, NextFunction } from "express";
import path from "path";

const PROTO_PATH = path.join("/app", "proto", "auth.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const proto = grpc.loadPackageDefinition(packageDefinition).auth as any;

const gRPCAuthClient = new proto.AuthService(
    "auth-service:50053",
    grpc.credentials.createInsecure(),
    
);






export function registerUsergRPC(req:Request,res:Response,next:NextFunction){
    try {

        gRPCAuthClient.registerUser({
                email: req.body?.email,
                password: req.body?.password,
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







   
export function verifyUserEmailgRPC(req:Request,res:Response,next:NextFunction){
    try {

        gRPCAuthClient.verifyUserEmail({
                email: req.body?.email,
                otpCode: req.body?.otpCode,
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







export function loginUsergRPC(req:Request,res:Response,next:NextFunction){
    try {

        gRPCAuthClient.loginUser({
                email: req.body?.email,
                password: req.body?.password,
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
