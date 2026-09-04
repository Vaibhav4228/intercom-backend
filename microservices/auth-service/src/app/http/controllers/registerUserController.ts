import { NextFunction, Response, Request } from "express";
import { userInputSchema } from "./UserDTO";
import { UserService } from "@/services/UserService";
import z from "zod";
import { hashPassword } from "@/helper/userPassword";
import { generateOTP } from "@/helper/generateOTP";
import { publishEvent } from "@/app/bootstrap/rabbitmq/events";





export async function registerUserController(props:{email:string,password:string}) {
  try {
    const {email,password}=props


    const result = userInputSchema.safeParse({ email, password });

    if (!result.success) {
  
    throw {
        message: "Validation Failed",
        validationErrors: z.flattenError(result.error)
      };
    }

    const userRepo = UserService.getInstance()

    const otpCode = generateOTP(7)
    const hashPwd = await hashPassword(password)

    const user = await userRepo.registerUser({ email, otpCode, hashPwd })

    publishEvent( "user.created",{
        userId: user._id,
        email: user.email,
        otpCode
      });


    return { message: "we sent to your an email verification, use the code verify your email", user };

  } catch (err) {
    throw err
  }
}

