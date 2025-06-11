import mongoose from "mongoose";
import { adapterRegistry } from "../../common/registry/adapter.registry";

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
    /**
     * API: Quiz Answer Submission/Creation
     *
     * Submits the provided quiz answers to the appropriate storage mediums and publishes an event.
     * Performs caching, database fallback, and publishes to a Kafka stream.
     */
    public async submitAnswers(answer: QuizAnswer): Promise<void> {
        // WRITE-BEHIND STRATEGY for answer submission
        try {
            // Attempt to cache the answers
            const isCacheAvailable = await adapterRegistry.cache.primary.isUp();
            if (isCacheAvailable) {
                await this.submitAnswersToCache(answer);
            } else {
                console.warn("Redis unavailable, skipping cache");
                throw new Error("Cannot cache quiz answers");
            }
        } catch (err) {
            console.warn("Falling back to DB for cache creation", err);

            const isDbAvailable = await adapterRegistry.db.primary.isUp();
            if (isDbAvailable) {
                await this.submitAnswersToDB(answer);
            } else {
                console.error("Cache and DB both down. Cannot submit quiz answers.");
            }
        }

        // Publish the answer submission event to Kafka
        const isKafkaAvailable = await adapterRegistry.writeStream.primary.isUp();
        if (isKafkaAvailable) {
            await this.streamAnswersToKafka(answer);
        } else {
            console.warn("Kafka unavailable, falling back to DB");
            const isDbAvailable = await adapterRegistry.db.primary.isUp();
            if (isDbAvailable) {
                await this.submitAnswersToDB(answer);
            } else {
                console.error("Cache and DB both down");
            }
        }
    }

    /**
     * API: Quiz Answer Query
     *
     * @param userId
     * @param quizId
     */
    public async fetchAnswers(
        userId: mongoose.Types.ObjectId,
        quizId: mongoose.Types.ObjectId
    ) {
        // 1.1 CACHE RETRIEVAL
        const isCacheAvailable = await adapterRegistry.cache.primary.isUp();
        if (isCacheAvailable) {
            const cachedAnswer = await this.fetchAnswersFromCache(userId, quizId);
            if (cachedAnswer) {
                return cachedAnswer;
            } else {
                console.warn("No cached answer found, fetching from DB");

                // 1.2 DB RETRIEVAL ( NO CACHE FOUND FALLBACK )
                const isDbAvailable = await adapterRegistry.db.primary.isUp();
                if (isDbAvailable) {
                    return await this.fetchAnswersFromDB(userId, quizId);
                }

                console.error("Cache and Database both are not available");
                throw new Error("Cannot fetch quiz answers");
            }
        }
        // 2.1 DB RETRIEVAL ( CACHE UNAVAILABLE FALLBACK )
        else {
            console.warn("Redis unavailable, skipping cache fetch");

            const isDbAvailable = await adapterRegistry.db.primary.isUp();
            if (isDbAvailable) {
                return await this.fetchAnswersFromDB(userId, quizId);
            }

            // 2.2 DB UNAVAILABLE FALLBACK (ALL SOURCES BLOCKED)
            console.error("Cache and Database both are not available");
            throw new Error("Cannot fetch quiz answers");
        }
    }

    /**
     * Kafka Consumer: Submitting answers to db
     * @param answer
     */
    public async submitAnswersToDB(answer: QuizAnswer)
    {
        const query = new Map<string, any>();
        const isAnswerExists = await adapterRegistry.db.primary.has(
            {
                userId: answer.userId,
                quizId: answer.quizId
            },
            'UserQuiz'
        )
        if (isAnswerExists) {
            query.set('userId', answer.userId);
            query.set('quizId', answer.quizId);
        }

        await adapterRegistry.db.primary.save(query, answer, "UserQuiz");
    }

    private async fetchAnswersFromDB(
        userId: mongoose.Types.ObjectId,
        quizId: mongoose.Types.ObjectId
    ) {
        const answer = await adapterRegistry.db.primary.findOne(
            {
                userId: userId,
                quizId: quizId,
            },
            "UserQuiz"
        );
        if (answer) {
            // Optionally, cache the answer after fetching from DB
            await adapterRegistry.cache.primary.set(
                this.getCacheKey(userId, quizId),
                JSON.stringify(answer)
            );
            return answer as QuizAnswer[];
        }
        return false;
    }

    private async fetchAnswersFromCache(userId: mongoose.Types.ObjectId, quizId: mongoose.Types.ObjectId): Promise<QuizAnswer | null>
    {
        const cachedAnswer = await adapterRegistry.cache.primary.get( this.getCacheKey(userId, quizId) );
        if (cachedAnswer) {
            return JSON.parse(cachedAnswer) as QuizAnswer;
        }
        return null;
    }

    private async submitAnswersToCache(answer: QuizAnswer)
    {
        await adapterRegistry.cache.primary.set(
            this.getCacheKey(answer.userId, answer.quizId),
            JSON.stringify(answer)
        );
    }

    private async streamAnswersToKafka(answer: QuizAnswer)
    {
        await adapterRegistry.writeStream.primary.publish("quizAnswers", answer);
    }

    private getCacheKey(
        userId: mongoose.Types.ObjectId,
        quizId: mongoose.Types.ObjectId
    ) {
        return `user:${userId}:quiz:${quizId}:answer`;
    }
}

export const quizService = new QuizService();
