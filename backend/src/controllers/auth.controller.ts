import { createUser, loginUser } from "../services/auth.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import type { Request, Response } from "express";
import { LoginUserSchema, RegisterUserSchema } from "../validators/auth.validator";
import { env } from "../config/env";
import { generateAccessToken, verifyRefreshToken } from "../utils/jwt.utils";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const userDetails = RegisterUserSchema.parse(req.body)
    const createdUser = await createUser(userDetails.email, userDetails.password, userDetails.name)
    const { refreshToken } = createdUser


    const cookieOptions = {
        expires: new Date(env.refresh_expiry),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const
    }
    // set cookies
    return res.status(201).cookie('refreshToken', refreshToken, cookieOptions).json(
        new ApiResponse(201, "user registered successfully")
    )
})

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = LoginUserSchema.parse(req.body)

    const loggedUser = await loginUser(email, password)

    return res.status(200).json(
        new ApiResponse(200, loggedUser, "user logged in successfully")
    )
})

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
    const payload = verifyRefreshToken(refreshToken)

    const storedToken = await prisma.refreshToken.findUnique({
        where: {
            token: refreshToken
        }
    })

    if (!storedToken) {
        throw new ApiError(401, "Invalid refresh token")
    }

    if (storedToken.expiresAt < new Date()) {
        throw new ApiError(401, "Refresh token expired")
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId }
    })

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    const accessToken = generateAccessToken(user.id);

    return {
        accessToken,
    }
}