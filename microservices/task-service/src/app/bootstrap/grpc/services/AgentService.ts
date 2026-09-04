import { AgentService } from "@/services/AgentService";

const agentService = AgentService.getInstance();

export async function createAgent(call: any, callback: any) {
  try {
    const { userId, name, persona, goal,companyContext,category } = call.request;

    const agent = await agentService.createAgent({
      userId,
      name,
      persona,
      goal,
      companyContext,category
    });

    callback(null, {
      message: "Agent created successfully.",
      agent,
    });
  } catch (err) {
    callback(err, null);
  }
}

export async function updateAgent(call: any, callback: any) {
  try {
    const { agentId, userId, name, persona, goal,companyContext,category } = call.request;

    const agent = await agentService.updateAgent(agentId, userId, {
      name,
      persona,
      goal,
      companyContext,category
    });

    callback(null, {
      message: "Agent updated successfully.",
      agent,
    });
  } catch (err) {
    callback(err, null);
  }
}

export async function getAgent(call: any, callback: any) {
  try {
    const { agentId, userId } = call.request;

    const agent = await agentService.getAgentById({agentId, userId});

    callback(null, {
      agent,
    });
  } catch (err) {
    callback(err, null);
  }
}

export async function getAgents(call: any, callback: any) {
  try {
    const {
      userId,
      page = 1,
      limit = 10,
      search = "",
    } = call.request;

    const response = await agentService.getAgents({
      userId,
      page: Number(page),
      limit: Number(limit),
      search,
    });

    callback(null, {
      agents: response.data,
      pagination: response.pagination,
    });
  } catch (err) {
    callback(err, null);
  }
}
