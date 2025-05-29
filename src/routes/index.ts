import express from "express"
import homeRoutes from "./home"
import loginRoutes from "./login"
import { verifyAccessToken } from "../middlewares/authMiddleware"
import cacheController from "../controllers/cacheController"
import { Request, Response, NextFunction } from "express"

const router = express.Router()


// router.use('/api/v1', verifyAccessToken, homeRoutes)
// router.use('/api/auth', loginRoutes)

router.get('/', (req: Request, res: Response) => { res.status(200).json({"hello": "world"}) })

router.post('/cache/add', cacheController.handleSaveCache)
router.post('/cache/remove', cacheController.handleRemoveCache)
router.post('/vnode/add', cacheController.handleSaveVnode)
router.post('/vnode/remove', cacheController.handleRemoveVnode)

export default router