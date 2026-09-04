import { z } from "zod";

export const userInputSchema = z.object({
 
  email: z.email()
    .min(5, "Email must be at least 5 characters long.")
    .max(100, "Email cannot exceed 100 characters."),
  password: z
    .string({
      error: "Password is required.",
    })
    .min(6, "Password must be at least 6 characters long.")
    .max(8, "Password cannot exceed 8 characters."),
});