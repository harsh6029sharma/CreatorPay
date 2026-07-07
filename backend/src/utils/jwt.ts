import jwt from 'jsonwebtoken'
import { env } from '../config/env'

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
        env.access_secret,
        {
            expiresIn:env.refresh_expiry
        }
    )

    return token
}