import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import { errorMiddleware } from './middlewares/error.middleware'
import authRoutes from './routes/auth.route'
import brandDealRoutes from './routes/brandDeal.route'
import { ApiError } from './utils/ApiError'

const app = express()

app.use(cors({
    origin:process.env.FRONTEND_URL || "http://localhost:6002",
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/deals", brandDealRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"))
})

app.use(errorMiddleware)
export default app