import {Queue, QueueOptions, WorkerOptions, Worker, Job} from 'bullmq';
import {CreateWorkerType} from "../type/config/bullmq.config";

const connection = {
    // port: Number.parseInt(process.env.REDIS_PORT || "6379"), // Redis port
    // host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
    username: 'default',
    password: 'RsgfrC0jT8cnVzrFTg0QVtbVFdPy4eZc',
    host: 'redis-14506.c256.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 14506
}

export const QueueConfig: QueueOptions = { connection }

export const WorkerConfig: WorkerOptions = {
    connection,
    removeOnComplete: { count: 2 },  //
}

export const createWorker = ({
    queueName,
    workerFn,
}: CreateWorkerType) => {
    const worker = new Worker(queueName, async (job) => {
        await workerFn(job);
    }, WorkerConfig);

    worker.on("failed", (job, error, prev) => {
        console.error(`Worker ${queueName} failed`, error);
    });
    return worker;
};

export const userNotificationQueue = new Queue("userNotificationQueue", QueueConfig)
export const postNotificationQueue = new Queue("postNotificationQueue", QueueConfig)
export const pushNotificationFireBaseAndSocket = new Queue("pushNotificationFireBaseAndSocket", QueueConfig)
