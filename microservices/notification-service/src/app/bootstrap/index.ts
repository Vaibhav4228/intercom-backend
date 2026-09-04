import { Express, Response, Request } from "express";
import { gRPCServer } from "./grpc/gRPCServer";
import { connectRabbitMQ } from "./rabbitmq";

export async function bootStrapApp(app: Express, PORT: number){
  await connectRabbitMQ()
    gRPCServer()
}