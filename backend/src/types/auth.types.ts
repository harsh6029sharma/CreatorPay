import type { User } from "../../generated/prisma/client"

export type SafeUser = Omit<User, 'passwordHash'>

export interface AuthResponse {
    user: SafeUser
    accessToken:string
    refreshToken:string
}