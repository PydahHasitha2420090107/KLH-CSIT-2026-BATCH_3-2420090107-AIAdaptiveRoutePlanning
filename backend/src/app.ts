import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'

export const app = express()

app.use(cors({ origin: env.frontendOrigin, credentials: true }))
app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Backend healthy' })
})

app.use('/api', apiRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ success: false, data: null, message: 'Internal server error' })
})
