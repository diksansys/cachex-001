import mongoose, { Schema } from 'mongoose';
import userQuizSchema from './schemas/userQuizSchema';

const userQuizes = new mongoose.model('UserQuiz', userQuizSchema, 'userQuizes');

export default userQuizes;