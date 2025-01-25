import Ioredis from 'ioredis'

const client = new Ioredis({
    username: 'default',
    password: 'RsgfrC0jT8cnVzrFTg0QVtbVFdPy4eZc',
    host: 'redis-14506.c256.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 14506
    // port: Number.parseInt(process.env.REDIS_PORT || "6379"), // Redis port
    // host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
});

client.on("error", () => {
    console.log('Redis connection failed ❌');
});

client.on("connect", () => {
    console.log('Redis Connected Successfully 🚀');
})

export default client;
