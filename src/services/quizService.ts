import { adapterRegistry } from "./adapterRegistry";
import mongoose from 'mongoose';

interface QuizAnswer {
  userId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  answers: Record<string, string[]>;
}

/**
 * Quiz Service
 * Handles quiz answer submissions and caching.
 *
 * @module quizService
 */

export const quizService = {

  submitAnswers: async (answer: QuizAnswer) => {
    const cacheKey = `user:${answer.userId}:quiz:${answer.quizId}:answer`;
    console.log(await adapterRegistry.cache.primary.isUp());
    try { // Attempt to cache the answers
        if (await adapterRegistry.cache.primary.isUp()) {
            await adapterRegistry.cache.primary.set(cacheKey, JSON.stringify(answer));
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
            await adapterRegistry.db.primary.create(answer, "UserQuiz");
        } else {
            console.error ("Cache and DB both down");
        }
    }

    // Publish the answer submission event to Kafka
    // If Kafka is down, log a warning and save to DB as a fallback
    if (await adapterRegistry.writeStream.primary.isUp()) {
      await adapterRegistry.writeStream.primary.publish(
        "quizAnswers",
        answer
      );
    } else {
      console.warn("Kafka unavailable, falling back to DB");
      // If Kafka is down, check if DB is available
      // If DB is available, save the answers there
      // If DB is not available, log an error
      if (await adapterRegistry.db.primary.isUp()) {
            console.warn("Falling back to DB as primary write stream is down");
            // Save to DB as a fallback
            await adapterRegistry.db.primary.create(answer, "UserQuiz");
      } else {
          console.error ("Cache and DB both down");
      }
    }
  },
  
  submitAnswersToDB: async (answer: QuizAnswer) => {
    // Directly save the quiz answers to the database
    if (await adapterRegistry.db.primary.isUp()) {
      await adapterRegistry.db.primary.create(answer, "UserQuiz");
    } else {
      console.error("Database is not available, cannot save quiz answers");
    }
  }
};
