import { adapterRegistry } from "./adapterRegistry";

/**
 * Quiz Service
 * Handles quiz answer submissions and caching.
 *
 * @module quizService
 */

export const quizService = {

  submitAnswers: async ({ userId, quizId, answers }) => {
    const cacheKey = `user:${userId}:quiz:${quizId}:answer`;

    try { // Attempt to cache the answers
        if (await adapterRegistry.cache.primary.isUp()) {
            await adapterRegistry.cache.primary.set(cacheKey, JSON.stringify(answers));
        } else {
            console.warn("Redis unavailable, skipping cache");
        }
    } catch (err) {
        // If cache creation fails, fall back to DB
        // Check if DB is available before falling back
        // If DB is available, save the answers there
        // If DB is not available, log an error
        console.warn("Falling back to DB for cache creation", err);
        if (await adapterRegistry.db.primary.isUp()) {
            console.warn("Falling back to DB for cache creation");
            await adapterRegistry.db.primary.create({ userId, quizId, answers }, "userQuizes");
        } else {
            console.error ("Cache and DB both down");
        }
    }

    // Publish the answer submission event to Kafka
    // If Kafka is down, log a warning and save to DB as a fallback
    if (await adapterRegistry.writeStream.primary.isUp()) {
      await adapterRegistry.writeStream.primary.publish({
        eventType: "QUIZ_ANSWER_SUBMISSION",
        data: { userId, quizId, answers },
        eventExecutionTime: "immediate",
      });
    } else {
      console.warn("Kafka unavailable, falling back to DB");
      // If Kafka is down, check if DB is available
      // If DB is available, save the answers there
      // If DB is not available, log an error
      if (await adapterRegistry.db.primary.isUp()) {
            console.warn("Falling back to DB as primary write stream is down");
            // Save to DB as a fallback
            await adapterRegistry.db.primary.create({ userId, quizId, answers }, "userQuizes");
      } else {
          console.error ("Cache and DB both down");
      }
    }
  },
  
};
