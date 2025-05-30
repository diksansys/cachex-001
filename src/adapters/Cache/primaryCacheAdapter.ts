import { createClient } from 'redis';

const DEFAULT_TTL = 3600; // 1 day

export const primaryCacheAdapter = {
    /**
     * Connects to the Redis database using the connection string from environment variables.
     * Implements a reconnection strategy with exponential backoff.
     */
    client: null as any, // Placeholder for Redis client, should be properly typed

    async connect () {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            console.error("ERROR! Redis connection string not found");
            return;
        }

        try {
            // Assuming a Redis client is initialized here
            const client = createClient(
                {
                    url: redisUrl,
                    socket: {
                        reconnectStrategy: (retries: number) => {
                            if (retries > 5) {
                                console.error("Max retries reached, stopping reconnection attempts");
                                return new Error("Max retries reached");
                            }
                            return Math.min(retries * 1000, 3000); // Exponential backoff
                        }
                    }
                }
            );

            //client.on('error', err => console.log('Redis Client Error', err));

            await client.connect();
            console.log("Successfully connected to Redis!");
           
            // Optionally, you can set a ping command to check the connection
            await client.ping();

            console.log("Redis connection is alive");
            this.client = client;
        } catch (err) {
            console.error("Redis connection error", err);
        }
    },

    async isServiceUp () {
        try {
            await this.client.ping();
            return true;
        } catch (err) {
            return false;
        }
    },

   async set(key: string, value: any, ttlInSec: number = DEFAULT_TTL) {
        await this.client.set(key, JSON.stringify(value));
        if (ttlInSec) await this.client.expire(key, ttlInSec);
    },

    async get(key: string) {
        const val = await this.client.get(key);
        return val ? JSON.parse(val) : null;
    },

    async del(key: string) {
        return await this.client.del(key);
    },

    async hset(key: string, field: string, value: any) {
        return await this.client.hset(key, field, JSON.stringify(value));
    },

    async hget(key: string, field: string) {
        const val = await this.client.hget(key, field);
        return val ? JSON.parse(val) : null;
    },

    async hgetall(key: string) {
        const hash = await this.client.hgetall(key);
        const parsed: Record<string, any> = {};
        for (const field in hash) {
        parsed[field] = JSON.parse(hash[field]);
        }
        return parsed;
    },

    async hdel(key: string, field: string) {
        return await this.client.hdel(key, field);
    },

    async lpush(key: string, ...values: string[]) {
        return await this.client.lpush(key, ...values);
    },

    async rpop(key: string) {
        return await this.client.rpop(key);
    },

    async publish(channel: string, message: string) {
        return await this.client.publish(channel, message);
    },
}