import mongoose from "mongoose"
import quizSchema from "./quiz.schema";

const model = mongoose.model("Quiz", quizSchema, "quizzes");

export default model;