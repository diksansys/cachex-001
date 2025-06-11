import { Request, Response, NextFunction } from "express"
import cacheManager from "./cache.manager"

const handleSaveCache = (req: Request, res: Response, next: NextFunction) => 
{
    const {key, value} = req.body

    if (!key || !value) {
        throw new Error("Please check input")
    }

    cacheManager.add(key, value)

    res.status(200).json({ message: "saved", success: true, data: getCompleteView()})
}

const handleRemoveCache = (req: Request, res: Response) => 
{
    const {key} = req.body

    if (!key) {
        throw new Error("Please check input")
    }

    cacheManager.remove(key)

    res.status(201).json({ message: "removed", success: true, data: getCompleteView()})
}

const handleSaveVnode = (req: Request, res: Response, next: NextFunction) => 
{
    try {
        const {vnodeKey, shardKey} = req.body

        if (!vnodeKey || !shardKey) {
            throw new Error("Please check input")
        }

        cacheManager.vnodeManager.addVNode(vnodeKey, shardKey);

        res.status(200).json({ message: "added", success: true, data: getCompleteView()})
    } catch (e: any) {
        res.status(500).json({ message: e.message, success: false})
    }
}

const handleRemoveVnode = (req: Request, res: Response, next: NextFunction) => 
{
    const {vnodeKey, shardKey} = req.body

    cacheManager.vnodeManager.deleteVNode(vnodeKey);
    
    res.status(201).json({ message: "removed", success: true, data: getCompleteView()})
}

const getCompleteView = () =>
{
    const result: string[] = [];
    cacheManager.vnodeManager.hashRing.sortedHashList.forEach((hash: number) => {
        const vnkey: string = cacheManager.vnodeManager.hashRing.ring.get(hash) as string
        const vnode = cacheManager.vnodeManager.getVNode(vnkey)
        const storage = vnode?.listStorage()
        let storageList = '.';

        storage?.forEach((cacheEntry: any, cacheKey: string) => {
            storageList += `// Cache key: ${cacheKey} | Cache Value: ${cacheEntry.value}`;
        })
        result.push(`${hash} => [ shard: ${vnode?.getShardKey()}, key: ${vnkey} , data: ${storageList} ]`)
    })

    return result
}

export default {
    handleSaveCache,
    handleRemoveCache,
    handleSaveVnode,
    handleRemoveVnode
}