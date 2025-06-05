import { primaryCacheAdapter } from "../adapters/Cache/primaryCacheAdapter";
import { primaryDbAdapter } from "../adapters/Db/primaryDbAdapter";
import { primaryWriteStreamAdapter } from "../adapters/WriteStream/primaryWriteStreamAdapter";

export const adapterRegistry = {
    db: {
        primary: {
            init: async () => {
                // Placeholder for DB connection initialization
                const isConnected = await primaryDbAdapter.isConnected();
                if (!isConnected) {
                    await primaryDbAdapter.connect();
                } 
            },
            isUp: async () => {
                await adapterRegistry.db.primary.init(); // Ensure connection is initialized before checking
                // Placeholder for DB connection check
                return await primaryDbAdapter.isServiceUp();
            },
            create: async (data: any, doc: string) => {
                return await primaryDbAdapter.create(data, doc);
            },
            update: async (dataId: any, data: any, doc: string) => {
                return await primaryDbAdapter.update(dataId, data, doc)
            },
            delete: async (dataId: any) => {
                return await primaryDbAdapter.delete(dataId)
            },
            findOne: async (query: any, doc: string) => {
                return await primaryDbAdapter.get(query, doc);
            },
            has: async (query: any, doc: string) => {
                return await primaryDbAdapter.has(query, doc);
            },
            save: async (query: any, data: any, doc: string) => {
                return await primaryDbAdapter.save(query, data, doc);
            }
        }
    },
    cache: {
        primary: {
            init: async () => {
                // Placeholder for Redis connection initialization
                const isConnected = await primaryCacheAdapter.isConnected();
                if (!isConnected) {
                    await primaryCacheAdapter.connect();
                } 
            },
            isUp: async () => {
                await adapterRegistry.cache.primary.init(); // Ensure connection is initialized before checking
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
                const isConnected = await primaryWriteStreamAdapter.isConnected();
                if (!isConnected) {
                    await primaryWriteStreamAdapter.connect();
                } 
            },
            isUp: async () => {
                await adapterRegistry.writeStream.primary.init(); // Ensure connection is initialized before checking
                // Placeholder for Kafka connection check
                return await primaryWriteStreamAdapter.isServiceUp();
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