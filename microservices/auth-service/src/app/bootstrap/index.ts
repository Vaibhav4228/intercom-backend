import { Express, Response, Request } from "express";
import { expressServer } from "./express/expressServer";
import { gRPCServer } from "./grpc/gRPCServer";
import { dbConnection } from "./mongodb";
import { connectRabbitMQ } from "./rabbitmq";


export async function bootStrapApp(app: Express, PORT: number){


await Promise.all([
    dbConnection(),
connectRabbitMQ()
])

    gRPCServer()
}