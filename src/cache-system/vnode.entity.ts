interface CacheEntry 
{
    value: any;
    ttlMs?: number;
    createdAt: number;
}

export default class VNode {

    storage: Map<string, CacheEntry>

    vnodeKey: string

    shardKey: string

    constructor(vnodeKey: string, shardKey: string) {
        this.storage = new Map()
        this.vnodeKey = vnodeKey
        this.shardKey = shardKey
    }

    getVnodeKey() 
    {
        return this.vnodeKey;
    }

    getShardKey() 
    {
        return this.shardKey;
    }

    getFromStorage(cacheKey: string) 
    {
        const cacheEntry = this.storage.get(cacheKey)

        if (cacheEntry && cacheEntry.ttlMs) {
            if (Date.now() - cacheEntry.createdAt > cacheEntry.ttlMs) {
                this.deleteFromStorage(cacheKey)
            }
        }

        return cacheEntry?.value;
    }

    addToStorage(cacheKey: string, value: any, ttlMs? : number) 
    {
        this.storage.set(cacheKey, {
            value: value,
            ttlMs: ttlMs,
            createdAt: Date.now()
        });
    }

    deleteFromStorage(cacheKey: string) 
    {
        this.storage.delete(cacheKey)
    }

    listStorage() 
    {
        return this.storage
    }
}