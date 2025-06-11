import express, { NextFunction, Request, Response } from "express"
import dotenv from "dotenv";
import authService from "../../auth/auth.service";

dotenv.config()

declare module 'express' {
  interface Request {
    userId?: string;
    isAdmin?: boolean;
    userData?: any;
  }
}

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.accessToken;
        const jwtSecret = process.env.JWT_SECRET as string;
        if (!jwtSecret) {
            res.status(500).json({ 
                success: false,
                data: {},
                error: "ERROR_AUTH_002",
                message: "Something went wrong"
            });
        }

        const payload = authService.getVerifiedPayload(accessToken, jwtSecret);
        req.userId = payload.id; // Attach the payload to the request object
        req.isAdmin = false; // Attach the isAdmin flag to the request object
        req.userData = payload; // Attach the user data to the request object
        
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