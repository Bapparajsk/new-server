import { ZodError } from 'zod';
import { User } from "../../schema/user.schema";
import { registerZod } from "../../lib/zod";
import { sendEmail } from "../../lib/email";

const passwordZod = registerZod.pick({password: true});

export const updatePassword = async (user: User, body: any) => {
    try {
        const { oldPassword, newPassword } = body;
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return [true, "Invalid password", 400];
        }

        if (oldPassword === newPassword) {
            return [true, "New password cannot be the same as the old password", 400];
        }

        const { password } = passwordZod.parse({password: newPassword});
        user.password = password;
        user.notifications.push({
            name: "Password Updated",
            title: "Password Updated",
            description: "Your password has been updated successfully",
            type: "password",
            date: new Date(),
            imageSrc: {
                env: "local",
                url: "/notification/security.png",
                alt: "Password Updated"
            }
        });

        sendEmail(user.email, "Password Updated", "Your password has been updated successfully").catch(console.error);
        return [false, "Password updated successfully"];
    } catch (e) {
        console.error(e);
        if (e instanceof ZodError) return [true, e.errors[0].message, 400];
        return [true, "Internal server error", 500];
    }
}
