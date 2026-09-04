import { CustomerService } from "@/services/customerService";
import { tool } from "@langchain/core/tools";
import { z } from "zod";


export const updateLeadTool = tool(
    async ({ email, firstName, lastName, newEmail }) => {

        try {
            const customerService = CustomerService.getInstance();

            const customer = await customerService.getCustomerByEmail(email);

            if (!customer) {
                return {
                    success: false,
                    message: `No lead found with email ${email}.`,
                };
            }

            const updated = await customerService.updateCustomer(email, {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(newEmail && { email: newEmail }),
            });

            return {
                success: true,
                message: "Lead updated successfully.",
                customer: updated,
            };

        } catch (error) {
            return JSON.stringify({
                message: "Failed to capture a lead :" + (error as Error)?.message,
            })
        }
    },
    {
        name: "update_lead",
        description:
            "Retrieve a lead by email and update their first name, last name, or email.",
        schema: z.object({
            email: z.string().email().describe("Current email of the lead."),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            newEmail: z.string().email().optional(),
        }),
    }
);