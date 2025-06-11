import express from "express"
import {Request, Response} from "express"
import authController from "../../auth/auth.controller"
import { verifyAccessToken } from "../middlewares/auth.middleware"
import cacheController from "../../cache-system/cache.controller"
import quizController from "../../quiz-system/quiz/quiz.controller"
import questionController from "../../quiz-system/question/question.controller"
import userController from "../../user/user.controller"

const router = express.Router()


// router.use('/api/v1', verifyAccessToken, homeRoutes)
// router.use('/api/auth', loginRoutes)

router.get('/', (req: Request, res: Response) => { res.status(200).json({"hello": "world"}) })

router.post('/register', userController.handleUserAdd)
router.post('/login', authController.handleLogin)
router.post('/logout', authController.handleLogout)
router.post('/refresh', authController.handleRefreshTokenRequest)
router.get('/me', verifyAccessToken, userController.handleGetUserDetails)

router.post('/cache/add', cacheController.handleSaveCache)
router.post('/cache/remove', cacheController.handleRemoveCache)
router.post('/vnode/add', cacheController.handleSaveVnode)
router.post('/vnode/remove', cacheController.handleRemoveVnode)

router.post("/quiz/:id/answers", quizController.handleUserSubmittedQuizAnswers)
router.get("/quiz/:id/answers", quizController.handleUserRequestedQuizAnswers)

router.post("/question", questionController.saveQuestion)
router.get("/question/:id", questionController.getQuestion)

export default router