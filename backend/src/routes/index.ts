import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { aiController } from '../controllers/aiController.js'
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
apiRouter.get('/auth/me', authenticate, authController.me)
apiRouter.post('/auth/logout', authenticate, authController.logout)

apiRouter.get('/dashboard/user', authenticate, authorizeRoles('user'), dashboardController.user)
apiRouter.get('/dashboard/driver', authenticate, authorizeRoles('driver'), dashboardController.driver)
apiRouter.get('/dashboard/manager', authenticate, authorizeRoles('manager'), dashboardController.manager)

apiRouter.get('/users', authenticate, authorizeRoles('manager'), userController.list)
apiRouter.get('/users/:id', authenticate, authorizeRoles('manager'), userController.getById)

apiRouter.get('/shipments', authenticate, shipmentController.list)
apiRouter.get('/shipments/:id', authenticate, shipmentController.getById)
apiRouter.post('/shipments', authenticate, shipmentController.create)
apiRouter.patch('/shipments/:id/status', authenticate, shipmentController.updateStatus)

apiRouter.get('/vehicles', authenticate, vehicleController.list)
apiRouter.get('/vehicles/:id', authenticate, vehicleController.getById)
apiRouter.post('/vehicles', authenticate, authorizeRoles('manager'), vehicleController.create)
apiRouter.put('/vehicles/:id', authenticate, authorizeRoles('manager'), vehicleController.update)
apiRouter.delete('/vehicles/:id', authenticate, authorizeRoles('manager'), vehicleController.remove)

apiRouter.get('/drivers', authenticate, driverController.list)
apiRouter.get('/drivers/:id', authenticate, driverController.getById)

apiRouter.get('/trips', authenticate, tripController.list)
apiRouter.get('/trips/:id', authenticate, tripController.getById)
apiRouter.patch('/trips/:id/status', authenticate, tripController.updateStatus)

apiRouter.get('/notifications', authenticate, notificationController.list)
apiRouter.patch('/notifications/:id/read', authenticate, notificationController.markRead)

apiRouter.get('/ai/recommendations', authenticate, aiController.recommendations)

apiRouter.get('/services/health', authenticate, (_req, res) => {
  res.json({ success: true, data: [{ name: 'Fleet API', status: 'ONLINE', description: 'Core fleet system', detail: 'Operational' }], message: 'Service health retrieved' })
})
