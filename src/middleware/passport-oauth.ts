import UserModel from "../models/user.model";
import { User } from "../schema/user.schema";

export const googleStrategyVerify = async (accessToken: any, refreshToken : any, profile: any, done: any) => {
    try {
        await StrategyVerify(accessToken, refreshToken, profile, done);
    } catch (error) {
        console.log(error);
        return done(error, false);
    }
}

export const StrategyVerify = async (accessToken: any, refreshToken: any, profile: any, done: (arg0: unknown, arg1: unknown) => any) => {
    try {
        const { emails, id, displayName, photos } = profile;
        let user: User | null = null;

        if (emails) {
            user = await UserModel.findOne({ email: emails[0].value });
        }

        if (user) {
            return done(null, user);
        }

        const userDetails = {
            name: displayName,
            email: emails ? emails[0].value : null,
            profilePicture: photos ? photos[0].value : null,
        };

        const newUser = new UserModel(userDetails);
        await newUser.save();
        return done(null, newUser);
    } catch (error) {
        console.log(error);
        return done(error, false);
    }
}
