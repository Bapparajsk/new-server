import z from 'zod';
import {User} from "../../schema/user.schema";

export const updateName = (user: User, body: any, env: "name" | "title") => {
    try {
        const {name} = body;
        if (!name || name === "" || name.length < 3) {
            return [true, "Name must be at least 3 characters", 400];
        }

        if (name === user.name) {
            return [true, "Name is same as current name", 400];
        }

        user[env] = name;
        user.notifications.push({
            name:  `${env} updated`,
            title: `${env} updated`,
            description: `${env} updated successfully`,
            type: env,
            date: new Date(),
            imageSrc: {
                env: "local",
                url: `/notification/${env}.png`,
                alt: `${env} updated`
            }
        });
        return [false, "Updated successfully", 200];
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            return [true, e.errors[0].message, 400];
        }
        return [true, "Internal server error", 500];
    }
}
