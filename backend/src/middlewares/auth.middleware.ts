import type { Request,Response,NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt.utils";
import { prisma } from "../lib/prisma";

declare global {
    namespace Express {
        interface Request{
            user?:{
                id:string
            }
        }
    }
}

export const verifyJwt = asyncHandler(async(req:Request, res:Response, next:NextFunction)=>{
    const authHeader = req.headers.authorization

    if(!authHeader?.startsWith("Bearer ")){
        throw new ApiError(401, "no token found")
    }

    const token = authHeader.split(" ")[1]

    if(!token){
        throw new ApiError(401, "No accessToken found")
    }

    const payload = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
        where:{id:payload.userId},
        select:{
            id:true,
            email:true,
            name:true
        }
    })

    if(!user){
        throw new ApiError(401, "User not found")
    }

    req.user = user

    next()

})