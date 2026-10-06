import { Router } from 'express'
import { aiController } from '../controllers/aiController.js'
import { authController } from '../controllers/authController.js'
import { dashboardController } from '../controllers/dashboardController.js'
import { driverController } from '../controllers/driverController.js'
import { notificationController } from '../controllers/notificationController.js'
import { shipmentController } from '../controllers/shipmentController.js'
import { tripController } from '../controllers/tripController.js'
import { userController } from '../controllers/userController.js'
import { vehicleController } from '../controllers/vehicleController.js'
import { authenticate } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/authorize.js'

export const apiRouter = Router()

apiRouter.post('/auth/register', authController.register)
apiRouter.post('/auth/login', authController.login)
apiRouter.post('/auth/refresh', authController.refresh)
apiRouter.get('/auth/me', authenticate, authController.me)
apiRouter.post('/auth/logout', authenticate, authController.logout)

apiRouter.get('/dashboard/user', authenticate, authorizeRoles('user'), dashboardController.user)
apiRouter.get('/dashboard/driver', authenticate, authorizeRoles('driver'), dashboardController.driver)
apiRouter.get('/dashboard/manager', authenticate, authorizeRoles('manager'), dashboardController.manager)

apiRouter.get('/users', authenticate, authorizeRoles('manager'), userController.list)
apiRouter.get('/users/:id', authenticate, authorizeRoles('manager'), userController.getById)
apiRouter.get('/users/me', authenticate, userController.me)

apiRouter.get('/shipments', authenticate, shipmentController.list)
apiRouter.get('/shipments/my', authenticate, authorizeRoles('user'), shipmentController.my)
apiRouter.get('/shipments/:id', authenticate, shipmentController.getById)
apiRouter.get('/shipments/:id/tracking', authenticate, shipmentController.tracking)
apiRouter.get('/shipments/:id/history', authenticate, shipmentController.history)
apiRouter.post('/shipments', authenticate, authorizeRoles('user'), shipmentController.create)
apiRouter.post('/shipments/:id/assign', authenticate, authorizeRoles('manager'), shipmentController.assignVehicle)
apiRouter.patch('/shipments/:id/status', authenticate, authorizeRoles('manager', 'driver'), shipmentController.updateStatus)
apiRouter.put('/shipments/:id', authenticate, authorizeRoles('manager', 'user'), shipmentController.update)
apiRouter.delete('/shipments/:id', authenticate, authorizeRoles('manager', 'user'), shipmentController.remove)

apiRouter.get('/vehicles', authenticate, authorizeRoles('manager'), vehicleController.list)
apiRouter.get('/vehicles/available', authenticate, authorizeRoles('manager'), vehicleController.available)
apiRouter.get('/vehicles/:id', authenticate, vehicleController.getById)
apiRouter.get('/vehicles/:id/maintenance', authenticate, vehicleController.maintenance)
apiRouter.get('/vehicles/:id/trips', authenticate, vehicleController.trips)
apiRouter.post('/vehicles', authenticate, authorizeRoles('manager'), vehicleController.create)
apiRouter.put('/vehicles/:id', authenticate, authorizeRoles('manager'), vehicleController.update)
apiRouter.patch('/vehicles/:id', authenticate, authorizeRoles('manager'), vehicleController.update)
apiRouter.delete('/vehicles/:id', authenticate, authorizeRoles('manager'), vehicleController.remove)

apiRouter.get('/drivers', authenticate, authorizeRoles('manager'), driverController.list)
apiRouter.get('/drivers/available', authenticate, authorizeRoles('manager'), driverController.available)
apiRouter.get('/drivers/:id', authenticate, driverController.getById)
apiRouter.get('/drivers/:id/shipments', authenticate, driverController.shipments)
apiRouter.get('/drivers/:id/trips', authenticate, driverController.trips)
apiRouter.get('/drivers/:id/vehicle', authenticate, driverController.vehicle)
apiRouter.post('/drivers', authenticate, authorizeRoles('manager'), driverController.create)
apiRouter.put('/drivers/:id', authenticate, authorizeRoles('manager'), driverController.update)
apiRouter.patch('/drivers/:id', authenticate, authorizeRoles('manager'), driverController.update)
apiRouter.delete('/drivers/:id', authenticate, authorizeRoles('manager'), driverController.remove)

