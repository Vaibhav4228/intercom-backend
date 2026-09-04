import { IKnowledgeBase, KnowledgeBase } from "@/models/KnowledgeBaseModel";
import { Types } from "mongoose";

export class KnowledgeBaseService {
  public static instance: KnowledgeBaseService;

  public static getInstance(): KnowledgeBaseService {
    if (!KnowledgeBaseService.instance) {
      KnowledgeBaseService.instance = new KnowledgeBaseService();
    }
    return KnowledgeBaseService.instance;
  }

  async createKnowledgeBase(data: {
    fileName: string;
    userId: string;
  }): Promise<IKnowledgeBase> {
    try {
      return await KnowledgeBase.create(data);
    } catch (error) {
      throw new Error(
        "Failed to create knowledge base: " + (error as Error).message
      );
    }
  }




  /**
   * Get knowledge base files with pagination
   */
  async getKnowledgeBases(params: {
    userId: Types.ObjectId;
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const {
        userId,
        page = 1,
        limit = 10,
        search,
      } = params;

      const filter: any = { userId };

      if (search) {
        filter.fileName = {
          $regex: search,
          $options: "i",
        };
      }

      const skip = (page - 1) * limit;

      const [knowledgeBases, total] = await Promise.all([
        KnowledgeBase.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        KnowledgeBase.countDocuments(filter),
      ]);

      return {
        data: knowledgeBases,
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
        "Failed to retrieve knowledge base files: " +
          (error as Error).message
      );
    }
  }
}