import { Express, Response, Request } from "express";
import { gRPCServer } from "./grpc/gRPCServer";
import { dbConnection } from "./mongodb";
import { redis } from "./redis/redisClient";
import { initAgenda } from "./agenda/agenda";



export async function bootStrapApp() {
    try {
        console.log("Initializing database connection...");
        // 1. Wait completely for MongoDB to connect
        await dbConnection();

        console.log("Connecting Agenda background jobs...");
        // 2. Wait for Agenda to fully initialize
        await initAgenda();

        // // console.log("Connecting Redis cache...");
        // // // // 3. Wait for Redis handshake to complete
        await redis.connect();

        // // console.log("Starting gRPC Server...");
        // // // 4. Start the gRPC server only when all dependencies are ready
        await gRPCServer();

        console.log("Task Service bootstrapped successfully! 🚀");
    } catch (error: any) {
        console.error("Error bootstrapping the task service:", error?.message);
        // Crash the process so Docker orchestrators know the container failed
        process.exit(1); 
    }
}
