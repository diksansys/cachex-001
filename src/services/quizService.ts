import { inflowHandler } from "./inflowHandler";

export const quizService = {

  submitAnswers: async ({ userId, quizId, answers }) => {
    const cacheKey = `user:${userId}:quiz:${quizId}:answer`;

    try {
        if (inflowHandler.getRedisAdapter().isRedisUp()) {
            await inflowHandler.getRedisAdapter().set(cacheKey, JSON.stringify(answers));
        } else {
            console.warn("Redis unavailable, skipping cache");
        }
    } catch (err) {
        console.error("Cache creation failed", err)

         if (inflowHandler.getDbAdapter().isDbUp()) {
            await inflowHandler.getDbAdapter().save({
                dataType: "QUIZ_ANSWERS",
                data: { userId, quizId, answers },
            });
        } else {
            console.error ("Cache and DB both down");
        }
    }

    if (inflowHandler.getKafkaAdapter().isKafkaUp()) {
      await inflowHandler.getKafkaAdapter().publish({
        eventType: "QUIZ_ANSWER_SUBMISSION",
        data: { userId, quizId, answers },
        eventExecutionTime: "immediate",
      });
    } else {
      console.warn("Kafka unavailable, falling back to DB");

      if (inflowHandler.getDbAdapter().isDbUp()) {
        await inflowHandler.getDbAdapter().save({
          dataType: "QUIZ_ANSWERS",
          data: { userId, quizId, answers },
        });
      } else {
        throw new Error("Kafka and DB both down");
      }
    }
  },
  
};
