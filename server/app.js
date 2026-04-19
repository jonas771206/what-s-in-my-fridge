import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { clerkMiddleware } from './middleware/auth.js'
import recipeRoutes from './routes/recipes.js'
import authRoutes from './routes/auth.js'

const app = express()

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use(clerkMiddleware())

app.use('/api/recipes', recipeRoutes)
app.use('/api/auth', authRoutes)

export default app
