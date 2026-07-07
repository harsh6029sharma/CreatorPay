import asyncHandler from "../utils/asyncHandler";
import type { Request,Response } from "express";


const register = asyncHandler(async(req:Request,res:Response)=>{

    const {email, name} = req.body

    
})