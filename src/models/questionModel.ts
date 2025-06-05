import mongoose from "mongoose"
import questionSchema from "./schemas/questionSchema";

const model = mongoose.model("Question", questionSchema, "questions");

export default model;