import jwt from 'jsonwebtoken'
import { env } from '../config/env'

type TokenPayload = {
  userId: string;
};

export const generateAccessToken = (userId:string)=>{

    const token = jwt.sign(
        {
            userId
        },
        env.access_secret,
        {
            expiresIn:env.access_expiry
        }
    )

    return token
}

export const generateRefreshToken = (userId:string)=>{

    const token = jwt.sign(
        {
            userId
        },
        env.refresh_secret,
        {
            expiresIn:env.refresh_expiry
        }
    )

    return token
}


export const verifyAccessToken = (token:string):TokenPayload=>{
    return jwt.verify(token,env.access_secret) as TokenPayload
}

export const verifyRefreshToken = (token:string):TokenPayload=>{
    return jwt.verify(token,env.refresh_secret) as TokenPayload
}