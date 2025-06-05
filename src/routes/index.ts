import express from "express"
import homeRoutes from "./home"
import loginRoutes from "./login"
import { verifyAccessToken } from "../middlewares/authMiddleware"
import cacheController from "../controllers/cacheController"
import { Request, Response, NextFunction } from "express"
import quizController from "../controllers/quizController"
import questionController from "../controllers/questionController";

const router = express.Router()


// router.use('/api/v1', verifyAccessToken, homeRoutes)
// router.use('/api/auth', loginRoutes)

router.get('/', (req: Request, res: Response) => { res.status(200).json({"hello": "world"}) })

router.post('/cache/add', cacheController.handleSaveCache)
router.post('/cache/remove', cacheController.handleRemoveCache)
router.post('/vnode/add', cacheController.handleSaveVnode)
router.post('/vnode/remove', cacheController.handleRemoveVnode)

router.post("/quiz/:id/answers", quizController.handleUserSubmittedQuizAnswers)
router.get("/quiz/:id/answers", quizController.handleUserRequestedQuizAnswers)

router.post("/question", questionController.saveQuestion)
router.get("/question/:id", questionController.getQuestion)

export default router