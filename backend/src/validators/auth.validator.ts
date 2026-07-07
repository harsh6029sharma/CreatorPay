import * as z from 'zod'

export const RegisterUserSchema = z.object({
    email:z.email("enter your email"),
    password:z.string().min(8, "Password must be at least 8 characters"),
    name:z.string().trim().min(2,"Name is required")
})

export const LoginUserSchema = z.object({
    email:z.email("enter your email"),
    password:z.string().min(8, "Password must be at least 8 characters")
})