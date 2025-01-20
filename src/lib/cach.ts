import {redisConfig} from "../config";

export const cacheResponse = async (key: string, data: any, expiry = 60) => {
    await redisConfig.set(key, JSON.stringify(data), 'EX', expiry);
};

export const fetchCachedData = async (key: string) => {
    const cachedData = await redisConfig.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
};
