import {redisConfig} from "../config";
import {Friend} from "../schema/user.schema";

export const cacheResponse = async (key: string, data: any, expiry = 60) => {
    await redisConfig.set(key, JSON.stringify(data), 'EX', expiry);
};

export const fetchCachedData = async (key: string) => {
    const cachedData = await redisConfig.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
};

export const handlePagination = <T>(items: T[], page: number, LIMIT: number) : T[] => {
    const skip = (page - 1) * LIMIT;
    return items.slice(skip, skip + LIMIT);
};
