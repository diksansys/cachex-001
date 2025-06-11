import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt"

interface JwtPayload {
    [key: string]: any;
}

const getJwtToken = (
    payload: JwtPayload,
    jwtSecret: string,
    tokenExpiresIn: string
): string => {
    const signOptions: SignOptions = {
        expiresIn: tokenExpiresIn as SignOptions['expiresIn']
    }
    return jwt.sign(payload, jwtSecret as string, signOptions);
}

const getVerifiedPayload = (refreshToken: string, jwtSecret: string) => {
    return jwt.verify(refreshToken, jwtSecret) as JwtPayload
}

const checkPassword = async (password: string, passwordHash: string) =>
{
    return await bcrypt.compare(password, passwordHash)
}

const generatePasswordHash = async (password: string) =>
{
    return await bcrypt.hash(password, 10)
}

export default {
    getJwtToken,
    getVerifiedPayload,
    checkPassword,
    generatePasswordHash
}