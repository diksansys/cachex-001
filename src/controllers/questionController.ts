import {Request, Response} from "express"
import mongoose from 'mongoose';
import ResponseDto from "../dto/response";
import {questionService} from "../services/questionService";

class QuestionController
{
    /**
     * API: POST /question/
     *
     * @param req
     * @param res
     */
    public async saveQuestion(req: Request, res: Response)
    {
        const response = new ResponseDto();
        
        try {
            const questionData = req.body

            if (!questionData) {
                throw new Error("Question data is required");
            }

            if (!questionData.question) {
                throw new Error("Question is required");
            }

            const savedQuestion = await questionService.submitQuestions(questionData.question);
console.log(savedQuestion)
            response.setSuccess(true);
            response.setMessage(`Question: ${savedQuestion?._id} submitted successfully`);
            response.setStatusCode(200);
        } catch (e: any) {
            console.error(e);
            response.setSuccess(false);
            response.setMessage(e.message);
            response.setStatusCode(e.statusCode ?? 500);
        }

        res.status(response.getStatusCode()).json(response.toJSON())
    }

    /**
     * API: GET question/:id
     *
     * @param req
     * @param res
     */
    public async getQuestion(req: Request, res: Response)
    {
        const response = new ResponseDto();
        try {
            const qId = req.params.id
            if (!qId) {
                throw new Error("Question ID is required");
            }

            const questionId = new mongoose.Types.ObjectId(req.params.id)

            const question = await questionService.fetchQuestions(questionId);

            response.setSuccess(true);
            response.setMessage('Question fetched successfully');
            response.setData({ question: question });
            response.setStatusCode(200);
        } catch (e: any) {
            console.error(e);
            response.setSuccess(false);
            response.setMessage(e.message);
            response.setStatusCode(e.statusCode ?? 500);
        }

        res.status(response.getStatusCode()).json(response.toJSON())
    }
}

export default new QuestionController();