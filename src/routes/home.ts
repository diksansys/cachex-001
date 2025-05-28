import express, { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../middlewares/authMiddleware"

const router = express.Router()

//router.use(verifyAccessToken)

router.get('hola', (req, res, next) => {
    res.send("hola gotcha puya muya")
})

router.get('amiri', (req, res, next) => {
    res.send("lets go to school so we never retire")
})

export default router