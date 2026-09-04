import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHitlAction {
  id?: string;
  interruptId?: string;
  tool_name?: string;
  tool_description?: string;
  args?: any;
}

export interface IHitl {
  status: boolean;
  action?: IHitlAction;
}

export type MessageType="user" | "ai";

export interface IMessage {
  id: string;
  role: MessageType;
  userId: string;
  threadId: string;
  content: string;
  agentId:string
  thinking?: string;
  hitl?: IHitl;
}

export interface IChatHistory extends Document {
  userId: string;
  threadId: string;
   agentId:string
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const HitlActionSchema = new Schema<IHitlAction>(
  {
    id: {
      type: String,
    },
    interruptId: {
      type: String,
    },
    tool_name: {
      type: String,
    },
    tool_description: {
      type: String,
    },
    args: {
      type: Schema.Types.Mixed,
    },
  },
  {
    _id: false,
  }
);

const HitlSchema = new Schema<IHitl>(
  {
    status: {
      type: Boolean,
      required: true,
    },
    action: {
      type: HitlActionSchema,
    },
  },
  {
    _id: false,
  }
);

const MessageSchema = new Schema<IMessage>(
  {
    id: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    threadId: {
      type: String,
      required: true,
      index: true,
    },
     agentId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    thinking: {
      type: String,
    },
    hitl: {
      type: HitlSchema,
    },
  },
  {
    _id: false,
  }
);

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    threadId: {
      type: String,
      required: true,
      index: true,
    },
     agentId: {
      type: String,
      required: true,
      index: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const ChatHistory: Model<IChatHistory> =
  mongoose.models.ChatHistory ||
  mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);



