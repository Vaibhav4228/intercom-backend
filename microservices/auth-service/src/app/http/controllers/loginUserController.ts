import { userInputSchema } from "./UserDTO";
import z from "zod";
import { UserService } from "@/services/UserService";
import { USER_EMAIL_TYPE } from "@/models/UserSchema";
import { comparePassword } from "@/helper/userPassword";
import { authData } from "@/helper/authData";

export async function loginUserController(props: { email: string, password: string }) {
    try {
        const { email, password } = props
        const result = userInputSchema.safeParse({ email, password });

        if (!result.success) {
            throw {
                message: "Validation Failed",
                validationErrors: z.flattenError(result.error)
            };
        }

         const userService = UserService.getInstance()
         const user = await userService.findUserByEmail(props.email);

         if(!user){
            throw {
                message: "Invalid email or password",
            };
         }

         if(user?.isValidEmail!==USER_EMAIL_TYPE.VALID_EMAIL){
            throw {
                message: "Invalid email or password",
            };
         }

        const isMatch = await comparePassword(password, user?.password)

        if (isMatch) {
            const userData = await authData(user)
            return {
                userData
            }
        } else {
             throw {
                message: "Invalid email or password",
            };
        }


    } catch (err) {
       throw err

    }
}
