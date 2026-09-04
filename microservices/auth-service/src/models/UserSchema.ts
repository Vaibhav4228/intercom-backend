import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    name?: string;
    email: string;
    isValidEmail: number;
    otpCode: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum USER_EMAIL_TYPE {
  INVALID_EMAIL = 0,
  VALID_EMAIL = 1,
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            trim: true,
            default: null,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        isValidEmail: {
            type: Number,
            required: true,
            default: 0,
        },

        otpCode: {
            type: String,
            required: true,
            default: "",
        },

        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const User = model<IUser>("User", userSchema);
