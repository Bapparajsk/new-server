import { Queue, QueueOptions, WorkerOptions } from 'bullmq';

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

export const userNotificationQueue = new Queue("userNotificationQueue", QueueConfig)
// export const newPostNotificationQueue = new Queue("newPostNotificationQueue", QueueConfig)
// export const friendNotificationQueue = new Queue("friendNotificationQueue", QueueConfig)
