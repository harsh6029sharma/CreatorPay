import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import { errorMiddleware } from './middlewares/error.middleware'
import authRoutes from './routes/auth.route'

const app = express()

app.use(cors({
    origin:process.env.FRONTEND_URL || "http://localhost:6002",
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use("/api/v1/users",authRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use(errorMiddleware)

export default app