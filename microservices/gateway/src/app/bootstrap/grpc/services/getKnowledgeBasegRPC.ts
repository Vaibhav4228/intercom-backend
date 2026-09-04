


import { Request, Response, NextFunction } from "express";
import {  kbClient } from "../gRPCTaskClient";



export function getKnowledgeBasegRPC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  kbClient.GetKnowledgeBases(
    {
      userId: req.query.userId,
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      search: req.query.search ?? "",
    },
    (err: any, response: any) => {
      if (err) return next(err);

      res.json(response);
    }
  );
}