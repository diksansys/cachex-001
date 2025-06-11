import { adapterRegistry } from "../common/registry/adapter.registry";
import UserRepository from "./user.repository";

class UserService 
{
    private userRepository: UserRepository;

    constructor() 
    {
        this.userRepository = new UserRepository()
        this.fetchUserDetailsFromDb = this.fetchUserDetailsFromDb.bind(this)
        this.getUserRepository = this.getUserRepository.bind(this)
    }

    public getUserRepository() 
    {
        return this.userRepository;
    }

    public async fetchUserDetailsFromDb(userId: string, sensistiveInfo?: boolean) 
    {   
        if (await adapterRegistry.db.primary.isUp()) {
            const userData = await this.userRepository.findById(userId, ["-passwordHash"])
            if (userData) {
                if (await adapterRegistry.cache.primary.isUp()) {
                    const cacheKey = `userDetails:${userId}`;
                    await adapterRegistry.cache.primary.set(cacheKey, JSON.stringify(userData));
                } else {
                    console.warn("Cache system is not up:");
                }
                return userData
            } 
            console.error("User not found with ID:", userId);
            throw new Error("User not found");
        } 
        console.error("Database system is down.")
        throw new Error("Something went wrong");
    }

    public async fetchUserDetailsFromCache(userId: string) 
    {
        const cacheKey = `userDetails:${userId}`;
        if(await adapterRegistry.cache.primary.isUp()) {
            const cachedData = await adapterRegistry.cache.primary.get(cacheKey);
            if (cachedData) {
                console.log("Cache hit for user details:", cacheKey);
                return JSON.parse(cachedData); 
            } 
            console.warn("Cache not available for key:", cacheKey)
        }
        console.warn("Cache system is down.")
        return null;
    }
}

export default new UserService();