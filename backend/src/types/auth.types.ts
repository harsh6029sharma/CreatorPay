import type { User } from "../../generated/prisma/client"

export interface AuthResponse {
    user:Omit<User, "passwordHash">
    accessToken:string
    refreshToken:string
}