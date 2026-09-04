import { WorkingMemoryArchive } from "@/models/WorkingMemoryArchiveModel";
import { randomUUID } from "crypto";

export class WorkingMemoryArchiveService {
    private static instance: WorkingMemoryArchiveService;

    public static getInstance(): WorkingMemoryArchiveService {
        if (!WorkingMemoryArchiveService.instance) {
            WorkingMemoryArchiveService.instance = new WorkingMemoryArchiveService();
        }
        return WorkingMemoryArchiveService.instance;
    }


    async getWorkingMemoryArhive(props:{
        userId: string,
        agentId:string
        threadId: string,
        date?: string}
    ) {
        try {
            const { userId, threadId,agentId, date } = props

            const currentDate =
                date ?? new Date().toISOString().split("T")[0];

            const memory = await WorkingMemoryArchive.findOne({
                userId,
                threadId,
                date: currentDate,
            }).lean();

            return memory?.entries ?? [];

        } catch (error) {
            throw new Error('Failed to retrieve the working memory  archive' + (error as Error)?.message)
        }
    }

    async convertWorkingMemoryArchiveToMarkdown(props: { userId: string,agentId:string, threadId: string, date?: string }) {
        try {
            const { userId, threadId,agentId, date } = props
            const currentDate =
                date ?? new Date().toISOString().split("T")[0];

            const entries = await this.getWorkingMemoryArhive({
                userId,
                agentId,
                threadId,
                date:currentDate}
            );

            let markdown = `# Working Memory Archives ${currentDate}\n\n`;

            for (const entry of entries) {
                markdown += `## [Time: ${entry.time}] Role: ${entry.role === "ai" ? "AI" : "User"}\n`;
                markdown += `${entry.content}\n\n`;
            }

            return markdown.trim();
        } catch (error) {
            throw new Error('Failed to convert the working memory Archi ve to markdown : ' + (error as Error)?.message)
        }
    }

    async appendWorkingMemoryArchive(props: {
        userId: string,
        agentId:string
        threadId: string,
        role: "user" | "ai",
        content: string
    }
    ) {
        try {
            const { userId, threadId,agentId, role, content } = props
            const now = new Date();
            const date = now.toISOString().split("T")[0];
            const time = now.toLocaleTimeString("en-GB", { hour12: false });

            return await WorkingMemoryArchive.findOneAndUpdate(
                { userId, threadId,agentId, date },
                {
                    $setOnInsert: {
                        userId,
                        threadId,
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
            throw new Error('Failed to insert within the working memory Archive :' + (error as Error)?.message)
        }
    }



}