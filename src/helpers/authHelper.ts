import jwt, { SignOptions } from "jsonwebtoken";

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

export default {
    getJwtToken,
    getVerifiedPayload
}