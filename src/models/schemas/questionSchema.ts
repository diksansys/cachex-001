import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    description: { type: String, required: true }, // question texts
    type: { type: String, required: true }, // multiple-choice, single-choice, subjective
    options: { type: [String], required: false }, // in case of choice questions
    answer: { type: [String], required: true }, // answer as text or choice
    difficulty: { type: Number, required: true }, // 1. Easy, 2. Medium, 3. Hard, 4. Tough
    category: { type: String }, // react / vue / etc.
    tags: { type: [String] }, // [ javascript, react ]
    isActive: { type: Boolean, required: true, default: true } // this question can be used in a quiz
}, { timestamps: true });

export default questionSchema;