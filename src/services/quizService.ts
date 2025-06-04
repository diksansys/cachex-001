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

class QuizService {

  private getCacheKey (userId: mongoose.Types.ObjectId, quizId: mongoose.Types.ObjectId) {
    return `user:${userId}:quiz:${quizId}:answer`;
  }

  async submitAnswers (answer: QuizAnswer) {
    // Validate the answer structure
    try { // Attempt to cache the answers
        if (await adapterRegistry.cache.primary.isUp()) {
            await adapterRegistry.cache.primary.set(this.getCacheKey(answer.userId, answer.quizId), JSON.stringify(answer));
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
  }

  async fetchAnswers (userId: mongoose.Types.ObjectId, quizId: mongoose.Types.ObjectId) {
    
    // Attempt to fetch from cache first
    if (await adapterRegistry.cache.primary.isUp()) {
      const cachedAnswer = await adapterRegistry.cache.primary.get(this.getCacheKey(userId, quizId));
      if (cachedAnswer) {
        return JSON.parse(cachedAnswer) as QuizAnswer;
      } else {
        console.warn("No cached answer found, fetching from DB");
        
        // If cache is not available or no cached answer found, fetch from DB
        return await this.fetchAnswersFromDB(userId, quizId);
      }
    } else {
      console.warn("Redis unavailable, skipping cache fetch");

      // If cache is not available or no cached answer found, fetch from DB
      return await this.fetchAnswersFromDB(userId, quizId);
    }
    
  }

  async fetchAnswersFromDB (userId: mongoose.Types.ObjectId, quizId: mongoose.Types.ObjectId) {
    if (await adapterRegistry.db.primary.isUp()) {
      const answer = await adapterRegistry.db.primary.findOne({
        userId: userId,
        quizId: quizId
      }, "UserQuiz");
      if (answer) {
        // Optionally, cache the answer after fetching from DB
        await adapterRegistry.cache.primary.set(this.getCacheKey(userId, quizId), JSON.stringify(answer));
        return answer as QuizAnswer;    
      }
    }
    console.error("Database is not available, cannot fetch quiz answers");
    return null; // Return null if no answer found
  }
  
  async submitAnswersToDB (answer: QuizAnswer) {
    // Directly save the quiz answers to the database
    if (await adapterRegistry.db.primary.isUp()) {
      await adapterRegistry.db.primary.create(answer, "UserQuiz");
    } else {
      console.error("Database is not available, cannot save quiz answers");
    }
  }
}

export const quizService = new QuizService();
