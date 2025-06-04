import mongoose from "mongoose";
import dotenv from "dotenv"
import userQuizSchema from "../../models/schemas/userQuizSchema";
import userQuizes from "../../models/userQuizes";

dotenv.config()

/**
 * Primary DB adapter: MongoDB based
 */
class PrimaryDbAdapter {
    /**
     * Primary DB adapter: MongoDB based
     */
    private modelMap: { [key: string]: any };

    constructor() {
        this.modelMap = {
            UserQuiz: userQuizes
        };
    }

    async connect() {
        const uri = <string>process.env.MONGO_DB_CONNECTION_URI;
        if (!uri) {
            console.error("ERROR! DB Connection string not found");
            return;
        }

        const clientOptions = { serverApi: { version: "1" as const, strict: true, deprecationErrors: true } };

        try {
            await mongoose.connect(uri, clientOptions);
            await mongoose.connection.db?.admin().command({ ping: 1 });

            console.log("Successfully connected to MongoDB!");
        } catch (err) {
            console.error("DB connection error", err);
        }
    }

    getModel(modelAlias: string) {
        if (!this.modelMap[modelAlias]) {
            throw new Error(`Model "${modelAlias}" not found in dbAdapter.`);
        }
        return this.modelMap[modelAlias];
    }

    async isConnected() {
        return mongoose.connection.readyState === 1;
    }

    async isServiceUp() {
        try {
            const result = await mongoose.connection.db?.admin().command({ ping: 1 });
            return result?.ok === 1;
        } catch (err) {
            console.error("ERROR! DB connection failure", err);
            return false;
        }
    }

    async create(data: any, doc: string) {
        if (!data || !doc) {
            console.error("Invalid data provided");
            throw new Error("Error! Invalid data provided");
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

    async getAll(dataId: any) {
        if (!dataId) {
            console.error("Invalid data provided", dataId);
            throw new Error("Error! Invalid data provided");
        }

        try {
            const Model = this.getModel("UserQuiz");
            const docs = await Model.find({ userId: dataId });
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

    async get(query: any, doc: string) {
        if (!query || !doc) {
            console.error("Invalid query or document provided");
            throw new Error("Error! Invalid query or document provided");
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

    async update(dataId: any, data: any, doc: string) {
        if (!data || !doc) {
            console.error("Invalid data provided");
            throw new Error("Error! Invalid data provided");
        }

        try {
            const Model = this.getModel(doc);
            const docInstance = await Model.findById(dataId);
            if (!docInstance) {
                console.error("Document not found", dataId);
                throw new Error("Error! Document not found");
            }
            Object.assign(docInstance, data);
            return await docInstance.save();
        } catch (err) {
            console.error("ERROR! Unable to update data in DB", err);
            throw new Error("Error! Unable to update data in DB");
        }
    }

    async delete(dataId: any) {
        if (!dataId) {
            console.error("Invalid data provided", dataId);
            throw new Error("Error! Invalid data provided");
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