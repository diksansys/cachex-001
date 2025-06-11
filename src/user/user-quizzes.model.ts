import mongoose, { Schema } from 'mongoose';
import userQuizSchema from './user-quizzes.schema';

const userQuizes = mongoose.model('UserQuiz', userQuizSchema, 'userQuizes');

export default userQuizes;