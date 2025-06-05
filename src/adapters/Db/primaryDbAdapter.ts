import mongoose from "mongoose";
import dotenv from "dotenv";
import userQuizes from "../../models/userQuizes";
import questionModel from "../../models/questionModel";
import quizModel from "../../models/quizModel";
import users from "../../models/users";

dotenv.config();

/**
 * Primary DB adapter: MongoDB based
 */
class PrimaryDbAdapter {
    /**
     * Primary DB adapter: MongoDB based
     */
    private readonly modelMap: { [key: string]: mongoose.Model<any> };

    constructor() {
        this.modelMap = {
            UserQuiz: userQuizes,
            Question: questionModel,
            Quiz: quizModel,
            User: users
        };
    }

    async connect(): Promise<void> {
        const uri = process.env.MONGO_DB_CONNECTION_URI;
        if (!uri) {
            console.error("ERROR! DB Connection string not found");
            throw new Error("DB connection URI is not defined in environment variables");
        }

        const clientOptions = {serverApi: {version: "1" as const, strict: true, deprecationErrors: true}};

        try {
            await mongoose.connect(uri, clientOptions);
            await mongoose.connection.db?.admin().command({ping: 1});
            console.log("Successfully connected to MongoDB!");
        } catch (err) {
            console.error("DB connection error", err);
            throw new Error("Error connecting to MongoDB");
        }
    }

    getModel(modelAlias: string): mongoose.Model<any> {
        if (!this.modelMap[modelAlias]) {
            throw new Error(`Model "${modelAlias}" not found in dbAdapter.`);
        }
        return this.modelMap[modelAlias];
    }

    async isConnected(): Promise<boolean> {
        return mongoose.connection.readyState === 1;
    }

    async isServiceUp(): Promise<boolean> {
        try {
            const result = await mongoose.connection.db?.admin().command({ping: 1});
            return result?.ok === 1;
        } catch (err) {
            console.error("ERROR! DB connection failure", err);
            return false;
        }
    }

    async has(query: Record<string, any>, doc: string): Promise<boolean> {
        try {
            const Model = this.getModel(doc);
            const result = await Model.findOne(query);
            return !!result;
        } catch (err) {
            console.error("ERROR! Unable to check data in DB", err);
            throw new Error("Error! Unable to check data in DB");
        }
    }

    async create(data: Record<string, any>, doc: string): Promise<any> {
        if (!data || !doc) {
            console.error("Invalid data or document name provided");
            throw new Error("Error! Invalid data or document name provided");
        }

        try {
            const Model = this.getModel(doc);
            const docInstance = new Model(data);
            return await docInstance.save();
        } catch (err) {
            console.error("ERROR! Unable to create data in DB", err);
            throw new Error("Error! Unable to create data in DB");
        }
    }

    async getAll(dataId: string): Promise<any[]> {
        if (!dataId) {
            console.error("Invalid dataId provided", dataId);
            throw new Error("Error! Invalid dataId provided");
        }

        try {
            const Model = this.getModel("UserQuiz");
            const docs = await Model.find({userId: dataId});
            if (!docs || docs.length === 0) {
                console.error("No documents found for userId", dataId);
                throw new Error("Error! No documents found for userId");
            }
            return docs;
        } catch (err) {
            console.error("ERROR! Unable to get data from DB", err);
            throw new Error("Error! Unable to get data from DB");
        }
    }

    async get(query: Record<string, any>, doc: string): Promise<any[]> {
        if (!query || !doc) {
            console.error("Invalid query or document name provided");
            throw new Error("Error! Invalid query or document name provided");
        }
        try {
            const Model = this.getModel(doc);
            const docs = await Model.find(query);
            if (!docs || docs.length === 0) {
                console.error("No documents found for query", query);
                throw new Error("Error! No documents found for query");
            }
            return docs;
        } catch (err) {
            console.error("ERROR! Unable to get data from DB", err);
            throw new Error("Error! Unable to get data from DB");
        }
    }

    async update(dataId: string, data: Record<string, any>, doc: string): Promise<void> {
        if (!data || !doc) {
            console.error("Invalid data or document name provided");
            throw new Error("Error! Invalid data or document name provided");
        }

        try {
            const Model = this.getModel(doc);
            const docInstance = await Model.findById(dataId);
            if (!docInstance) {
                console.error("Document not found", dataId);
                throw new Error("Error! Document not found");
            }
            Object.assign(docInstance, data);
            await docInstance.save();
        } catch (err) {
            console.error("ERROR! Unable to update data in DB", err);
            throw new Error("Error! Unable to update data in DB");
        }
    }

    async save(query: any, data: Record<string, any>, doc: string): Promise<any> {
        if (!data || !doc) {
            console.error("Invalid data or document name provided");
            throw new Error("Error! Invalid data or document name provided");
        }

        try {
            const Model = this.getModel(doc);
            return await Model.findOneAndUpdate(
                query,
                { $set: data }, // safer update structure
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true, // optional but helpful if you use defaults in your schema
                }
            ).exec();
        } catch (err) {
            console.error("ERROR! Unable to save data in DB", err);
            throw new Error("Error! Unable to save data in DB");
        }
    }

    async delete(dataId: string): Promise<any> {
        if (!dataId) {
            console.error("Invalid dataId provided", dataId);
            throw new Error("Error! Invalid dataId provided");
        }

        try {
            const Model = this.getModel("UserQuiz");
            const result = await Model.findByIdAndDelete(dataId);
            if (!result) {
                console.error("Document not found", dataId);
                throw new Error("Error! Document not found");
            }
            return result;
        } catch (err) {
            console.error("ERROR! Unable to delete data in DB", err);
            throw new Error("Error! Unable to delete data in DB");
        }
    }
}

export const primaryDbAdapter = new PrimaryDbAdapter();