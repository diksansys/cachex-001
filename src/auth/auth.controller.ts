import { Request, Response } from "express"
import ms from "ms"
import z from "zod"
import authService from "./auth.service"
import ResponseDto from "../common/dtos/response.dto"
import userService from "../user/user.service"
import env from "../common/registry/environment.registry"

class AuthController 
{
    public async handleLogin (req: Request, res: Response) 
    {
        const response = new ResponseDto();
        
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
                console.error("Login validation error:", parsed.error.errors);
                throw new Error("Invalid login data provided"); 
            }

            // Verify username 
            const userData = await userService.getUserRepository().findOne({username: username})
            if (!userData || !userData?.passwordHash) { 
                console.error("User not found or password hash is missing");
                throw new Error("Invalid username or password");
            }

            // Verify password
            if (!await authService.checkPassword(password, userData.passwordHash)) {
                console.error("Password does not match for user:", username);
                throw new Error("Invalid username or password");
            }

            // Generate JWT token
            const payload = {
                id: userData._id,
                username: userData.username
            }
            const jwtSecret = env.get('jwt.secret')
            const nodeEnv = env.get('app.env')

            // Set access token
            const accessTokenExpiresIn = env.get('jwt.access_token.expires_in') || '1h'
            const accessToken = authService.getJwtToken(payload, jwtSecret, accessTokenExpiresIn)
            res.cookie('accessToken', accessToken, {
                maxAge: ms(accessTokenExpiresIn as ms.StringValue),
                httpOnly: true,
                sameSite: nodeEnv === 'production' ? 'none' : 'lax',
                secure: nodeEnv === 'production'
            });

            // Set refresh token
            const refreshTokenExpiresIn = env.get('jwt.refresh_token_expires_in') || '7d'
            const refreshToken = authService.getJwtToken(payload, jwtSecret, refreshTokenExpiresIn)
            res.cookie('refreshToken', refreshToken, {
                maxAge: ms(refreshTokenExpiresIn as ms.StringValue),
                httpOnly: true,
                sameSite: nodeEnv === 'production' ? 'none' : 'lax',
                secure: nodeEnv === 'production'
            });

            // Response
            response.setSuccess(true);
            response.setMessage(`Authentication successful for user: ${username}`);
            response.setStatusCode(200);

        } catch (e: any) {
            console.error(e);
            response.setSuccess(false);
            response.setMessage(e.message);
            response.setStatusCode(e.statusCode ?? 500);
        }

        res.status(response.getStatusCode()).json(response.toJSON())
    }

    public async handleLogout (req: Request, res: Response) {
        
        const response = new ResponseDto();

        try {
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");

            // Response
            response.setSuccess(true);
            response.setMessage("Logout successful");
            response.setStatusCode(200);
        } catch (error) {
            console.error("Logout error:", error);
            response.setSuccess(false);
            response.setMessage("Logout failed");
            response.setStatusCode(500);
        }

        res.status(response.getStatusCode()).json(response.toJSON())
    }

    /**
     * 
     * ERROR001: Refresh token is not found
     * ERROR002: JWT secret is not provided in environment variables
     * ERROR003: Something went wrong in the complete flow
     * 
     * @param req 
     * @param res 
     * @returns 
     */ 
    public async handleRefreshTokenRequest (req: Request, res: Response) {

        const response = new ResponseDto();

        try {
            const { refreshToken } = req.cookies

            if (!refreshToken) {
                console.error("ERROR_AUTH_001 : Invalid refresh token provided");
                throw new Error("Invalid refresh token provided");
            }

            const jwtSecret = env.get('jwt.secret')
            const payload = authService.getVerifiedPayload(refreshToken, jwtSecret)
            const accessTokenExpiresIn = env.get('jwt.access_token.expires_in') || '1h'
            const newAccessToken = authService.getJwtToken(
                {id: payload.id, username: payload.username}, 
                jwtSecret,
                accessTokenExpiresIn
            )

            const nodeEnv = env.get('app.env')
            res.cookie('accessToken', newAccessToken, {
                maxAge: ms(accessTokenExpiresIn as ms.StringValue),
                httpOnly: true,
                sameSite: nodeEnv === 'production' ? 'none' : 'lax',
                secure: nodeEnv === 'production'
            });

            response.setSuccess(true);
            response.setMessage("Access token refreshed successfully");
            response.setStatusCode(200);

        } catch (e: any) {
            console.error(e);
            response.setSuccess(false);
            response.setMessage(e.message);
            response.setStatusCode(e.statusCode ?? 500);
        }

        res.status(response.getStatusCode()).json(response.toJSON())
    }
}

export default new AuthController()