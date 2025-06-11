import mongoose from "mongoose";
import userSchema from "./user.schema";

const User = mongoose.model('User', userSchema, 'users')

export default User