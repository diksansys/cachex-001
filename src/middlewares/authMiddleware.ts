import express, { NextFunction, Request, Response } from "express"
import authHelper from "../services/authHelper";

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.accessToken
        const jwtSecret = process.env.JWT_SECRET as string;
        if (!jwtSecret) {
            res.status(500).json({ 
                success: false,
                data: {},
                error: "ERROR_AUTH_002",
                message: "Something went wrong"
             });
        }

        authHelper.getVerifiedPayload(accessToken, jwtSecret)

        next()
    } catch (error) {
        console.error(error)
        res.status(401).json({
            success: false,
            data: {},
            error: "ERROR_AUTH_004",
            message: "Authentication failed"
        })
    }
}