import mongoose from "mongoose";
import { adapterRegistry } from "../../common/registry/adapter.registry";

interface Question {
    _id?: mongoose.Types.ObjectId | null,
    description: string, // question texts
    type: string, // multiple-choice, single-choice, subjective
    options?: string[] | null, // in case of choice questions
    answer: string[], // answer as text or choice
    difficulty: number, // 1. Easy, 2. Medium, 3. Hard, 4. Tough
    category: string, // react / vue / etc.
    tags: string[], // [ javascript, react ]
}

class QuestionService {

    public async submitQuestions(question: Question): Promise<Question | null> {
        // CACHE-ALONG STRATEGY for question submission, as very low traffic expected for it
        try {
            const isDbAvailable = await adapterRegistry.db.primary.isUp();
            if (!isDbAvailable) {
                console.warn("DB unavailable. No questions will be saved.");
            } else {
                const newQuestion = await this.submitQuestionsToDB(question);
                if (newQuestion) {
                    await this.submitQuestionsToCache(newQuestion);
                } else {
                    console.warn("Question not saved");
                }
                return newQuestion;
            }
        } catch (err) {
            console.warn("Something went wrong", err);
        }
        return null;
    }

    public async fetchQuestions(questionId: mongoose.Types.ObjectId): Promise<Question | null> {
        try {
            const isCacheAvailable = await adapterRegistry.cache.primary.isUp();
            if (isCacheAvailable) {
                const cachedQuestion = await this.fetchQuestionsFromCache(questionId);
                if (cachedQuestion) {
                    return cachedQuestion;
                } else {

                }
            } else {
                console.warn("Redis unavailable, skipping cache");
            }

            const isDbAvailable = await adapterRegistry.db.primary.isUp();
            if (isDbAvailable) {
                await this.fetchQuestionsFromDB(questionId);
            } else {
                console.warn("DB unavailable. No questions will be saved.");
            }
        } catch (err) {
            console.warn("Something went wrong", err);
        }
        return null;
    }

    public async submitQuestionsToDB(question: Question)
    {
        if (question._id) {
            const query = {} as any;
            const isQuestionExists = await adapterRegistry.db.primary.has(
                {
                    _id: question._id
                },
                'Question'
            )
            if (isQuestionExists) {
                query._id = question._id;
                return await adapterRegistry.db.primary.save(query, question, "Question");
            }
        }

        return await adapterRegistry.db.primary.create(question, "Question");
    }

    private async fetchQuestionsFromDB(
        questionId: mongoose.Types.ObjectId
    ) {
        const question: Question[] = await adapterRegistry.db.primary.findOne(
            {
                _id: questionId
            },
            "Question"
        );
        if (question) {
            // Optionally, cache the answer after fetching from DB
            await this.submitQuestionsToCache(question[0] as Question);
            return question[0] as Question;
        }
        return null;
    }

    private async submitQuestionsToCache(question: Question) {
        const isCacheAvailable = await adapterRegistry.cache.primary.isUp();
        if (!isCacheAvailable) {
            console.warn("Redis unavailable, skipping cache");
        } else {
            if (!question._id) {
                console.warn("Question ID is not provided. Skipping cache")
            } else {
                await adapterRegistry.cache.primary.set(
                    this.getCacheKey(question._id),
                    JSON.stringify(question)
                );
            }
        }
    }

    private async fetchQuestionsFromCache(questionId: mongoose.Types.ObjectId): Promise<Question | null>
    {
        const cachedQuestion = await adapterRegistry.cache.primary.get( this.getCacheKey(questionId) );
        if (cachedQuestion) {
            return JSON.parse(cachedQuestion) as Question;
        }
        return null;
    }

    private getCacheKey(
        questionId: mongoose.Types.ObjectId
    ) {
        return `question:${questionId}`;
    }
}

export const questionService = new QuestionService();
