import { prisma } from "../lib/prisma"
import bcrypt from 'bcrypt'
import { ApiError } from "../utils/ApiError"
import { generateRefreshToken, generateAccessToken } from "../utils/jwt.utils"
import { env } from "../config/env"
import type { AuthResponse } from "../types/auth.types"


export const createUser = async (email: string, password: string, name: string):Promise<AuthResponse> => {
    const existing = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (existing) {
        throw new ApiError(409, "user already exist with this email")
    }

    const salt_rounds = env.salts_rounds || 10
    const hashedPassword = await bcrypt.hash(password, salt_rounds)

    const user = await prisma.user.create({
        data: {
            email: email,
            passwordHash: hashedPassword,
            name: name
        }
    })

    const refreshToken = generateRefreshToken(user.id)
    const accessToken = generateAccessToken(user.id)

    const expiresAt = new Date(Date.now()+env.refresh_expiry)

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            token: refreshToken,
            expiresAt
        }
    })
    
    return {
        user,
        accessToken,
        refreshToken
    }
}

export const loginUser = async (email:string, password:string):Promise<AuthResponse>=>{

    const user = await prisma.user.findUnique({
        where:{
            email:email
        }
    })

    if(!user){
        throw new ApiError(401, "invalid email or password")
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if(!isPasswordValid){
        throw new ApiError(401, "invalid password or has expired")
    }
    
    const refreshToken = generateRefreshToken(user.id)
    const accessToken = generateAccessToken(user.id)

    const expiresAt = new Date(env.refresh_expiry)

    await prisma.refreshToken.create({
        data:{
            userId: user.id,
            token:refreshToken,
            expiresAt
        }
    })

    return {
        user,
        accessToken,
        refreshToken
    }
}
