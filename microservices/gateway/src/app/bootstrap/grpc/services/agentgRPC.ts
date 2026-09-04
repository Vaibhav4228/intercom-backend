import { Request, Response, NextFunction } from "express";
import { agentClient } from "../gRPCTaskClient";





export function createAgentgRPC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  agentClient.CreateAgent(req.body, (err: any, response: any) => {
    if (err) return next(err);

    res.status(201).json(response);
  });
}




export function updateAgentgRPC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  agentClient.UpdateAgent(
    {
      agentId: req.params.agentId,
      ...req.body,
    },
    (err: any, response: any) => {
      if (err) return next(err);

      res.json(response);
    }
  );
}





export function getAgentgRPC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  agentClient.GetAgent(
    {
      agentId: req.params.agentId,
      userId: req.query.userId,
    },
    (err: any, response: any) => {
      if (err) return next(err);

      res.json(response);
    }
  );
}





export function getAgentsgRPC(
  req: Request,
  res: Response,
  next: NextFunction
) {
  agentClient.GetAgents(
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