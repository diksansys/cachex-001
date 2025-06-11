import { Request, Response } from "express"
import ResponseDto from "../common/dtos/response.dto";
import userService from "./user.service";
import z from "zod"
import authService from "../auth/auth.service";

class UserController 
{
    public async handleGetUserDetails (req: Request, res: Response) 
    {
        const response = new ResponseDto(); 
        try {
            if (!req.userId) {
                console.error("User information not found in request");
                throw new Error("User not authenticated");
            }
            const cachedData = await userService.fetchUserDetailsFromCache(req.userId)
            if (cachedData) {
                response.setData({
                    id: cachedData._id,
                    username: cachedData.username,
                    createdAt: cachedData.createdAt,
                    updatedAt: cachedData.updatedAt
                });
            } else {
                console.log("Cache miss for user details. Fetching from database.");
                const userData = await userService.fetchUserDetailsFromDb(req.userId)
                if (userData) {
                    response.setData({
                        id: userData._id,
                        username: userData.username,
                        createdAt: userData.createdAt,
                        updatedAt: userData.updatedAt
                    });
                }
            }

            response.setSuccess(true);
            response.setMessage("User details retrieved successfully");
            response.setStatusCode(200);

        } catch (e: any) {
            console.error(e);
            response.setSuccess(false);
            response.setMessage(e.message);
            response.setStatusCode(e.statusCode ?? 500);
        }

        res.status(response.getStatusCode()).json(response.toJSON());
    }

    public async handleUserAdd (req: Request, res: Response) 
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
            if (userData) { 
                console.error("User already exists with username:", username);
                throw new Error("Duplicate username");
            }

            // Create password
            const passwordHash = await authService.generatePasswordHash(password)

            // Save user
            const savedUser = await userService.getUserRepository().create({
                username: username,
                passwordHash: passwordHash
            });
            if (!savedUser) {
                console.error("Failed to save user:", username);
                throw new Error("Failed to save user");
            }
            console.log("User created successfully:", savedUser.username);

            // Response
            response.setSuccess(true);
            response.setMessage(`User created successfully: ${savedUser.username}`);
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

export default new UserController();