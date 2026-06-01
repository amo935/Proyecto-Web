import express from 'express'
import cookieParser from 'cookie-parser'
import { corsConfig } from './config/cors.js'
import { errorHandler } from './middleware/errorHandler.middleware.js'
import authRoutes from './routes/auth.routes.js'
import gamesRoutes from './routes/games.routes.js'
import myGamesRoutes from './routes/myGames.routes.js'
import reviewsRoutes from './routes/reviews.routes.js'

const app = express()

app.use(corsConfig)
app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoutes)
app.use('/games', gamesRoutes)
app.use('/my-games', myGamesRoutes)
app.use('/reviews', reviewsRoutes)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(errorHandler)

export default app
