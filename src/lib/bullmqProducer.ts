import { userNotificationQueue } from "../config";
import {UserNotificationType} from "../type/lib/bullmqProducer";

export const userNotificationProducer = async (notification : UserNotificationType) => {
    try {
        await userNotificationQueue.add("userNotification", { ...notification });
    } catch (error) {
        console.error("Error in userNotificationProducer", error);
    }
}
