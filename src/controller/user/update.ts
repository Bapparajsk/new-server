import {Request, Response} from "express";
import {User} from "../../schema/user.schema";
import {updateName} from "./update.name";
import {updatePassword} from "./update.password";

const updateConfig = async (env: string, user: User , body: any) => {
    try {
        switch (env) {
            case "name":
                return updateName(user, body);
            case "password":
                return updatePassword(user, body);
            // case "profilePicture":
            //     return await updateProfilePicture(body);
            // case "coverPicture":
            //     return await updateCoverPicture(body);
        }

        return [true, "Invalid environment"];
    } catch (e) {
        console.error(e);
        return [true, "Internal server error"];
    }
}

const update = async (req: Request, res: Response) => {
    try {
        const env = req.params.env;
        const body = req.body;

        if (!["name", "password", "profilePicture", "coverPicture"].includes(env)) {
            res.status(404).json({message: "Invalid environment"});
            return;
        }

        const user = req.User;
        if (!user) {
            return res.status(401).json({message: "Unauthorized"});
        }

        const [error, message] = await updateConfig(env, user, body);
        if (error) {
            return res.status(400).json({message});
        }

        await user.save();
        res.status(200).json({ message });
    } catch (e) {
        console.error(e);
        res.status(500).json({message: "Internal server error"});
    }
}

export {
    update
};
