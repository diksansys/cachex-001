import mongoose from "mongoose"

const quizSchema = new mongoose.Schema({
    title: String, // title for quiz
    description: String, // some description about quiz
    difficultyRange: [Number], // [ 1, 2 ] : 1. Easy, 2. Medium, 3. Hard, 4. Tough
    selectionStrategy: String, // random / adaptive
    tags: [String],
    cooldownPeriod: Number,
    isActive: Boolean,
    startedAt: {
        type: Date,
        default: null
    },
    endedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export default quizSchema;