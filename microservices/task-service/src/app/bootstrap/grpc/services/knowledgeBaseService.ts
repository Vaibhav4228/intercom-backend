
import { KnowledgeBaseService } from "@/services/knowledgeBaseService";




export async function getKnowledgeBases(call: any, callback: any) {
  try {
    const {
      userId,
      page = 1,
      limit = 10,
      search = "",
    } = call.request;

    const kb = KnowledgeBaseService.getInstance();

    const response = await kb.getKnowledgeBases({
      userId,
      page: Number(page),
      limit: Number(limit),
      search,
    });

    callback(null, {
      knowledgeBases: response.data,
      pagination: response.pagination,
    });
  } catch (err) {
    callback(err, null);
  }
}
