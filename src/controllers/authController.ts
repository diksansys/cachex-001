import { NextFunction, Request, Response } from "express"
import User from "../models/users"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import ms from "ms"
import z from "zod"
import authHelper from "../helpers/authHelper"

dotenv.config()

const handleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Retrive request information
        const {username, password} = req.body
        
        // Validate login data using login W
        const loginSchema = z.object({
            username: z.string().min(3).max(30).trim(),
            password: z.string().min(6).max(100)
        })

        const parsed = loginSchema.safeParse(req.body)
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors })
        }

        // Verify username 
        const userData = await User.findOne({username: username}).exec()
        if (!userData || !userData?.passwordHash) { 
            return res.status(401).json({ error: "Invalid username or password" })
        }

        // Verify password
        const isSamePassword = await bcrypt.compare(password, userData.passwordHash)
        if (!isSamePassword) {
            return res.status(401).json({ error: "Invalid username or password" })
        }

        // Generate JWT token
        const payload = {
            id: userData._id,
            username: userData.username
        }
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(500).json({ error: "JWT secret is not defined in environment variables" });
        }
        
        // Set access token
        const accessTokenExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h'
        const accessToken = authHelper.getJwtToken(payload, jwtSecret, accessTokenExpiresIn)
        res.cookie('accessToken', accessToken, {
            maxAge: ms(accessTokenExpiresIn as ms.StringValue),
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === 'production',
        })

        // Set refresh token
        const refreshTokenExpiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d'
        const refreshToken = authHelper.getJwtToken(payload, jwtSecret, refreshTokenExpiresIn)
        res.cookie('refreshToken', refreshToken, {
            maxAge: ms(refreshTokenExpiresIn as ms.StringValue),
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === 'production',
        })

        // Response
        return res.status(200).json({
            "success": true,
            "data": {},
            "message": "Authentication successful"
        })

    } catch (error) {
        next(error)
    }
}

const handleLogout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        // Response
        return res.status(200).json({
            "success": true,
            "data": {},
            "message": "Logout successful"
        })
    } catch (error) {
        next(error)
    }
}

/**
 * 
 * ERROR001: Refresh token is not found
 * ERROR002: JWT secret is not provided in environment variables
 * ERROR003: Something went wrong in the complete flow
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
const handleRefreshTokenRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.cookies

        if (!refreshToken) {
            return res.status(401).json({ 
                success: false,
                data: {},
                error: "ERROR_AUTH_001",
                message: "Invalid refresh token provided"
             })
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ 
                success: false,
                data: {},
                error: "ERROR_AUTH_002",
                message: "Invalid refresh token provided"
             });
        }

        const payload = authHelper.getVerifiedPayload(refreshToken, jwtSecret)
        const accessTokenExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h'
        const newAccessToken = authHelper.getJwtToken(
            {id: payload.id, username: payload.username}, 
            jwtSecret,
            accessTokenExpiresIn
        )

        res.cookie('accessToken', newAccessToken, {
            maxAge: ms(accessTokenExpiresIn as ms.StringValue),
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV === 'production',
        })

        return res.status(200).json({
            "success": true,
            "data": {},
            "message": ""
        })

    } catch (error) {
        console.log(error)
        return res.status(403).json({
            success: false,
            data: {},
            message: "ERROR003: Invalid refresh token provided"
        })
    }
}

export default {
    handleLogin,
    handleLogout,
    handleRefreshTokenRequest
}