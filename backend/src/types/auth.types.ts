import type { User } from "../../generated/prisma/client"

export interface AuthResponse {
    user:User
    accessToken:string
    refreshToken:string
}