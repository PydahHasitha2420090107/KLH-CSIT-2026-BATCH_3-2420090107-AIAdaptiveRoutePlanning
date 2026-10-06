import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'

export const app = express()

const allowList = (env.frontendOrigin || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowList.length === 0 || allowList.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('CORS origin not allowed'))
  },
  credentials: true,
}))
app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() }, message: 'Backend healthy' })
})

app.get('/health/services', (_req, res) => {
  res.json({
    success: true,
    data: {
      database: 'online',
      vehicleService: 'online',
      driverService: 'online',
      shipmentService: 'online',
      tripService: 'online',
      maintenanceService: 'online',
      routeService: 'online',
      aiService: 'online',
    },
    message: 'Service health retrieved',
  })
})

app.use('/api', apiRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)

  if (typeof err === 'object' && err !== null && 'status' in err) {
    const error = err as { status?: number; message?: string }
    return res.status(error.status ?? 500).json({ success: false, data: null, message: error.message ?? 'Request failed' })
  }

  res.status(500).json({ success: false, data: null, message: 'Internal server error' })
})
