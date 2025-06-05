import mongoose from "mongoose"
import quizSchema from "./schemas/quizSchema";

const model = mongoose.model("Quiz", quizSchema, "quizzes");

export default model;