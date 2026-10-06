import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../src/app.js'
import { dijkstra } from '../src/utils/dijkstra.js'

describe('SmartFleet backend', () => {
  it('registers a user and returns a JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test-user@example.com',
        password: 'StrongPass123',
        role: 'user',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBeTruthy()
  })

  it('protects user shipment access from another account', async () => {
    const userA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User A',
        email: 'user-a@example.com',
        password: 'StrongPass123',
        role: 'user',
      })

    const userB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User B',
        email: 'user-b@example.com',
        password: 'StrongPass123',
        role: 'user',
      })

    const shipmentRes = await request(app)
      .post('/api/shipments')
      .set('Authorization', `Bearer ${userA.body.data.token}`)
      .send({
        origin: 'Colombo',
        destination: 'Kandy',
        type: 'HOUSE_SHIFTING',
        weight: 500,
        quantity: 3,
        priority: 'HIGH',
        status: 'Delivered',
        vehicle: 'V-104',
        driver: 'D-2001',
        preferredDate: '2026-10-20',
        preferredTime: '09:00',
      })

    expect(shipmentRes.status).toBe(201)
    expect(shipmentRes.body.data.status).toBe('Pending')
    expect(shipmentRes.body.data.vehicle).toBe('Unassigned')
    expect(shipmentRes.body.data.driver).toBe('Unassigned')

    const selfAssignmentAttempt = await request(app)
      .put(`/api/shipments/${shipmentRes.body.data.id}`)
      .set('Authorization', `Bearer ${userA.body.data.token}`)
      .send({ status: 'Delivered', vehicle: 'V-104', driver: 'D-2001' })
    const ownShipmentAfterAttempt = await request(app)
      .get(`/api/shipments/${shipmentRes.body.data.id}`)
      .set('Authorization', `Bearer ${userA.body.data.token}`)

    expect(selfAssignmentAttempt.status).toBe(200)
    expect(ownShipmentAfterAttempt.body.data.status).toBe('Pending')
    expect(ownShipmentAfterAttempt.body.data.vehicle).toBe('Unassigned')

    const accessRes = await request(app)
      .get(`/api/shipments/${shipmentRes.body.data.id}`)
      .set('Authorization', `Bearer ${userB.body.data.token}`)
    const trackingRes = await request(app)
      .get(`/api/shipments/${shipmentRes.body.data.id}/tracking`)
      .set('Authorization', `Bearer ${userB.body.data.token}`)
    const updateRes = await request(app)
      .put(`/api/shipments/${shipmentRes.body.data.id}`)
      .set('Authorization', `Bearer ${userB.body.data.token}`)
      .send({ destination: 'Unauthorized destination' })
    const deleteRes = await request(app)
      .delete(`/api/shipments/${shipmentRes.body.data.id}`)
      .set('Authorization', `Bearer ${userB.body.data.token}`)
    const updateStatusRes = await request(app)
      .patch(`/api/shipments/${shipmentRes.body.data.id}/status`)
      .set('Authorization', `Bearer ${userB.body.data.token}`)
      .send({ status: 'Delivered' })

    expect(accessRes.status).toBe(403)
    expect(trackingRes.status).toBe(403)
    expect(updateRes.status).toBe(403)
    expect(deleteRes.status).toBe(403)
    expect(updateStatusRes.status).toBe(403)

    const chatRes = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${userB.body.data.token}`)
      .send({ message: `What is the status of ${shipmentRes.body.data.id}?` })

    expect(chatRes.status).toBe(200)
    expect(chatRes.body.data.message).toContain('cannot access')
    expect(chatRes.body.data.message).not.toContain(shipmentRes.body.data.origin)
  })

  it('uses the authenticated role for chat context and restricts manager analytics', async () => {
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@smartfleet.io', password: 'password123' })
    const driverLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'driver@smartfleet.io', password: 'password123' })
    const otherDriverLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'lahiru@smartfleet.io', password: 'password123' })
    const managerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@smartfleet.io', password: 'password123' })

    const userChat = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${userLogin.body.data.token}`)
      .send({ message: 'What is my shipment status?' })
    const driverChat = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${driverLogin.body.data.token}`)
      .send({ message: 'What is my next transport assignment?' })
    const managerChat = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${managerLogin.body.data.token}`)
      .send({ message: 'How many vehicles are available?' })
    const optimizedRoute = await request(app)
      .post('/api/routes/optimize')
      .set('Authorization', `Bearer ${managerLogin.body.data.token}`)
      .send({ origin: 'Colombo 07 Residence', destination: 'Kandy Residence' })
    const assignment = await request(app)
      .post('/api/shipments/SHP-1044/assign')
      .set('Authorization', `Bearer ${managerLogin.body.data.token}`)
      .send({ vehicleId: 'V-111', driverId: 'D-2003' })
    const userAnalytics = await request(app)
      .get('/api/analytics/fleet')
      .set('Authorization', `Bearer ${userLogin.body.data.token}`)
    const userVehicles = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userLogin.body.data.token}`)
    const userDrivers = await request(app)
      .get('/api/drivers')
      .set('Authorization', `Bearer ${userLogin.body.data.token}`)
    const userMaintenance = await request(app)
      .get('/api/maintenance')
      .set('Authorization', `Bearer ${userLogin.body.data.token}`)
    const driverAnalytics = await request(app)
      .get('/api/analytics/fleet')
      .set('Authorization', `Bearer ${driverLogin.body.data.token}`)
    const ownVehicle = await request(app)
      .get('/api/vehicles/V-104')
      .set('Authorization', `Bearer ${driverLogin.body.data.token}`)
    const unrelatedVehicle = await request(app)
      .get('/api/vehicles/V-101')
      .set('Authorization', `Bearer ${driverLogin.body.data.token}`)
    const ownDriver = await request(app)
      .get('/api/drivers/D-2001')
      .set('Authorization', `Bearer ${driverLogin.body.data.token}`)
    const unrelatedDriver = await request(app)
      .get('/api/drivers/D-2003')
      .set('Authorization', `Bearer ${driverLogin.body.data.token}`)
    const unauthenticatedChat = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'What is my shipment status?' })
    const publicManagerRegistration = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Untrusted Manager', email: 'untrusted-manager@example.com', password: 'StrongPass123', role: 'manager' })
    const forgedPayload = Buffer.from(JSON.stringify({ id: 'M-3001', role: 'manager', email: 'manager@smartfleet.io' })).toString('base64url')
    const forgedRefresh = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: `eyJhbGciOiJub25lIn0.${forgedPayload}.forged` })
    const validRefresh = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: userLogin.body.data.token })
    const refreshedUserAnalytics = await request(app)
      .get('/api/analytics/fleet')
      .set('Authorization', `Bearer ${validRefresh.body.data.token}`)
    const unrelatedTrip = await request(app)
      .get('/api/trips/TRIP-203')
      .set('Authorization', `Bearer ${otherDriverLogin.body.data.token}`)
    const unrelatedTripStart = await request(app)
      .post('/api/trips/TRIP-203/start')
      .set('Authorization', `Bearer ${otherDriverLogin.body.data.token}`)
    const anotherCustomer = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Notification Test Customer', email: 'notification-test@example.com', password: 'StrongPass123' })
    const markSharedRead = await request(app)
      .patch('/api/notifications/N-1/read')
      .set('Authorization', `Bearer ${userLogin.body.data.token}`)
    const userNotifications = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userLogin.body.data.token}`)
    const otherUserNotifications = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${anotherCustomer.body.data.token}`)
    const otherUserPrivateNotification = await request(app)
      .patch('/api/notifications/N-5/read')
      .set('Authorization', `Bearer ${anotherCustomer.body.data.token}`)

    expect(userChat.status).toBe(200)
    expect(userChat.body.data.message).toContain('transport request')
    expect(driverChat.status).toBe(200)
    expect(driverChat.body.data.message).toContain('assignment')
    expect(managerChat.status).toBe(200)
    expect(managerChat.body.data.message).toMatch(/available vehicles/i)
    expect(optimizedRoute.status).toBe(200)
    expect(optimizedRoute.body.data.algorithmUsed).toBe('Dijkstra')
    expect(optimizedRoute.body.data.recommendedRoute).toEqual(['Colombo', 'Kandy'])
    expect(assignment.status).toBe(200)
    const trip = (await request(app)
      .get(`/api/trips/${assignment.body.data.tripId}`)
      .set('Authorization', `Bearer ${managerLogin.body.data.token}`))
    expect(trip.status).toBe(200)
    expect(trip.body.data.shipmentId).toBe('SHP-1044')
    expect(trip.body.data.driverId).toBe('D-2003')
    expect(trip.body.data.vehicleId).toBe('V-111')
    const driverStartsTrip = await request(app)
      .post(`/api/trips/${assignment.body.data.tripId}/start`)
      .set('Authorization', `Bearer ${otherDriverLogin.body.data.token}`)
    const managerSeesTransit = await request(app)
      .get('/api/shipments/SHP-1044')
      .set('Authorization', `Bearer ${managerLogin.body.data.token}`)
    const driverCompletesTrip = await request(app)
      .post(`/api/trips/${assignment.body.data.tripId}/complete`)
      .set('Authorization', `Bearer ${otherDriverLogin.body.data.token}`)
    const managerSeesDelivered = await request(app)
      .get('/api/shipments/SHP-1044')
      .set('Authorization', `Bearer ${managerLogin.body.data.token}`)

    expect(driverStartsTrip.status).toBe(200)
    expect(managerSeesTransit.body.data.status).toBe('In Transit')
    expect(driverCompletesTrip.status).toBe(200)
    expect(managerSeesDelivered.body.data.status).toBe('Delivered')
    expect(userAnalytics.status).toBe(403)
    expect(userVehicles.status).toBe(403)
    expect(userDrivers.status).toBe(403)
    expect(userMaintenance.status).toBe(403)
    expect(driverAnalytics.status).toBe(403)
    expect(ownVehicle.status).toBe(200)
    expect(unrelatedVehicle.status).toBe(403)
    expect(ownDriver.status).toBe(200)
    expect(unrelatedDriver.status).toBe(403)
    expect(unauthenticatedChat.status).toBe(401)
    expect(publicManagerRegistration.status).toBe(400)
    expect(forgedRefresh.status).toBe(401)
    expect(validRefresh.status).toBe(200)
    expect(refreshedUserAnalytics.status).toBe(403)
    expect(unrelatedTrip.status).toBe(403)
    expect(unrelatedTripStart.status).toBe(403)
    expect(markSharedRead.status).toBe(200)
    expect(userNotifications.body.data.find((item: any) => item.id === 'N-1').read).toBe(true)
    expect(otherUserNotifications.body.data.find((item: any) => item.id === 'N-1').read).toBe(false)
    expect(otherUserPrivateNotification.status).toBe(404)
  }, 20000)

  it('predicts maintenance risk with a stable fallback model', async () => {
    const token = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@smartfleet.io', password: 'password123' })

    const res = await request(app)
      .post('/api/ai/maintenance/predict')
      .set('Authorization', `Bearer ${token.body.data.token}`)
      .send({ vehicleId: 'V-101', mileage: 25000, vehicleAge: 4, condition: 'Good', usage: 'normal' })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('riskLevel')
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(res.body.data.riskLevel)
  })

  it('finds the shortest path using Dijkstra', () => {
    const graph = {
      A: { B: 5, C: 2 },
      B: { D: 3 },
      C: { B: 1, D: 6 },
      D: {},
    }

    const result = dijkstra(graph, 'A', 'D')
    expect(result.path).toEqual(['A', 'C', 'B', 'D'])
    expect(result.distance).toBe(6)
  })
})
