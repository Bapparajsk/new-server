import z from 'zod';
import {User} from "../../schema/user.schema";

export const updateName = (user: User, body: any) => {
    try {
        const {name} = body;
        if (!name || name === "" || name.length < 3) {
            return [true, "Name must be at least 3 characters"];
        }

        if (name === user.name) {
            return [true, "Name is same as current name"];
        }

        user.name = name;
        user.notifications.push({
            name: "Name updated",
            description: "Name updated successfully",
            type: "name",
            date: new Date()
        });
        return [false, "Name updated successfully"];
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) {
            return [true, e.errors[0].message];
        }
        return [true, "Internal server error"];
    }
}
