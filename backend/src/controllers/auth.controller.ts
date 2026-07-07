import { createUser } from "../services/auth.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import type { Request,Response } from "express";


export const register = asyncHandler(async(req:Request,res:Response)=>{
    const {email, password, name} = req.body
    const createdUser = await createUser(email,password,name)
    return res.status(201).json(
        new ApiResponse(201,createdUser, "user registered successfully")
    )
})