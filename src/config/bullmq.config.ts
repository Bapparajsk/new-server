import { Queue, QueueOptions } from 'bullmq';

const QueueConfig: QueueOptions = {
    connection: {
        // port: Number.parseInt(process.env.REDIS_PORT || "6379"), // Redis port
        // host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
        username: 'default',
        password: 'RsgfrC0jT8cnVzrFTg0QVtbVFdPy4eZc',
        host: 'redis-14506.c256.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 14506
    }
}

// export const newChatNotificationQueue = new Queue("newChatNotificationQueue", QueueConfig)
// export const newPostNotificationQueue = new Queue("newPostNotificationQueue", QueueConfig)
// export const friendNotificationQueue = new Queue("friendNotificationQueue", QueueConfig)
