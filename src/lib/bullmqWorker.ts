import {  createWorker } from "../config/bullmq.config";
import {
    postNotificationWorkerFn,
    pushNotificationFireBaseAndSocketFn,
    userNotificationWorkerFn
} from "./bullmqWorkerFn";

export const userNotificationWorker = createWorker({
    queueName: "userNotificationQueue",
    workerFn: userNotificationWorkerFn
});

export const postNotificationWorker = createWorker({
    queueName: "postNotificationQueue",
    workerFn: postNotificationWorkerFn
});

export const pushNotificationFireBaseAndSocketWorker = createWorker({
    queueName: "pushNotificationFireBaseAndSocket",
    workerFn: pushNotificationFireBaseAndSocketFn
})
