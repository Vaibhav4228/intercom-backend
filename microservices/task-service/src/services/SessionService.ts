
import { ISession, Session } from "@/models/SessionModel";
import { Types } from "mongoose";
export class SessionService {
  private static instance: SessionService;

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Create a new session
   */
  async createSession(data: {
    title?: string;
    duration?: number;
    threadId:string
    agentId:string

    status?: "active" | "inactive";
  }): Promise<ISession> {
    try {
      return await Session.create(data);
    } catch (error) {
      throw new Error(
        "Failed to create session: " + (error as Error).message
      );
    }
  }

  /**
   * Update a session
   */
  async updateSession(params: {
    sessionId: Types.ObjectId;
    title?: string;
    duration?: number;
    status?: "active" | "inactive";
  }): Promise<ISession | null> {
    try {
      const { sessionId, ...updates } = params;

      return await Session.findByIdAndUpdate(
        sessionId,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );
    } catch (error) {
      throw new Error(
        "Failed to update session: " + (error as Error).message
      );
    }
  }

  /**
   * Get sessions with pagination
   */
  async getSessions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "active" | "completed" | "cancelled";
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
      } = params;

      const filter: any = {};

      if (status) {
        filter.status = status;
      }

      if (search) {
        filter.title = {
          $regex: search,
          $options: "i",
        };
      }

      const skip = (page - 1) * limit;

      const [sessions, total] = await Promise.all([
        Session.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Session.countDocuments(filter),
      ]);

      return {
        data: sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(
        "Failed to retrieve sessions: " +
          (error as Error).message
      );
    }
  }
}