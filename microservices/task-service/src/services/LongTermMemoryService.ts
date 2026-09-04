import { redis } from "@/app/bootstrap/redis/redisClient";
import { LongTermMemory, LongTermMemoryInput, RetrieveLongTermMemoryType } from "@/models/LongTermMemoryModel";



export class LongTermMemoryService {
    private static instance: LongTermMemoryService;


    public static getInstance(): LongTermMemoryService {
        if (!LongTermMemoryService.instance) {
            LongTermMemoryService.instance = new LongTermMemoryService();
        }

        return LongTermMemoryService.instance;
    }


    async insertLongTermMemory({
        userId,
        agentId,
        category,
        content,
        importance = "medium",
        threadId,
        date,
    }: LongTermMemoryInput) {

        try {
            return await LongTermMemory.create({
                userId,
                agentId,
                category,
                content,
                importance,
                source: {
                    threadId,
                    date,
                },
            });
        } catch (error) {
            throw new Error('Failed to insert into longterm memory : ' + (error as Error)?.message)
        }
    }



    async getLongTermMemory({ userId,agentId, limit = 20 }: RetrieveLongTermMemoryType) {

        try {
            const filter: any = {
                userId,
                agentId
            };

            return await LongTermMemory
                .find(filter)
                .sort({
                    createdAt: -1,
                })
                .limit(limit)
                .lean();
        } catch (error) {
            throw new Error('Failed to fetch longterm memory : ' + (error as Error)?.message)
        }
    }




    async getLongTermMemoryAsMarkdown({ userId,agentId, limit = 50 }: RetrieveLongTermMemoryType) {
        try {
            const cacheKey = `ltm:longTermMemo:${userId}-${agentId}`;
            // 1. Check cache
            const cached = await redis.get(cacheKey);
            if (cached) {
                return cached;
            }

            // 2. Fetch from MongoDB
            const memories = await this.getLongTermMemory({
                userId,
                agentId,
                limit,
            });

            let markdown = "# LONGTERM MEMORY\n\n";

            for (const memory of memories) {
                const time = memory.createdAt
                    ? new Date(memory.createdAt).toLocaleTimeString("en-GB", {
                        hour12: false,
                    })
                    : "00:00:00";

                markdown += `## [Time: ${time}]\n`;
                markdown += `${memory.content}\n\n`;
            }

            markdown = markdown.trim();

            // 3. Cache for 1 hours
            await redis.set(cacheKey, markdown, {
                EX: 60 * 60,
            });

            return markdown;
        } catch (error) {
            throw new Error(
                "Failed to fetch long-term memory: " +
                (error as Error).message
            );
        }
    }
}