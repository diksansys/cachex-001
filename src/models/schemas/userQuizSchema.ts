import mongoose, { Schema } from "mongoose";

const userQuizSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true,
        index: true
    },
    answers: { // { QuestionID: [ answer1, answer2 ], ..so on }
        type: mongoose.Schema.Types.Mixed,
        required: false
    }, 
    isStarted: {
        type: Boolean,
        default: false,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false,
        required: true
    },
    submittedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

userQuizSchema.index({ userId: 1, quizId: 1 }, { unique: true });

export default userQuizSchema;