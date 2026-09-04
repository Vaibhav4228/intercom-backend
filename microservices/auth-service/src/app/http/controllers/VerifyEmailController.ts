import { UserService } from "@/services/UserService";

export async function verifyUserEmailController(props: { otpCode: string, email: string }) {
    try {
        const { otpCode, email } = props;
        const userService = UserService.getInstance()
        const userExist = await userService.findUserByEmail(email)

        if (userExist) {

            const existingOtpCode = userExist?.otpCode

            if (parseInt(existingOtpCode) === parseInt(otpCode)) {
                await userService.validateUserEmail(email)
                return {
                    message: "your email was verified successfully",
                    success: true
                };
            } else {

                return {
                    message: "user email not found",
                    success: false
                };
            }

        } else {
            return {
                message: "user email not found",
                success: false
            };
        }

    } catch (err) {
        throw err

    }
}
