import {Request, Response} from "express"
import { quizService } from "../services/quizService"



const handleUserSubmittedQuizAnswers = async (req: Request, res: Response) => 
{
   try {
        const { answers } = req.body
        const { quizId } = req.params
        const userId = getUserIdFromToken(req.headers)

        await quizService.submitAnswers({
            userId: userId,
            quizId: quizId,
            answers: answers
        })

        res.status(200).json({success: true, message: "saved", data: {}})
   } catch (err) {
        console.error("ERROR! Answer asubmission error", err);
        res.status(200).json({success: false, message: "Something went wrong", data: {}})
   }
}

const handleUserRequestedQuizAnswers = (req: Request, res: Response) => 
{

}

export default {
    handleUserSubmittedQuizAnswers,
    handleUserRequestedQuizAnswers
}


function getUserIdFromToken(req: Request): number | null {
    return 1983456; // TO DO
}
