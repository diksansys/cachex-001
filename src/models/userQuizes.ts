import mongoose, { Schema } from 'mongoose';
import userQuizSchema from './schemas/userQuizSchema';

const userQuizes = mongoose.model('UserQuiz', userQuizSchema, 'userQuizes');

export default userQuizes;