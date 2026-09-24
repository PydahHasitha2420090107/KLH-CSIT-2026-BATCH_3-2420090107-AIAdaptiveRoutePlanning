export type UserRole = 'user' | 'driver' | 'manager'

export type ShipmentStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Transit'
  | 'Delayed'
  | 'Delivered'

export type TripStatus = 'Planned' | 'In Progress' | 'Completed'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
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
  status: 'Available' | 'In Use' | 'Maintenance'
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
  availability: 'Available' | 'On Trip' | 'Off Duty'
  assignedVehicle: string
  currentTrip: string
  status: 'Active' | 'Inactive'
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
  severity: 'Low' | 'Medium' | 'High'
  recommendation: string
  category: 'maintenance' | 'fuel' | 'route' | 'allocation'
}

export interface NotificationItem {
  id: string
  message: string
  type: 'info' | 'warning' | 'success' | 'critical'
  role: UserRole | 'all'
}

export interface ServiceHealth {
  name: string
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  description: string
  detail: string
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: string
  roleContext?: UserRole
}
