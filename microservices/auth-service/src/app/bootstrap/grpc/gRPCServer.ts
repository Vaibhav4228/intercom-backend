import { loginUserController } from "@/app/http/controllers/loginUserController";
import { registerUserController } from "@/app/http/controllers/registerUserController";
import { verifyUserEmailController } from "@/app/http/controllers/VerifyEmailController";
import { PORT } from "@/index";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import crypto from "crypto";
import path from "path";

export const PROTO_PATH = path.join("/app", "proto", "auth.proto");


const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const auth = proto.auth;


async function registerUser(call: any, callback: any) {
    try {
        const response = await registerUserController({
            email: call?.request?.email,
            password: call?.request?.password
        })
        callback(null, response)

    } catch (error) {
        callback(
            {
                code: grpc.status.INVALID_ARGUMENT,
                message: (error as Error).message || "Registration failed",
            },
            null
        );
    }
}






async function verifyUserEmail(call: any, callback: any) {
    try {
        const response = await verifyUserEmailController({
            email: call?.request?.email,
            otpCode: call?.request?.otpCode
        })
        callback(null, response)

    } catch (error) {
        callback(
            {
                code: grpc.status.INVALID_ARGUMENT,
                message: (error as Error).message || "Email verification failed",
            },
            null
        );
    }
}




async function  loginUser(call: any, callback: any) {
    try {
        const response = await loginUserController({
            email: call?.request?.email,
            password: call?.request?.password
        })
        callback(null, response)

    } catch (error) {
        callback(
            {
                code: grpc.status.INVALID_ARGUMENT,
                message: (error as Error).message || "Authentication failed",
            },
            null
        );
    }
}


export function gRPCServer() {
    const server = new grpc.Server();

    server.addService(auth.AuthService.service, {
        registerUser,
        verifyUserEmail,
        loginUser
    });

    server.bindAsync(
        `0.0.0.0:${PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error(`Server failed to bind: ${error.message}`);
                return;
            }
            console.log(`Auth Service running on port: ${port}`);
        }
    );

}




