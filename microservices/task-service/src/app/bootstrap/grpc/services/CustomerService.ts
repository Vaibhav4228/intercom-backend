import { AgentService } from "@/services/AgentService";
import { CustomerService } from "@/services/customerService";




export async function getCustomers(call: any, callback: any) {
  try {
    const {
      userId,
      page = 1,
      limit = 10,
      search = "",
    } = call.request;

    const customerService = CustomerService.getInstance();

    const response = await customerService.getCustomers({
      userId,
      page: Number(page),
      limit: Number(limit),
      search,
    });

    callback(null, {
      customers: response.data,
      pagination: response.pagination,
    });
  } catch (err) {
    callback(err, null);
  }
}
