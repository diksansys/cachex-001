import express from  "express"
import quizController from "../controllers/quizController"

const router = express.Router()

router.post("/:id", quizController.handleUserSubmittedQuizAnswers)
router.get("/:id", quizController.handleUserRequestedQuizAnswers)