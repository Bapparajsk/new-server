import { Worker } from "bullmq";
import { WorkerConfig } from "../config/bullmq.config";
import UserModel from "../models/user.model";
import {UserNotificationType} from "../type/lib/bullmqProducer";

const userNotificationWorker = new Worker("userNotificationQueue", async (job) => {
    const { id, notification } = job.data as UserNotificationType;
    await UserModel.findOneAndUpdate({ _id: id }, { $push: { notifications: notification } });
}, WorkerConfig);

userNotificationWorker.on("failed", (job, err) => {
    console.error("Error in userNotificationWorker", err);
});
