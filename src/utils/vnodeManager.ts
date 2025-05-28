import VNode from "./vnode"
import ConsistentHashRing from "./hashRing"

export default class VNodeManager 
{
    vnodes: Map<string, VNode>

    shards: Map<string, Set<string>>

    hashRing: ConsistentHashRing

    constructor() {
        this.vnodes = new Map()
        this.shards = new Map()
        this.hashRing = new ConsistentHashRing()
    }

    addVNode(vnodeKey: string, shardKey: string, value?: VNode) 
    {   
        if (!this.shards.has(shardKey)) {
            console.error("No shard exists by key : " + shardKey)
            return;
        }

        if (this.vnodes.has(vnodeKey) && !value) {
            console.info("A vnode already exists by key : " + vnodeKey)
            return;
        }

        // Add vnodeKey to vnodes list
        // Update value attached with vnodekey if it exists
        this.vnodes.set(vnodeKey, value ?? new VNode(vnodeKey, shardKey));

        // Add vnodekey to shards list
        this.shards.get(shardKey)?.add(vnodeKey)

        // Insert into consistent hash ring
        this.hashRing.addPoint(vnodeKey)
    }

    deleteVNode(vnodeKey: string) 
    {   
        if (!this.vnodes.has(vnodeKey)) {
            console.error("NO vnode exists by key: " + vnodeKey)
            return; // or throw new exception
        }

        const vnode = this.vnodes.get(vnodeKey)
        if (!vnode) {
            console.error("No physical vnode found for key: " + vnodeKey)
            return;
        }

        if (!this.shards.has(vnode.getShardKey())) {
            console.error("No shard exists for vnode key : " + vnode.getVnodeKey())
            return;
        }

        // Delete vnode from vnodelist
        this.vnodes.delete(vnodeKey);

        // Remove from ring
        this.hashRing.deletePoint(vnodeKey)

        // Delete vnode from shard list
        this.shards.get(vnode.getShardKey())?.delete(vnodeKey)
    }

    getVNode(vnodeKey: string) {
        return this.vnodes.get(vnodeKey);
    }

    getVnodeKeyForCacheKey(cacheKey: string) 
    {
        return this.hashRing.getImmediateNextPoint(cacheKey);
    }
    
    getNextVNodeKeysForReplication(cacheKey: string, replicationCount: number) 
    {
        return this.hashRing.getImmediateNextNPoints(cacheKey, replicationCount);
    }
}