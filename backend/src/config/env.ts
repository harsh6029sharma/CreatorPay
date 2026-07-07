import 'dotenv/config'

export const env = {
    salts_rounds: Number(process.env.SALT_ROUNDS)!,
    access_secret: process.env.JWT_ACCESS_SECRET!,
    access_expiry: 15*60*1000, // 15m
    refresh_secret: process.env.JWT_REFRESH_SECRET!,
    refresh_expiry: 7*24*60*60  // 7d
};

if (
    !env.access_secret ||
    !env.access_expiry ||
    !env.refresh_secret ||
    !env.refresh_expiry
) {
    throw new Error("Missing JWT configuration in .env");
}