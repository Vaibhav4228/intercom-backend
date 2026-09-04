import { Schema, model, Document } from "mongoose";

export interface IWorkingMemoryEntry {
  id: string;
  time: string;
  role: "user" | "ai";
  content: string;
}

export interface IWorkingMemory extends Document {
  userId: string;
  threadId: string;
  agentId:string
  date: string;
  entries: IWorkingMemoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}


const WorkingMemoryEntrySchema = new Schema<IWorkingMemoryEntry>(
  {
    time: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  }
);


const WorkingMemorySchema = new Schema<IWorkingMemory>(
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


    date: {
      type: String,
      required: true,
      index: true,
    },

    entries: {
      type: [WorkingMemoryEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


// One working memory per user + thread + day
WorkingMemorySchema.index(
  {
    userId: 1,
    threadId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);


export const WorkingMemory = model<IWorkingMemory>("WorkingMemory",WorkingMemorySchema);