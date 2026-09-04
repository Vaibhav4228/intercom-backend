import { Schema, model, Document } from "mongoose";

export interface IWorkingMemoryArchiveEntry {
  id: string;
  time: string;
  role: "user" | "ai";
  content: string;
}

export interface IWorkingMemoryArchive extends Document {
  userId: string;
  threadId: string;
  agentId:string
  date: string;
  entries: IWorkingMemoryArchiveEntry[];
  createdAt: Date;
  updatedAt: Date;
}


const WorkingMemoryArchiveEntrySchema = new Schema<IWorkingMemoryArchiveEntry>(
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


const WorkingMemoryArchiveSchema = new Schema<IWorkingMemoryArchive>(
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
      type: [WorkingMemoryArchiveEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);


// One working memory per user + thread + day
WorkingMemoryArchiveSchema.index(
  {
    userId: 1,
    threadId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);


export const WorkingMemoryArchive = model<IWorkingMemoryArchive>("WorkingMemoryArchive",WorkingMemoryArchiveSchema);