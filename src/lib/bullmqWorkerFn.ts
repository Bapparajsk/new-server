import {Job} from "bullmq";
import {pushNotificationFireBaseAndSocketProducer} from "./bullmqProducer";
import { messaging } from "../config/firebase.config";
import UserModel from "../models/user.model";
import {UserNotificationType} from "../type/lib/bullmqProducer";
import {Notification} from "../schema/user.schema";
import io from '../bin/www';
import {getSocketIdByUserId, isOnlineByUserId} from "../socket/socketDb";

export const userNotificationWorkerFn = async (job: Job) => {
    const {id , notification, pushNotificationToken} = job.data as UserNotificationType;
    await UserModel.findOneAndUpdate({ _id: id }, { $push: { notifications: notification } });
}

export const postNotificationWorkerFn = async (job: Job) => {
    const { id, notification } = job.data as UserNotificationType;
    const user = await UserModel.findById(id);
    if (!user) return;

    const include = [...Array.from(user.friends.values()).map((f) => f.userId)];

    const [users] = await Promise.all([
        UserModel.find(
            { _id: { $in: include } },
            { pushNotificationToken: 1, _id: 1 }
        ).lean(),
        UserModel.updateMany({ _id: { $in: include } }, { $push: { notifications: notification } })
    ]);

    users.forEach((u) => {
        pushNotificationFireBaseAndSocketProducer({
            id: u._id as string,
            notification,
            pushNotificationToken: u.pushNotificationToken
        }).catch(console.error);
    });
};

const createPushNotificationMessage = (notification: Notification) => {
    return {
        name: notification.name,
        title: notification.title,
        description: notification.description || "",
        date: notification.date?.toISOString() || new Date().toISOString(),
        type: notification.type || "notification",
    }
}

export const pushNotificationFireBaseAndSocketFn = async (job: Job) => {
    const { id, notification, pushNotificationToken } = job.data as UserNotificationType;
    // if user is online send notification via socket

    if (isOnlineByUserId(id)) {
        const socketId = getSocketIdByUserId(id);
        if (!socketId) return;
        io.to(socketId).emit("notification", notification);
        return;
    }

    // if user is offline send notification via firebase
    if (!pushNotificationToken) return;
    const message = {
        notification: {
            title: notification.title,
            body: notification.description,
        },
        data: createPushNotificationMessage(notification),
        token: pushNotificationToken
    };

    await messaging.send(message);
}
