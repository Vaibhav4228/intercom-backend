import { CustomerService } from "@/services/customerService";
import { tool } from "@langchain/core/tools";
import { z } from "zod";


export const captureLeadTool = tool(
  async ({ firstName, lastName, email },config:any) => {
    try {
      const userId=config?.configurable?.userId as string
        const customerService = CustomerService.getInstance();

    const existingLead = await customerService.getCustomerByEmail(email);

    if (existingLead) {
      return {
        success: false,
        message: "A lead with this email already exists.",
        customer: existingLead,
      };
    }

    const customer = await customerService.createCustomer({
      firstName,
      lastName,
      email,
      userId
    });

    return {
      success: true,
      message: "Lead captured successfully.",
      customer,
    };
    } catch (error) {
        return JSON.stringify({
            message:"Failed to capture a lead :"+(error as Error)?.message,
        })
    }
  },
  {
    name: "capture_lead",
    description:
      "Capture a new lead by collecting the customer's first name, last name, and email address.",
    schema: z.object({
      firstName: z
        .string()
        .min(1)
        .describe("Customer's first name."),
      lastName: z
        .string()
        .min(1)
        .describe("Customer's last name."),
      email: z
        .string()
        .describe("Customer's email address."),
    }),
  }
);