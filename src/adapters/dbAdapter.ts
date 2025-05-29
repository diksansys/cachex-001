import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

export const dbAdapter = () => {

    connect : async () => {
        const uri = process.env.MONGO_DB_CONNECTION_URI
        if (!uri) {
            console.error("ERROR! DB Connection string not found")
        }

        const clientOptions = { serverApi: { version: "1" as const, strict: true, deprecationErrors: true } };

        try {
            await mongoose.connect(uri, clientOptions);
            await mongoose.connection.db?.admin().command({ ping: 1 });

            console.log("Successfully connected to MongoDB!");
        } catch (err) {
            console.error("DB connection error", err)
        }
    }

    isDbUp: async () => {
        //
    }
}

