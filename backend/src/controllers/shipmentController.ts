import type { Request, Response } from 'express'
import { z } from 'zod'
import { getDb } from '../db/database.js'
import { buildError, buildSuccess } from '../utils/response.js'

const shipmentStatusSchema = z.object({ status: z.enum(['Pending', 'Assigned', 'In Transit', 'Delayed', 'Delivered']) })

export const shipmentController = {
  list: (req: Request, res: Response) => {
    const db = getDb()
    const user = (req as any).user
    const rows = db.prepare('SELECT * FROM shipments ORDER BY id DESC').all() as any[]

    if (user.role === 'user') {
      const filtered = rows.filter((shipment) => shipment.customer_id === user.id)
      return res.json(buildSuccess(filtered.map((row) => formatShipment(row)), 'Shipments retrieved'))
    }

    if (user.role === 'driver') {
      const filtered = rows.filter((shipment) => shipment.driver === user.id)
      return res.json(buildSuccess(filtered.map((row) => formatShipment(row)), 'Assigned shipments retrieved'))
    }

    return res.json(buildSuccess(rows.map((row) => formatShipment(row)), 'Shipments retrieved'))
  },

  getById: (req: Request, res: Response) => {
    const db = getDb()
    const row = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id) as any
    if (!row) return res.status(404).json(buildError('Shipment not found'))
    return res.json(buildSuccess(formatShipment(row), 'Shipment retrieved'))
  },

  create: (req: Request, res: Response) => {
    const user = (req as any).user
    const shipment = {
      ...req.body,
      customer: req.body.customer || user.name,
      customerId: user.id,
      status: req.body.status || 'Pending',
    }

    if (!shipment.origin || !shipment.destination || !shipment.type || !shipment.weight) {
      return res.status(400).json(buildError('Missing required shipment fields'))
    }

    const id = `SHP-${Date.now()}`
    const db = getDb()
    db.prepare(`INSERT INTO shipments (id, customer_id, customer, origin, destination, status, vehicle, driver, priority, estimated_delivery, current_location, progress, type, weight, quantity, special_handling, sender_name, sender_contact, receiver_name, receiver_contact, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        id,
        user.id,
        shipment.customer,
        shipment.origin,
        shipment.destination,
        shipment.status,
        shipment.vehicle || 'Unassigned',
        shipment.driver || 'Unassigned',
        shipment.priority || 'Medium',
        shipment.estimatedDelivery || new Date(Date.now() + 86400000).toISOString(),
        shipment.currentLocation || shipment.origin,
        shipment.progress || 0,
        shipment.type,
        shipment.weight,
        shipment.quantity || 1,
        shipment.specialHandling || '',
        shipment.senderName || user.name,
        shipment.senderContact || user.email,
        shipment.receiverName || shipment.destination,
        shipment.receiverContact || '',
        shipment.route || 'A1 Main Road',
      )

    return res.status(201).json(buildSuccess({ id, ...shipment }, 'Shipment created'))
  },

  updateStatus: (req: Request, res: Response) => {
    const parsed = shipmentStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json(buildError('Invalid status payload'))
    }

    const db = getDb()
    const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(req.params.id) as any
    if (!shipment) return res.status(404).json(buildError('Shipment not found'))

    db.prepare('UPDATE shipments SET status = ?, progress = ?, current_location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      parsed.data.status,
      statusToProgress(parsed.data.status),
      maybeCurrentLocation(parsed.data.status, shipment.current_location),
      req.params.id,
    )

    return res.json(buildSuccess({
      id: shipment.id,
      status: parsed.data.status,
      progress: statusToProgress(parsed.data.status),
    }, 'Shipment status updated'))
  },
}

function formatShipment(row: any) {
  return {
    id: row.id,
    customer: row.customer,
    origin: row.origin,
    destination: row.destination,
    status: row.status,
    vehicle: row.vehicle,
    driver: row.driver,
    priority: row.priority,
    estimatedDelivery: row.estimated_delivery,
    currentLocation: row.current_location,
    progress: row.progress,
    type: row.type,
    weight: row.weight,
    quantity: row.quantity,
    specialHandling: row.special_handling,
    senderName: row.sender_name,
    senderContact: row.sender_contact,
    receiverName: row.receiver_name,
    receiverContact: row.receiver_contact,
    route: row.route,
  }
}

function statusToProgress(status: string) {
  switch (status) {
    case 'Pending': return 0
    case 'Assigned': return 20
    case 'In Transit': return 72
    case 'Delayed': return 55
    case 'Delivered': return 100
    default: return 0
  }
}

function maybeCurrentLocation(status: string, current: string) {
  if (status === 'Delivered') return 'Destination reached'
  if (status === 'Delayed') return 'Delayed due to weather risk'
  return current
}
