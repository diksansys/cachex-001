import { quizService } from "../../quiz-system/quiz/quiz.service";
import { adapterRegistry } from "../registry/adapter.registry";

class StartupManager {
    private static instance: StartupManager;
    
    private constructor() {}
    
    public static getInstance(): StartupManager {
        if (!StartupManager.instance) {
            StartupManager.instance = new StartupManager();
        }
        return StartupManager.instance;
    }
    
    public async initialize(): Promise<void> {
        try {
            // Connect with DB
            await adapterRegistry.db.primary.init();
            console.log("✅ DB connection established");
        
            await adapterRegistry.cache.primary.init();
            console.log("✅ Redis connection established");
        
            await adapterRegistry.writeStream.primary.init();
            console.log("✅ WriteStream connection established");
        
            await this.subscribeToWriteStream();
    
        } catch (error) {
            console.error("❌ Failed to initialize services:", error);
            throw error;
        }
    }
    
    private async subscribeToWriteStream(): Promise<void> {
        try {
            // Subscribe to the WriteStream topic 'quizAnswers'
            await adapterRegistry.writeStream.primary.subscribe("quizAnswers", async (message: any) => {
                if (message) {
                    console.log("Received message from WriteStream topic 'quizAnswers':", message);
                    try {
                        // Process the message and save to DB if necessary
                        await quizService.submitAnswersToDB(message);
                        console.log("✅ Quiz answers processed and saved to DB");
                    } catch (error) {
                        console.error("Error processing message from WriteStream topic 'quizAnswers':", error);
                    }
                }
            });
            console.log("✅ Subscribed to WriteStream topic 'quizAnswers'");

            // Add more subscriptions here if needed
            // ...
        } catch (error) {
            console.error("❌ Failed to subscribe to WriteStream topic 'quizAnswers':", error);
        }
    }
}

export const startupManager = StartupManager.getInstance();