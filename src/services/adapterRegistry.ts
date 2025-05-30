import { primaryCacheAdapter } from "../adapters/Cache/primaryCacheAdapter";
import { primaryDbAdapter } from "../adapters/Db/primaryDbAdapter";
import { primaryWriteStreamAdapter } from "../adapters/WriteStream/primaryWriteStreamAdapter";

export const adapterRegistry = {
    db: {
        primary: {
            init: async () => {
                // Placeholder for DB connection initialization
                await primaryDbAdapter.connect();
                console.log("DB connection initialized");
            },
            isUp: async () => {
                // Placeholder for DB connection check
                return primaryDbAdapter.isServiceUp();
            },
            create: async (data: any, doc: string) => {
                return primaryDbAdapter.create(data, doc);
            },
            update: async (dataId: any, data: any, doc: string) => {
                return primaryDbAdapter.update(dataId, data, doc)
            },
            delete: async (dataId: any) => {
                return primaryDbAdapter.delete(dataId)
            }
        }
    },
    cache: {
        primary: {
            init: async () => {
                // Placeholder for Redis connection initialization
                await primaryCacheAdapter.connect();
                console.log("Redis connection initialized");
            },
            isUp: async () => {
                // Placeholder for Redis connection check
                return await primaryCacheAdapter.isServiceUp();
            },
            set: async (key: string, value: any, ttlInSec?: number) => {
                return await primaryCacheAdapter.set(key, value, ttlInSec);
            },
            get: async (key: string) => {
                return await primaryCacheAdapter.get(key);
            }
            ,
            del: async (key: string) => {
                return await primaryCacheAdapter.del(key);
            }
            ,
            hset: async (key: string, field: string, value: any) => {
                return await primaryCacheAdapter.hset(key, field, value);
            }
            ,
            hget: async (key: string, field: string) => {
                return await primaryCacheAdapter.hget(key, field);
            }
            ,
            hgetall: async (key: string) => {
                return await primaryCacheAdapter.hgetall(key);
            }
            ,
            hdel: async (key: string, field: string) => {
                return await primaryCacheAdapter.hdel(key, field);
            }
        }
    },
    writeStream: {
        primary: {
            init: async () => {
                // Placeholder for Kafka connection initialization
                await primaryWriteStreamAdapter.connect();
                console.log("Kafka connection initialized");
            },
            isUp: async () => {
                // Placeholder for Kafka connection check
                return primaryWriteStreamAdapter.isServiceUp();
            },
            publish: async (topic: string, data: any) => {
                return await primaryWriteStreamAdapter.publish(topic, data);
            },
            subscribe: async (topic: string, callback: (message: any) => void) => {
                return await primaryWriteStreamAdapter.subscribe(topic, callback);
            }
        }
    }
}