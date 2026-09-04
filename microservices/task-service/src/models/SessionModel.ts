import { Schema, model, Document } from "mongoose";

export interface ISession extends Document {
  title?: string;
  duration: number; // Duration in seconds
  status: "active" | "inactive" ;
  threadId:string
  agentId:string
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },
     agentId: {
      type: String,
       required: true,
    },
    threadId: {
      type: String,
       required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", 'inactive'],
      default: "inactive",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Session = model<ISession>("Session", SessionSchema);