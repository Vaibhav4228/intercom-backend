import { IUser } from "@/models/UserSchema"
import { signAccessToken, signRefreshToken } from "./jwt"



export async function authData(user: IUser) {
    // mongodb object
    const { password, ...restProps } = user.toObject()
    const [accessToken, refreshToken] = await Promise.all([
        signAccessToken(user?._id),
        signRefreshToken(user?._id)
    ])
    const data = {
        token: {
            accessToken: accessToken,
            refreshToken: refreshToken
        },
        user: {
            _id:restProps?._id,
            email:restProps?.email,
            name:restProps?.name
        },
        isLoggedIn: true
    }

    console.log('rest props  :  ',restProps)

  

    return data
}