import z from 'zod';
import {User} from "../../schema/user.schema";
import {registerZod} from "../../lib/zod";
import {sendEmail} from "../../lib/email";

const passwordZod = registerZod.pick({password: true});

export const updatePassword = (user: User, body: any) => {
    try {
        const { oldPassword, newPassword } = body;
        const isMatch = user.comparePassword(oldPassword);
        if (!isMatch) {
            return [true, "Invalid password"];
        }

        if (oldPassword === newPassword) {
            return [true, "New password cannot be the same as the old password"];
        }

        const { password } = passwordZod.parse({password: newPassword});
        user.password = password;
        user.notifications.push({ name: "Password Updated", description: "Your password has been updated successfully", type: "password", date: new Date() });

        sendEmail(user.email, "Password Updated", "Your password has been updated successfully").catch(console.error);
        return [false, "Password updated successfully"];
    } catch (e) {
        console.error(e);
        if (e instanceof z.ZodError) return [true, e.errors[0].message];
        return [true, "Internal server error"];
    }
}
