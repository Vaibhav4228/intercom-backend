import { Schema, model, Document } from "mongoose";

export type MemoryCategory =
    | "fact"
    | "preference"
    | "rule"
    | "skill"
    | "context";


export type MemoryImportance =
    | "low"
    | "medium"
    | "high"
    | "critical";

export type LongTermMemoryInput = {
    userId: string;
    category: MemoryCategory
    content: string;
    agentId:string
    importance?: MemoryImportance
    threadId?: string;
    date?: string;
}

export type RetrieveLongTermMemoryType= {
        userId: string;
        agentId:string
        category?:MemoryCategory
        importance?:MemoryImportance
        limit?: number;
    }


export interface ILongTermMemory extends Document {
    userId: string;
    agentId:string
    category: MemoryCategory;
    content: string;
    importance: MemoryImportance;
    source?: {
        agentId:string
        threadId?: string;
        date?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}


const LongTermMemorySchema = new Schema<ILongTermMemory>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
         agentId: {
            type: String,
            required: true,
            index: true,
        },

        category: {
            type: String,
            enum: [
                "fact",
                "preference",
                "rule",
                "skill",
                "context",
            ],
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        importance: {
            type: String,
            enum: [
                "low",
                "medium",
                "high",
                "critical",
            ],
            default: "medium",
        },

        source: {
            threadId: {
                type: String,
            },
            date: {
                type: String,
            },
        },
    },
    {
        timestamps: true,
    }
);


LongTermMemorySchema.index({
    userId: 1,
    category: 1,
});


export const LongTermMemory =
    model<ILongTermMemory>(
        "LongTermMemory",
        LongTermMemorySchema
    );