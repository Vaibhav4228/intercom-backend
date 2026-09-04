import { LongTermMemoryService } from "@/services/LongTermMemoryService";
import { WorkingMemoryService } from "@/services/WorkingMemoryService"
import { tokenCounter } from "@/utils/tokenCounter";
import { compressSTM } from "../pipelines/compression-pipeline";
import { docEmbedding } from "../pipelines/embedding-pipeline";
import { Document } from "@langchain/core/documents";
import { WorkingMemoryArchiveService } from "@/services/WorkingMemoryArhiveService";
import { agenda } from "@/app/bootstrap/agenda/agenda";
// import { agenda } from "@/app/bootstrap/agenda/agenda";

export class ContextAssembler {


    public workingMemory: WorkingMemoryService
    public longTermMemoryService: LongTermMemoryService
    public workingMemoryArchive: WorkingMemoryArchiveService
    public userId: string
    public threadId: string
    public agentId: string

    public modelContextLimit: number


    constructor(props: { userId: string,agentId:string, threadId: string, modelContextLimit: number }) {
        const { userId, threadId,agentId, modelContextLimit } = props
        this.workingMemory = WorkingMemoryService.getInstance()
        this.longTermMemoryService = LongTermMemoryService.getInstance();
        this.workingMemoryArchive = WorkingMemoryArchiveService.getInstance()

        this.userId = userId
        this.threadId = threadId
        this.agentId = agentId

        this.modelContextLimit = modelContextLimit

    }


    async assembleContext(userQuery: string) {

        const [workingMemo, longTermMemo] = await Promise.all([
            this.workingMemory.convertWorkingMemoryToMarkdown({agentId:this.agentId, userId: this.userId, threadId: this.threadId }),
            this.longTermMemoryService.getLongTermMemoryAsMarkdown({ userId: this.userId,agentId:this.agentId })
        ])

        const memoryLayers = [
            `<long_term_memory># Profile Layer\n${longTermMemo} </long_term_memory>`,
            `<working_memory># Recent STM Layer\n${workingMemo} </working_memory>`
        ];
        const llmContext = `${memoryLayers.join(',')}\n\n# New Input\n${userQuery}`;
        const numberOfTokens = tokenCounter(llmContext)

        if (numberOfTokens > this.modelContextLimit) {
            // compression layer goes here

            console.log("===============we run compression====================")
            console.log("===============we run compression====================")

            const compressData = await compressSTM(llmContext)

            await Promise.all([

                agenda.now('docEmbeddingJob', { userId:this.userId,agentId:this.agentId,content: compressData }),

        
                this.workingMemory.clearWorkingMemory({ agentId:this.agentId,userId: this.userId, threadId: this.threadId }),
                this.workingMemoryArchive.appendWorkingMemoryArchive({
                    agentId:this.agentId,
                    userId: this.userId,
                    threadId: this.threadId,
                    role: "user",
                    content: llmContext
                })
            ])
        }
        return {
            llmContext,
            diagnostics: {
                estimatedTokens: numberOfTokens,
            }
        };
    }

}