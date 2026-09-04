import mongoose, { Document, Schema, Types } from "mongoose";

export interface IKnowledgeBase extends Document {
  fileName: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgebaseSchema = new Schema<IKnowledgeBase>(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


export const KnowledgeBase = mongoose.model(
  "KnowledgeBase",
  knowledgebaseSchema
);
