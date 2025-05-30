import mongoose from "mongoose";
import dotenv from "dotenv"
import userQuizes from "../../models/userQuizes";
import userQuizSchema from "../../models/schemas/userQuizSchema";

dotenv.config()

const modelMap: { [key: string]: any } = {
    UserQuiz: mongoose.model('userQuizes', userQuizSchema)
}

/**
 * Primary DB adapter: MongoDB based
 */
export const primaryDbAdapter = {
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
    },

    getModel: (modelAlias: string) => {
        if (!modelMap[modelAlias]) {
        throw new Error(`Model "${modelAlias}" not found in dbAdapter.`);
        }
        return modelMap[modelAlias];
    },

    isServiceUp: async () => {
        try {
            const result = await mongoose.connection.db?.admin().command({ ping: 1 });
            return result?.ok === 1;
        } catch (err) {
            console.error("ERROR! DB connection failure", err)
            return false;
        }
    },

    create: async (data: any, doc: string) => {
        if (!data || !doc) {
            console.error("Invalid data provided")
            throw new Error("Error! Invalid data provided")
        }

        try {
            const Model = primaryDbAdapter.getModel(doc);
            const docInstance = new Model(data)
            return await docInstance.save()
        } catch(err) {
            console.error("ERROR! nable to create data in DB", err)
            throw new Error("Error! Unable to create data in DB")
        }
    },

    getAll: async (dataId: any) => {
        if (!dataId) {
            console.error("Invalid data provided", dataId)
            throw new Error("Error! Invalid data provided")
        }

        try {
            const Model = primaryDbAdapter.getModel("UserQuiz");
            const docs = await Model.find({ userId: dataId });
            if (!docs || docs.length === 0) {
                console.error("No documents found for userId", dataId)
                throw new Error("Error! No documents found for userId")
            }
            return docs;
        } catch(err) {
            console.error("ERROR! Unable to get data from DB", err)
            throw new Error("Error! Unable to get data from DB")
        }
    },

    get: async (dataId: any) => {
        if (!dataId) {
            console.error("Invalid data provided", dataId)
            throw new Error("Error! Invalid data provided")
        }

        try {
            const Model = primaryDbAdapter.getModel("UserQuiz");
            const docInstance = await Model.findById(dataId);
            if (!docInstance) {
                console.error("Document not found", dataId)
                throw new Error("Error! Document not found")
            }
            return docInstance;
        } catch(err) {
            console.error("ERROR! Unable to get data from DB", err)
            throw new Error("Error! Unable to get data from DB")
        }
    },

    update: async (dataId: any, data: any, doc: string) => {
        if (!data || !doc) {
            console.error("Invalid data provided")
            throw new Error("Error! Invalid data provided")
        }

        try {
            const Model = primaryDbAdapter.getModel(doc);
            const docInstance = Model.findById(dataId);
            if (!docInstance) {
                console.error("Document not found", dataId)
                throw new Error("Error! Document not found")
            }
            Object.assign(docInstance, data);
            // Save the updated document    
            return await docInstance.save()
        } catch(err) {
            console.error("ERROR! nable to create data in DB", err)
            throw new Error("Error! Unable to create data in DB")
        }
    },

    delete: async (dataId: any) => {
        if (!dataId) {
            console.error("Invalid data provided", dataId)
            throw new Error("Error! Invalid data provided")
        }

        try {
            const Model = primaryDbAdapter.getModel("UserQuiz");
            const result = await Model.findByIdAndDelete(dataId);
            if (!result) {
                console.error("Document not found", dataId)
                throw new Error("Error! Document not found")
            }
            return result;
        } catch(err) {
            console.error("ERROR! Unable to delete data in DB", err)
            throw new Error("Error! Unable to delete data in DB")
        }
    }
}