import { createHash } from "node:crypto"

export default class HashFn {

    static getHash(key: string) : number
    {
        return parseInt(createHash('md5').update(key).digest('hex').slice(0, 8), 16);
    }
}