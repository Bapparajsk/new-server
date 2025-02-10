import {User} from "../../schema/user.schema";
import {putObjectURL} from "../../lib/awsS3";
import { generateToken } from "../../lib/jwt";

export const pictureUpdate = async (user: User, body: any, env: "profilePicture" | "coverPicture" ) => {
    try {
        const { fileName } = body;
        if (!fileName) {
            return [true, "Invalid file name", 400];
        }

        // generate key and url for the image to be uploaded to AWS S3
        const key = `${env === "profilePicture" ? "profile-images" : "cover-images"}/image/${user.name}-${Date.now()}-${fileName}`;
        const url = await putObjectURL(key, 'image/png');

        const accessToken = generateToken({ key, env }, "10m");

        user.accessToken = accessToken;
        user.accessTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        return [false, { url, accessToken }, 200];
    } catch (e) {
        console.error(e);
        return [true, "Internal server error", 500];
    }
}
