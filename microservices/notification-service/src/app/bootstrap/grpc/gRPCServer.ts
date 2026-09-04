import { PORT } from "@/index";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import crypto from "crypto";
import path from "path";

export const PROTO_PATH=path.join("/app","proto","task.proto");



const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const tasks = proto.tasks;


// async function GetTasks(call:any, callback: any) {
//     try {
//         const generatedTasks = Array.from({ length: 5 }, randomTask);

//         callback(null, {
//             tasks: generatedTasks,
//         });

//     } catch (err) {
//         callback(err, null);
//     }
// }

export function gRPCServer() {
    const server = new grpc.Server();

    // server.addService(tasks.TaskService.service, {
    //     GetTasks
    // });

 server.bindAsync(
     `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(`Server failed to bind: ${error.message}`);
            return;
        }
        console.log(`Task Service running on port: ${port}`);
    }
);

}




