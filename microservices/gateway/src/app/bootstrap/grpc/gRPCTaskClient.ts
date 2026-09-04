import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

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
const chathistoryProto = grpcObject.chathistory;
const agentProto = grpcObject.agent;
const uploadProto = grpcObject.upload;
const customerProto = grpcObject.customer;
const kbProto = grpcObject.knowledgebase
const sessionProto = grpcObject.session






const taskServiceHostName = "task-service:50052"
export const taskClient = new taskProto.TaskService(taskServiceHostName, grpc.credentials.createInsecure());

export const chatClient = new chatProto.ChatService(taskServiceHostName, grpc.credentials.createInsecure());

export const chathistoryClient = new chathistoryProto.ChatHistoryService(taskServiceHostName, grpc.credentials.createInsecure());

export const agentClient = new agentProto.AgentService(taskServiceHostName, grpc.credentials.createInsecure());


export const uploadClient = new uploadProto.UploadService(taskServiceHostName, grpc.credentials.createInsecure());

export const customerClient = new customerProto.CustomerService(taskServiceHostName, grpc.credentials.createInsecure());


export const kbClient = new kbProto.KnowledgeBaseService(taskServiceHostName, grpc.credentials.createInsecure());

export const sessionClient = new sessionProto.SessionService(taskServiceHostName, grpc.credentials.createInsecure());




