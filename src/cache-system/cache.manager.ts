import VNodeManager from "./vnode.manager";

class CacheManager 
{
    replicationCount: number = 3
    vnodeManager: VNodeManager

    constructor() {
        this.vnodeManager = new VNodeManager()
    }

    get(key: string) 
    {
        for (const vnKey of this.vnodeManager.getNextVNodeKeysForReplication(key, this.replicationCount)) {
            const result = this.vnodeManager.getVNode(vnKey)?.getFromStorage(key);
            if (result) {
                return result;
            }
        }
        return false;
    }

    add(key: string, value: any) 
    {
        for (const vnKey of this.vnodeManager.getNextVNodeKeysForReplication(key, this.replicationCount)) {
            this.vnodeManager.getVNode(vnKey)?.addToStorage(key, value);
        }
    }

    remove(key: string) 
    {
        for (const vnKey of this.vnodeManager.getNextVNodeKeysForReplication(key, this.replicationCount)) {
            this.vnodeManager.getVNode(vnKey)?.deleteFromStorage(key);
        };
    }
}

export default new CacheManager();