apiRouter.get('/trips', authenticate, authorizeRoles('manager', 'driver'), tripController.list)
apiRouter.get('/trips/:id', authenticate, authorizeRoles('manager', 'driver'), tripController.getById)
apiRouter.post('/trips', authenticate, authorizeRoles('manager'), tripController.create)
apiRouter.put('/trips/:id', authenticate, authorizeRoles('manager'), tripController.update)
apiRouter.patch('/trips/:id', authenticate, authorizeRoles('manager'), tripController.update)
apiRouter.patch('/trips/:id/status', authenticate, authorizeRoles('manager'), tripController.updateStatus)
apiRouter.post('/trips/:id/start', authenticate, authorizeRoles('manager', 'driver'), tripController.start)
apiRouter.post('/trips/:id/complete', authenticate, authorizeRoles('manager', 'driver'), tripController.complete)
apiRouter.post('/trips/:id/cancel', authenticate, authorizeRoles('manager', 'driver'), tripController.cancel)

apiRouter.get('/notifications', authenticate, notificationController.list)
apiRouter.patch('/notifications/read-all', authenticate, notificationController.readAll)
apiRouter.patch('/notifications/:id/read', authenticate, notificationController.markRead)

apiRouter.get('/ai/recommendations', authenticate, authorizeRoles('manager'), aiController.recommendations)
apiRouter.post('/ai/maintenance/predict', authenticate, aiController.maintenancePredict)
apiRouter.post('/ai/fuel/predict', authenticate, aiController.fuelPredict)
apiRouter.post('/ai/vehicle/recommend', authenticate, aiController.vehicleRecommend)
apiRouter.post('/ai/travel-time/predict', authenticate, aiController.travelTimePredict)
apiRouter.post('/ai/chat', authenticate, aiController.chat)

apiRouter.get('/analytics/fleet', authenticate, authorizeRoles('manager'), dashboardController.fleetAnalytics)
apiRouter.get('/analytics/shipments', authenticate, authorizeRoles('manager'), dashboardController.shipmentAnalytics)
apiRouter.get('/analytics/fuel', authenticate, authorizeRoles('manager'), dashboardController.fuelAnalytics)
apiRouter.get('/analytics/maintenance', authenticate, authorizeRoles('manager'), dashboardController.maintenanceAnalytics)
apiRouter.get('/analytics/drivers', authenticate, authorizeRoles('manager'), dashboardController.driverAnalytics)

apiRouter.get('/routes/optimize', authenticate, (_req, res) => {
  res.status(405).json({ success: false, data: null, message: 'Use POST /routes/optimize to optimize a route' })
})
apiRouter.post('/routes/optimize', authenticate, aiController.routeOptimize)

apiRouter.get('/maintenance', authenticate, authorizeRoles('manager'), async (_req, res) => {
  const { getDb } = await import('../db/database.js')
  const db = getDb()
  const rows = db.prepare('SELECT * FROM maintenance_records ORDER BY due_date ASC').all() as any[]
  res.json({ success: true, data: rows, message: 'Maintenance records retrieved' })
})
apiRouter.get('/maintenance/upcoming', authenticate, authorizeRoles('manager'), async (_req, res) => {
  const { getDb } = await import('../db/database.js')
  const db = getDb()
  const rows = db.prepare('SELECT * FROM maintenance_records WHERE status != ? ORDER BY due_date ASC').all('Completed') as any[]
  res.json({ success: true, data: rows, message: 'Upcoming maintenance retrieved' })
})
apiRouter.get('/maintenance/alerts', authenticate, authorizeRoles('manager'), async (_req, res) => {
  const { getDb } = await import('../db/database.js')
  const db = getDb()
  const rows = db.prepare('SELECT * FROM maintenance_records WHERE risk_score >= 70 ORDER BY risk_score DESC').all() as any[]
  res.json({ success: true, data: rows, message: 'Maintenance alerts retrieved' })
})

apiRouter.get('/services/health', authenticate, authorizeRoles('manager'), (_req, res) => {
  res.json({ success: true, data: [{ name: 'Fleet API', status: 'ONLINE', description: 'Core fleet system', detail: 'Operational' }], message: 'Service health retrieved' })
})
