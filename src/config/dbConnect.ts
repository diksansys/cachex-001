import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const uri = process.env.MONGO_DB_CONNECTION_URI ?? '';
const clientOptions = { serverApi: { version: "1" as const, strict: true, deprecationErrors: true } };

async function run() {
  // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db?.admin().command({ ping: 1 });

    console.log("Successfully connected to MongoDB!");
}

export default async function connectDB() 
{
    try {
        await run();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

