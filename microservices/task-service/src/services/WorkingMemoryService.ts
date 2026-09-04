import { randomUUID } from "crypto";
import { WorkingMemory } from "@/models/WorkingMemoryModel";


export class WorkingMemoryService {
    private static instance: WorkingMemoryService;

    public static getInstance(): WorkingMemoryService {
        if (!WorkingMemoryService.instance) {
            WorkingMemoryService.instance = new WorkingMemoryService();
        }
        return WorkingMemoryService.instance;
    }


    async getWorkingMemory(props:{
        userId: string,
        threadId: string,
        agentId:string
        date?: string
   } ) {
        try {
            const { userId,agentId, threadId, date } = props

            const currentDate =
                date ?? new Date().toISOString().split("T")[0];

            const memory = await WorkingMemory.findOne({
                userId,
                threadId,
                agentId,
                date: currentDate,
            }).lean();

            return memory?.entries ?? [];

        } catch (error) {
            throw new Error('Failed to retrieve the working memory ' + (error as Error)?.message)
        }
    }

    async convertWorkingMemoryToMarkdown(props: { userId: string,agentId:string, threadId: string, date?: string }) {
        try {
            const { userId,agentId, threadId, date } = props
            const currentDate =
                date ?? new Date().toISOString().split("T")[0];

            const entries = await this.getWorkingMemory({
                agentId,
                userId,
                threadId,
                date:currentDate
           } );

            let markdown = `# Daily Log ${currentDate}\n\n`;

            for (const entry of entries) {
                markdown += `## [Time: ${entry.time}] Role: ${entry.role === "ai" ? "AI" : "User"}\n`;
                markdown += `${entry.content}\n\n`;
            }

            return markdown.trim();
        } catch (error) {
            throw new Error('Failed to convert the working memory to markdown : ' + (error as Error)?.message)
        }
    }

    async appendWorkingMemory(props: {
        userId: string,
        threadId: string,
        agentId:string
        role: "user" | "ai",
        content: string
    }
    ) {
        try {
            const { userId, threadId,agentId, role, content } = props
            const now = new Date();
            const date = now.toISOString().split("T")[0];
            const time = now.toLocaleTimeString("en-GB", { hour12: false });

            return await WorkingMemory.findOneAndUpdate(
                { userId, threadId, date },
                {
                    $setOnInsert: {
                        userId,
                        threadId,
                        agentId,
                        date,
                    },
                    $push: {
                        entries: {
                            time,
                            role,
                            content,
                        },
                    },
                },
                {
                    upsert: true,
                    returnDocument: "after",
                }
            );
        } catch (error) {
            throw new Error('Failed to insert within the working memory :' + (error as Error)?.message)
        }
    }




    async clearWorkingMemory(props: { userId: string,agentId:string, threadId: string, date?: string }) {
        try {
            const { userId,agentId, threadId, date } = props
            const currentDate = date ?? new Date().toISOString().split("T")[0];

            return await WorkingMemory.findOneAndUpdate(
                {
                    userId,
                    threadId,
                    agentId,
                    date: currentDate,
                },
                {
                    $set: {
                        entries: [],
                    },
                },
                {
                    returnDocument: "after",
                }
            );
        } catch (error) {
            throw new Error(
                "Failed to clear working memory: " +
                (error as Error).message
            );
        }
    }
}