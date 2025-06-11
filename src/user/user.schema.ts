import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: String,
    email: String,
    passwordHash: String,
    createdAt: String,
    updatedAt: String 
})

export default userSchema