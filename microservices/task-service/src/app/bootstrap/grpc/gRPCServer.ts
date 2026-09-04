
import { PORT } from "@/index";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import { Chat } from "./services/chatService";
import { GetTasks } from "./services/taskService";
import { getChatHistory } from "./services/chathistoryService";
import { createAgent, getAgent, getAgents, updateAgent } from "./services/AgentService";
import { uploadFile } from "./services/UploadService";
import { getCustomers } from "./services/CustomerService";
import { getKnowledgeBases } from "./services/knowledgeBaseService";
import { createSession, getSessions, updateSession } from "./services/SessionService";


const PROTO_DIR = path.join("/app", "proto");


const packageDefinition = protoLoader.loadSync(
    [
        path.join(PROTO_DIR, "task.proto"),
        path.join(PROTO_DIR, "chat.proto"),
        path.join(PROTO_DIR, "chathistory.proto"),
        path.join(PROTO_DIR, "agent.proto"),
        path.join(PROTO_DIR, "upload.proto"),
        path.join(PROTO_DIR, "customer.proto"),
        path.join(PROTO_DIR, "knowledgebase.proto"),
        path.join(PROTO_DIR, "session.proto"),

    ],
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    }
);

const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;

const taskProto = grpcObject.tasks;
const chatProto = grpcObject.chat;
const chatHistoryProto = grpcObject.chathistory
const agentProto = grpcObject.agent
const uploadProto = grpcObject.upload
const customerProto = grpcObject.customer
const kbProto = grpcObject.knowledgebase
const sessionProto=grpcObject.session






export function gRPCServer() {
    const server = new grpc.Server();


    server.addService(taskProto.TaskService.service, {
        GetTasks,
    });


    server.addService(chatProto.ChatService.service, {
        Chat,
    });

    server.addService(chatHistoryProto.ChatHistoryService.service, {
        GetChatHistory: getChatHistory,
    });


    // agent

    server.addService(agentProto.AgentService.service, {
        CreateAgent: createAgent,
        UpdateAgent: updateAgent,
        GetAgent: getAgent,
        GetAgents: getAgents,
    });


    // end agent


    //customer
     server.addService(customerProto.CustomerService.service, {
        GetCustomers: getCustomers,
    });

    // upload
      server.addService(uploadProto.UploadService.service, {
        UploadFile: uploadFile, 
    });

    // knowledgebase

     server.addService(kbProto.KnowledgeBaseService.service, {
        GetKnowledgeBases: getKnowledgeBases, 
    });

    // sessions
    server.addService(sessionProto.SessionService.service, {
  CreateSession: createSession,
  UpdateSession: updateSession,
  GetSessions: getSessions,
});

    


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




