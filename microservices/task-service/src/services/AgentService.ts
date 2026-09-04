import { Agent, IAgent } from "@/models/AgentModel";
import { Types } from "mongoose";


export class AgentService {



    private static instance: AgentService;

    public static  getInstance(): AgentService {
        if (!AgentService.instance) {
            AgentService.instance = new AgentService();
        }
        return AgentService.instance;
    }

     async createAgent(data: {
        name: string;
        companyContext:string
        category:string
        goal: string;
        persona: string;
        userId: Types.ObjectId;
    }): Promise<IAgent> {
        try {
            return await Agent.create(data);
        } catch (error) {
            throw new Error("Failed to create an agent : " + (error as Error)?.message)
        }
    }

  
     async updateAgent(
        agentId: string,
        userId: Types.ObjectId,
        data: Partial<Pick<IAgent, "name" | "goal" | "persona"| "category"| "companyContext">>
    ): Promise<IAgent | null> {

         try {
            return await Agent.findOneAndUpdate(
            {
                _id: agentId,
                userId,
            },
            data,
            {
                new: true,
                runValidators: true,
            }
        );
        } catch (error) {
            throw new Error("Failed to update an agent : " + (error as Error)?.message)
        }
        
    }

    /**
     * Get agent by id
     */
     async getAgentById(props:{
        agentId: string,
        userId: Types.ObjectId
    }): Promise<IAgent | null> {
     
        const {agentId,userId}=props

        try {
               return await Agent.findOne({
            _id: agentId,
            userId,
        });
            
        } catch (error) {
             throw new Error("Failed to retrieve an agent : " + (error as Error)?.message)
        }
    }

    /**
     * Get agents with pagination
     */
     async getAgents(params: {
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

        const filter:any = {
            userId,
        };

        if (search) {
            filter.name = {
                $regex: search,
                $options: "i",
            };
        }

        const skip = (page - 1) * limit;

        const [agents, total] = await Promise.all([
            Agent.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Agent.countDocuments(filter),
        ]);

        return {
            data: agents,
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
             throw new Error("Failed to retrieve a list of  agens : " + (error as Error)?.message)
        }
        
    }
}