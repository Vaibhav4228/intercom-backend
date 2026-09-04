import { IUser, User, USER_EMAIL_TYPE } from "@/models/UserSchema";

export class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async updateOtpCode(email: string, otpCode: string): Promise<void> {
    await User.updateOne(
      { email },
      {
        $set: {
          otpCode,
        },
      }
    );
  }

  async validateUserEmail(email: string): Promise<void> {
    await User.updateOne(
      { email },
      {
        $set: {
          isValidEmail: USER_EMAIL_TYPE.VALID_EMAIL,
        },
      }
    );
  }

  /**
   * 
   * @param email 
   * @returns a mongodb object. Use .toObject function to extract the props
   */
  async findUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

    async registerUser(props: {
    email: string;
    otpCode: string;
    hashPwd: string;
  }): Promise<IUser> {
   try {
     const existingUser = await this.findUserByEmail(props.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const user = new User({
      email: props.email,
      isValidEmail: USER_EMAIL_TYPE.INVALID_EMAIL,
      otpCode: props.otpCode,
      password: props.hashPwd,
    });

    await user.save();

    return user;
   } catch (error) {
    throw new Error("Failed to create a user")
   }
  }

}