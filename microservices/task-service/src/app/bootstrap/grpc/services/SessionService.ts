import { SessionService } from "@/services/SessionService";
import { Types } from "mongoose";
export async function getSessions(call: any, callback: any) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
    } = call.request;

    const sessionService = SessionService.getInstance();

    const response = await sessionService.getSessions({
      page: Number(page),
      limit: Number(limit),
      search,
      status: status || undefined,
    });

    callback(null, {
      sessions: response.data,
      pagination: response.pagination,
    });
  } catch (err) {
    callback(err, null);
  }
}


export async function createSession(call: any, callback: any) {
  try {
    const { title, duration, status,threadId,agentId } = call.request;

    const sessionService = SessionService.getInstance();

    const session = await sessionService.createSession({
      title,
      duration: Number(duration),
      status,
      threadId,
      agentId
    });

    callback(null, {
      session,
    });
  } catch (err) {
    callback(err, null);
  }
}



export async function updateSession(call: any, callback: any) {
  try {
    const { sessionId, title, duration, status } = call.request;

    const sessionService = SessionService.getInstance();

    const session = await sessionService.updateSession({
      sessionId: new Types.ObjectId(sessionId),
      title,
      duration: Number(duration),
      status,
    });

    callback(null, {
      session,
    });
  } catch (err) {
    callback(err, null);
  }
}