import { userNotificationQueue, postNotificationQueue, pushNotificationFireBaseAndSocket } from "../config/bullmq.config";
import {UserNotificationType} from "../type/lib/bullmqProducer";

export const userNotificationProducer = async (notification : UserNotificationType) => {
    try {
        await userNotificationQueue.add("userNotification", { ...notification });
    } catch (error) {
        console.error("Error in userNotificationProducer", error);
    }
}

export const postNotificationProducer = async (notification : UserNotificationType) => {
    try {
        await postNotificationQueue.add("postNotification", { ...notification });
    } catch (error) {
        console.error("Error in postNotificationProducer", error);
    }
}

export const pushNotificationFireBaseAndSocketProducer = async (notification : UserNotificationType) => {
    try {
        await pushNotificationFireBaseAndSocket.add("pushNotificationFireBaseAndSocket", { ...notification });
    } catch (error) {
        console.error("Error in postNotificationProducer", error);
    }
};
