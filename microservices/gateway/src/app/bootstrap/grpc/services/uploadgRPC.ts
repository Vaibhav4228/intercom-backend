import { NextFunction, Request, Response } from "express";
import { uploadClient } from "../gRPCTaskClient";

export function uploadFilegRPC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded.",
      });
    }

    const { userId } = req.body;

    uploadClient.UploadFile(
      {
        userId,
        filename: file.originalname,
        mimeType: file.mimetype,
        file: file.buffer, 
      },
      (err: any, response: any) => {
        if (err) {
          return next(err);
        }

        return res.status(201).json(response);
      }
    );
  } catch (error) {
    next(error);
  }
}