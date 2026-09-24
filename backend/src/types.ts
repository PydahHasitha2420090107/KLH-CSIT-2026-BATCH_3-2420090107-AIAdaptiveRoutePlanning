export type UserRole = 'user' | 'driver' | 'manager'

export type ShipmentStatus = 'Pending' | 'Assigned' | 'In Transit' | 'Delayed' | 'Delivered'
export type TripStatus = 'Planned' | 'In Progress' | 'Completed'
export type VehicleStatus = 'Available' | 'In Use' | 'Maintenance'
export type DriverAvailability = 'Available' | 'On Trip' | 'Off Duty'
export type DriverStatus = 'Active' | 'Inactive'
export type NotificationType = 'info' | 'warning' | 'success' | 'critical'
export type Severity = 'Low' | 'Medium' | 'High'

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  password: string
  role: UserRole
}

export interface Shipment {
  id: string
  customer: string
  origin: string
  destination: string
  status: ShipmentStatus
  vehicle: string
  driver: string
  priority: 'Low' | 'Medium' | 'High'
  estimatedDelivery: string
  currentLocation: string
  progress: number
  type: string
  weight: string
  quantity: number
  specialHandling: string
  senderName: string
  senderContact: string
  receiverName: string
  receiverContact: string
  route: string
}

export interface Vehicle {
  id: string
  registrationNumber: string
  type: string
  status: VehicleStatus
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  mileage: number
  fuelEfficiency: number
  maintenanceRisk: number
  assignedDriver: string
  fuelLevel: number
  maintenanceDue: string
}

export interface Driver {
  id: string
  name: string
  license: string
  availability: DriverAvailability
  assignedVehicle: string
  currentTrip: string
  status: DriverStatus
}

export interface Trip {
  id: string
  source: string
  destination: string
  distance: string
  estimatedTime: string
  status: TripStatus
  shipmentId: string
  route: string
}

export interface AIPrediction {
  id: string
  title: string
  description: string
  score: number
  severity: Severity
  recommendation: string
  category: 'maintenance' | 'fuel' | 'route' | 'allocation'
}

export interface NotificationItem {
  id: string
  message: string
  type: NotificationType
  role: UserRole | 'all'
}

export interface ServiceHealth {
  name: string
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  description: string
  detail: string
}
