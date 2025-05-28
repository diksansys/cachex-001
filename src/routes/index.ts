import express from "express"
import homeRoutes from "./home"
import loginRoutes from "./login"
import { verifyAccessToken } from "../middlewares/authMiddleware"

const router = express.Router()

router.use('/', (req, res) => { res.status(200).json({"hello": "world"}) })
router.use('/api/v1', verifyAccessToken, homeRoutes)
router.use('/api/auth', loginRoutes)

export default router