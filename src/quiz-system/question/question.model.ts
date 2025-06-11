import mongoose from "mongoose"
import questionSchema from "./question.schema";

const model = mongoose.model("Question", questionSchema, "questions");

export default model;