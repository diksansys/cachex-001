import HashFn from "./hash-function.service";

/**
 * HASH-KEY MAP RING(ring : hash -> key map) + HASH MEMORY STRIP (sortedHashList)
 * Strip enables us to find immediate next hash value ( OR If strip ends, we need to start from beginning of the strip )
 * Ring helps us to find the value mapped to a hash value
 */
export default class ConsistentHashRing 
{
    ring: Map<number, string>; // where hashes are set at a fixed position

    sortedHashList: number[]; // a container for all hash values in a sorted order

    constructor() 
    {
        this.ring = new Map();
        this.sortedHashList = [];
    }

    addPoint(key: string) {
        
        // Create hash for the key using hash fn
        const hash = HashFn.getHash(key);
        
        // Set hash on the ring
        if (this.ring.has(hash)) 
            return; // or throw an exception
        this.ring.set(hash, key);

        // Add hash into hash list
        this.sortedHashList.push(hash);
        this.sortedHashList.sort((a: number, b: number) => a - b);
    }

    // Keep in mind that deleting a point on ring will never affect anything
    // It is like, immediate next value is removed and all the values behind that point
    // would now point towards the next point after that removed point
    // that's all
    // minimal rebalancing required
    deletePoint(key: string) {
        // Create hash for the nodekey
        const hash = HashFn.getHash(key)

        // Remove hash from sorted list first
        this.sortedHashList = this.sortedHashList.filter(h => h !== hash)

        // Remove hash from ring
        this.ring.delete(hash)
    }

    // this method is the real implementation of hash-ring
    getImmediateNextPoint(key: string) {
        // Create hash for the nodekey
        const hash = HashFn.getHash(key)

        // First point
        const firstPoint = this.sortedHashList[0];
        
        for (const h of this.sortedHashList) {
            if (hash <= h) { // If `h` is immediate next to `hash` -> clockwise
                return this.ring.get(h);
            }
        }

        // If no point is immediate (greater than) to `hash`, point to beginning
        return this.ring.get(firstPoint);
    }

    getImmediateNextNPoints(key: string, numberOfPoints: number = 1) 
    {
        let totalPoints = 0;
        const allPoints: string[] = []; // list of vnodekeys

        // Create hash for the nodekey
        const hash = HashFn.getHash(key)

        // Get index of immediate point next to hash
        let index = this.sortedHashList.findIndex(h => h >= hash)

        while(totalPoints < numberOfPoints) {
            const vnodekey = this.ring.get(this.sortedHashList[index])
            if (vnodekey) {
                if (allPoints.includes(vnodekey)) {
                    console.error("Only " + totalPoints + " replicas could be created due to vnode limitations")
                    break;
                }
                allPoints.push(vnodekey)
                totalPoints++;
            }

            index = (index + 1) % this.sortedHashList.length
        }

        return allPoints;
    }

    printHashRing() 
    {
        this.sortedHashList.forEach((hash) => {
            console.log(`${hash} => ${this.ring.get(hash)} \n`)
        })
    }
}