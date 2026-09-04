import { Request, Response, NextFunction } from "express";
import { sessionClient } from "../gRPCTaskClient";


export function getSessionsgRPC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  sessionClient.GetSessions(
    {
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
      search: req.query.search ?? "",
      status: req.query.status ?? "",
    },
    (err: any, response: any) => {
      if (err) return next(err);

      res.json(response);
    }
  );
}
export function createSessiongRPC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  sessionClient.CreateSession(req.body, (err: any, response: any) => {
    if (err) return next(err);

    res.status(201).json(response);
  });
}
export function updateSessiongRPC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  sessionClient.UpdateSession(
    {
      sessionId: req.params.id,
      ...req.body,
    },
    (err: any, response: any) => {
      if (err) return next(err);

      res.json(response);
    }
  );
}