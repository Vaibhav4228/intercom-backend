import { Schema, model, Document, Types } from "mongoose";

export interface IAgent extends Document {
  name: string;
  goal: string;
  persona: string;
  userId: Types.ObjectId;
  companyContext:string
  category:string
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    goal: {
      type: String,
      required: true,
      trim: true,
    },
    companyContext: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    persona: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Agent = model<IAgent>("Agent", AgentSchema);