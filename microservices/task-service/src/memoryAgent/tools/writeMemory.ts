
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { LongTermMemoryService } from "@/services/LongTermMemoryService";
import { RunnableConfig } from "@langchain/core/runnables";
// import { agenda } from "@/app/bootstrap/agenda/agenda";
import { agenda } from "@/app/bootstrap/agenda/agenda";
import { redis } from "@/app/bootstrap/redis/redisClient";


const longTermMemoryService = LongTermMemoryService.getInstance();


export const writeMemoryTool = tool(
  async ({ category, content, importance, threadId, date }, config: RunnableConfig) => {
    try {
      const userId = config?.configurable?.userId as string
      const agentId = config?.configurable?.agentId as string

      const cacheKey = `ltm:longTermMemo:${userId}-${agentId}`;

      const [memory, _] = await Promise.all([
        longTermMemoryService.insertLongTermMemory({
          userId,
          agentId,
          category,
          content,
          importance,
          threadId,
          date,
        }),
        redis.del(cacheKey)

      ])

     await agenda.now('docEmbeddingJob', { userId, content })


      return JSON.stringify({
        success: true,
        message: "Long-term memory saved successfully.",
        memoryId: memory._id,
      });


    } catch (error) {
      console.error("❌ Write long term memory error:", error);

      return "Failed to save long-term memory.";
    }
  },
  {
    name: "write_memory",
    description:
      ` Store important information about the user in long-term memory.

      Use this tool when you identify information that should persist
      across future conversations.

      Examples:
      - User preferences
      - User habits
      - Important facts about the user
      - Coding rules or workflow preferences
      - Long-lasting project context

      Do not store temporary conversation details.
      `,

    schema: z.object({

      category: z.enum(["fact", "preference", "rule", "skill", "context",])
        .describe(
          "The type of memory being stored"
        ),

      content: z.string().describe(
        "The information to remember"
      ),

      importance: z
        .enum([
          "low",
          "medium",
          "high",
          "critical",
        ])
        .default("medium")
        .describe(
          "How important this memory is"
        ),

      threadId: z
        .string()
        .optional()
        .describe(
          "The conversation thread where this memory was created"
        ),

      date: z.string().optional().describe(
        "The date this memory was created"
      ),
    }),
  }
);