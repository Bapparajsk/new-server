import Ioredis from 'ioredis'

const client = new Ioredis({
    port: Number.parseInt(process.env.REDIS_PORT || "6379"), // Redis port
    host: process.env.REDIS_HOST || "127.0.0.1", // Redis host
});

client.on("error", () => {
    console.log('Redis connection failed');
});

client.on("connect", () => {
    console.log('Redis Connected Successfully');
})

export default client;
