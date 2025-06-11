import { createClient } from 'redis';

const DEFAULT_TTL = 3600; // 1 day

class PrimaryCacheAdapter {
    /**
     * Redis client instance.
     * @private
     */
    private client: ReturnType<typeof createClient> | null = null;

    /**
     * Connects to the Redis database using the connection string from environment variables.
     * Implements a reconnection strategy with exponential backoff.
     */
    async connect() {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            console.error("ERROR! Redis connection string not found");
            return;
        }

        try {
            const client = createClient({
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
            });

            await client.connect();
            console.log("1. Successfully connected to Redis!");

            await client.ping();
            console.log("2. Redis connection is alive");
            
            this.client = client;
        } catch (err) {
            console.error("Redis connection error", err);
        }
    }

    async isConnected() {
        if (!this.client) {
            console.error("Redis client is not initialized");
            return false;
        }
        try {
            const isAlive = await this.client.ping();
            return isAlive === 'PONG';
        } catch (err) {
            console.error("Error checking Redis connection", err);
            return false;
        }
    }

    async isServiceUp() {
        try {
            await this.client?.ping();
            return true;
        } catch (err) {
            return false;
        }
    }

    async set(key: string, value: any, ttlInSec: number = DEFAULT_TTL) {
        if (!this.client) throw new Error("Redis client not connected");
        await this.client.set(key, JSON.stringify(value));
        if (ttlInSec) await this.client.expire(key, ttlInSec);
    }

    async get(key: string) {
        if (!this.client) throw new Error("Redis client not connected");
        const val = await this.client.get(key);
        return val ? JSON.parse(val) : null;
    }

    async del(key: string) {
        if (!this.client) throw new Error("Redis client not connected");
        return await this.client.del(key);
    }

    async hset(key: string, field: string, value: any) {
        if (!this.client) throw new Error("Redis client not connected");
        return await this.client.hset(key, field, JSON.stringify(value));
    }

    async hget(key: string, field: any) {
        if (!this.client) throw new Error("Redis client not connected");
        const val = await this.client.hget(key, field);
        let parsedValue = val as string | null;
        return parsedValue ? JSON.parse(parsedValue) : null;
    }

    async hgetall(key: string) {
        if (!this.client) throw new Error("Redis client not connected");
        const hash = await this.client.hgetall(key);

        const parsed: Record<string, any> = {};
        const entries = hash as Record<string, string>;

        for (const field in entries) {
            parsed[field] = JSON.parse(entries[field]);
        }
        return parsed;
    }

    async hdel(key: string, field: string) {
        if (!this.client) throw new Error("Redis client not connected");
        return await this.client.hdel(key, field);
    }

    async lpush(key: string, ...values: string[]) {
        if (!this.client) throw new Error("Redis client not connected");
        return await this.client.lpush(key, ...values);
    }

    async rpop(key: string) {
        if (!this.client) throw new Error("Redis client not connected");
        return await this.client.rpop(key);
    }

    async publish(channel: string, message: string) {
        if (!this.client) throw new Error("Redis client not connected");
        return await this.client.publish(channel, message);
    }
}

export const primaryCacheAdapter = new PrimaryCacheAdapter();