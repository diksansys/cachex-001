import {Request, Response} from "express"
import { quizService } from "../services/quizService"
import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * API: POST /quiz/:id/answers
 *
 * @param req
 * @param res
 */
const handleUserSubmittedQuizAnswers = async (req: Request, res: Response) => 
{
   const response = {
        success: false,
        statusCode: 500,
        message: "Something went wrong",
        data: {}
   }

   try {
        const answers = req.body
        const quizId = deterministicObjectId(req.params.id)
        const userId = getUserIdFromToken(req)

        if (!userId) {
            throw new Error("User ID is required"); 
        }
        else if (!quizId) {
            throw new Error("Quiz ID is required");
        }
        else if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
            throw new Error("Answers are required");
        } 
        else {
            // Validate answers structure
            for (const questionId in answers) {
                if (!Array.isArray(answers[questionId]) || answers[questionId].length === 0) {
                    throw new Error(`Invalid answers for question ${questionId}`);
                }
            }

            await quizService.submitAnswers({
                userId: userId,
                quizId: quizId,
                answers: answers
            })

            response.success = true
            response.statusCode = 200
            response.message = "Answers submitted successfully"
            response.data = {
                userId: userId,
                quizId: quizId  
            }
        }
   } catch (err: any) {
        console.error("ERROR! Answer submission error", err);
        response.message = err.message || "An error occurred while submitting answers";
        response.success = false
        response.data = {}
        response.statusCode = 500
   }

   res.status(response.statusCode).json({success: response.success, message: response.message, data: response.data})
}

/**
 * API: GET quiz/:id/answers
 *
 * @param req
 * @param res
 */
const handleUserRequestedQuizAnswers = async (req: Request, res: Response) => 
{
    const response = {
        success: false,
        statusCode: 500,
        message: "Something went wrong",
        data: {}
    }

   try {
        const quizId = deterministicObjectId(req.params.id)
        const userId = getUserIdFromToken(req)

        if (!userId) {
            throw new Error("User is not logged in"); 
        }
        else if (!quizId) {
            throw new Error("Quiz ID is required");
        }
        else {
            // Validate answers structur
            const quizData = await quizService.fetchAnswers(userId, quizId)

            response.success = true
            response.statusCode = 200
            response.message = "Answers fetched successfully"
            response.data = quizData || {}
        }
   } catch (err: any) {
        console.error("ERROR! Answer retrival error", err);
        response.message = err.message || "An error occurred while fetching answers";
        response.success = false
        response.data = {}
        response.statusCode = 500
   }

   res.status(response.statusCode).json({success: response.success, message: response.message, data: response.data})
}

const deterministicObjectId = (input: string): mongoose.Types.ObjectId => {
    // Hash the input string to a 12-byte buffer
    const hash = crypto.createHash('md5').update(input).digest();

    // md5 digest is 16 bytes, slice to 12 bytes for ObjectId
    const buffer12 = hash.slice(0, 12);

    // Create ObjectId from buffer
    return new mongoose.Types.ObjectId(buffer12);
}

const getUserIdFromToken = (req: Request): mongoose.Types.ObjectId => {
    return deterministicObjectId("shudhansh.shekhar.dubey"); // TO DO
}

export default {
    handleUserSubmittedQuizAnswers,
    handleUserRequestedQuizAnswers
}
