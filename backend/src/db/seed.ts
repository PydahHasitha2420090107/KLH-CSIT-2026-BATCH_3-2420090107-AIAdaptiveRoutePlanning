import { db, hashPassword } from './database.js'

const users = [
  { id: 'U-1001', name: 'Aisha Rahman', email: 'customer@smartfleet.io', phone: '+94 77 111 2222', password: 'password123', role: 'user' },
  { id: 'D-2001', name: 'Daniel Scott', email: 'driver@smartfleet.io', phone: '+94 77 333 4444', password: 'password123', role: 'driver' },
  { id: 'M-3001', name: 'Maya Johnson', email: 'manager@smartfleet.io', phone: '+94 77 555 6666', password: 'password123', role: 'manager' },
]

const vehicles = [
  { id: 'V-101', registrationNumber: 'CAB-2041', type: 'Truck', status: 'Available', condition: 'Excellent', mileage: 18200, fuelEfficiency: 13.8, maintenanceRisk: 24, assignedDriver: 'Unassigned', fuelLevel: 76, maintenanceDue: '2026-10-12' },
  { id: 'V-102', registrationNumber: 'CAB-6784', type: 'Van', status: 'In Use', condition: 'Good', mileage: 26890, fuelEfficiency: 14.2, maintenanceRisk: 38, assignedDriver: 'D-2004', fuelLevel: 64, maintenanceDue: '2026-09-30' },
  { id: 'V-104', registrationNumber: 'CAB-4452', type: 'Truck', status: 'In Use', condition: 'Excellent', mileage: 21980, fuelEfficiency: 15.4, maintenanceRisk: 31, assignedDriver: 'D-2001', fuelLevel: 58, maintenanceDue: '2026-10-09' },
  { id: 'V-107', registrationNumber: 'CAB-2209', type: 'Mini Van', status: 'In Use', condition: 'Fair', mileage: 41300, fuelEfficiency: 11.7, maintenanceRisk: 72, assignedDriver: 'D-2005', fuelLevel: 33, maintenanceDue: '2026-09-17' },
  { id: 'V-111', registrationNumber: 'CAB-7532', type: 'Truck', status: 'Available', condition: 'Good', mileage: 22440, fuelEfficiency: 14.9, maintenanceRisk: 47, assignedDriver: 'Unassigned', fuelLevel: 81, maintenanceDue: '2026-10-21' },
]

const drivers = [
  { id: 'D-2001', name: 'Daniel Scott', license: 'DL-12093', availability: 'On Trip', assignedVehicle: 'V-104', currentTrip: 'TRIP-203', status: 'Active' },
  { id: 'D-2003', name: 'Lahiru Jayasena', license: 'DL-22417', availability: 'Available', assignedVehicle: 'V-111', currentTrip: 'TRIP-109', status: 'Active' },
  { id: 'D-2004', name: 'Shanaka Dias', license: 'DL-11188', availability: 'On Trip', assignedVehicle: 'V-102', currentTrip: 'TRIP-330', status: 'Active' },
  { id: 'D-2005', name: 'Mithun Fernando', license: 'DL-9843', availability: 'On Trip', assignedVehicle: 'V-107', currentTrip: 'TRIP-215', status: 'Active' },
]

const shipments = [
  {
    id: 'SHP-1001',
    customer_id: 'U-1001',
    customer: 'Aisha Rahman',
    origin: 'Colombo 07 Residence',
    destination: 'Kandy Residence',
    status: 'In Transit',
    vehicle: 'V-104',
    driver: 'D-2001',
    priority: 'High',
    estimatedDelivery: '2026-09-18 16:45',
    currentLocation: 'Kurunegala',
    progress: 72,
    type: 'House Shifting',
    weight: '420 kg',
    quantity: 12,
    specialHandling: 'Furniture, appliances, and packed household boxes',
    senderName: 'Aisha Rahman',
    senderContact: '+94 77 111 2222',
    receiverName: 'Kandy Residence',
    receiverContact: '+94 77 222 3333',
    route: 'A1 Main Road',
  },
  {
    id: 'SHP-1012',
    customer_id: 'U-1001',
    customer: 'Nimal Perera',
    origin: 'Madampe Sand Quarry',
    destination: 'Negombo Construction Site',
    status: 'Assigned',
    vehicle: 'V-102',
    driver: 'D-2004',
    priority: 'Medium',
    estimatedDelivery: '2026-09-18 12:30',
    currentLocation: 'Galle',
    progress: 18,
    type: 'Sand Transportation',
    weight: '780 kg',
    quantity: 25,
    specialHandling: 'Covered heavy lorry required',
    senderName: 'Nimal Perera',
    senderContact: '+94 77 333 4444',
    receiverName: 'Negombo Construction Site',
    receiverContact: '+94 77 444 5555',
    route: 'Southern Highway',
  },
  {
    id: 'SHP-1024',
    customer_id: 'U-1001',
    customer: 'Aisha Rahman',
    origin: 'Katunayake Material Yard',
    destination: 'Dambulla Construction Site',
    status: 'Delayed',
    vehicle: 'V-107',
    driver: 'D-2005',
    priority: 'High',
    estimatedDelivery: '2026-09-18 21:05',
    currentLocation: 'Matale',
    progress: 55,
    type: 'Construction Materials',
    weight: '2,600 kg',
    quantity: 8,
    specialHandling: 'Cement, bricks, and gravel secured for transport',
    senderName: 'Aisha Rahman',
    senderContact: '+94 77 111 2222',
    receiverName: 'Dambulla Construction Site',
    receiverContact: '+94 77 666 7777',
    route: 'Central Expressway',
  },
  {
    id: 'SHP-1038',
    customer_id: 'U-1001',
    customer: 'Harini Silva',
    origin: 'Jaffna Furniture Store',
    destination: 'Trincomalee Residence',
    status: 'Delivered',
    vehicle: 'V-111',
    driver: 'D-2003',
    priority: 'Low',
    estimatedDelivery: '2026-09-16 09:10',
    currentLocation: 'Trincomalee',
    progress: 100,
    type: 'Furniture Transportation',
    weight: '500 kg',
    quantity: 18,
    specialHandling: 'Protect furniture with blankets and straps',
    senderName: 'Harini Silva',
    senderContact: '+94 77 999 1111',
    receiverName: 'Trincomalee Residence',
    receiverContact: '+94 77 222 1111',
    route: 'A9 Main Road',
  },
]

const trips = [
  { id: 'TRIP-203', shipment_id: 'SHP-1001', source: 'Colombo 07 Residence', destination: 'Kandy Residence', distance: '115 km', estimated_time: '3h 40m', status: 'In Progress', route: 'A1 Main Road' },
  { id: 'TRIP-330', shipment_id: 'SHP-1012', source: 'Madampe Sand Quarry', destination: 'Negombo Construction Site', distance: '86 km', estimated_time: '2h 25m', status: 'Planned', route: 'Southern Highway' },
  { id: 'TRIP-215', shipment_id: 'SHP-1024', source: 'Katunayake Material Yard', destination: 'Dambulla Construction Site', distance: '161 km', estimated_time: '3h 55m', status: 'In Progress', route: 'Central Expressway' },
  { id: 'TRIP-109', shipment_id: 'SHP-1038', source: 'Jaffna Furniture Store', destination: 'Trincomalee Residence', distance: '98 km', estimated_time: '2h 40m', status: 'Completed', route: 'A9 Main Road' },
] 

const aiRecommendations = [
  { id: 'AI-1', title: 'Vehicle V-107 maintenance risk', description: 'Brake wear trending above acceptable range and coolant leakage detected.', score: 82, severity: 'High', recommendation: 'Schedule inspection before next long haul.', category: 'maintenance' },
  { id: 'AI-2', title: 'Route efficiency forecast', description: 'Route B is 11% faster than the current assignment under current traffic patterns.', score: 91, severity: 'Medium', recommendation: 'Recommend Route B for construction material request SHP-1024.', category: 'route' },
  { id: 'AI-3', title: 'Fuel consumption anomaly', description: 'V-111 shows reduced fuel efficiency due to repeated idle time.', score: 68, severity: 'Medium', recommendation: 'Review driver behavior and maintenance tuning.', category: 'fuel' },
  { id: 'AI-4', title: 'Vehicle allocation suggestion', description: 'Assign V-104 to the house shifting request due to its solid health score and load capacity.', score: 94, severity: 'Low', recommendation: 'Use V-104 for the next house shifting request.', category: 'allocation' },
]

const notifications = [
  { id: 'N-1', user_id: null, message: 'Vehicle V-104 has high maintenance risk.', type: 'warning', role: 'all' },
  { id: 'N-2', user_id: null, message: 'Transport request SHP-1024 has been assigned.', type: 'info', role: 'all' },
  { id: 'N-3', user_id: null, message: 'Trip TRIP-203 has started.', type: 'success', role: 'all' },
  { id: 'N-4', user_id: null, message: 'AI recommends Route B.', type: 'info', role: 'all' },
  { id: 'N-5', user_id: 'U-1001', message: 'Your transport request is delayed due to weather risk.', type: 'critical', role: 'user' },
]

const health = [
  { id: 'HS-1', name: 'Vehicle Service', status: 'ONLINE', description: 'Fleet health tracking and utilization', detail: 'Response 114ms' },
  { id: 'HS-2', name: 'Driver Service', status: 'ONLINE', description: 'Driver assignment and availability', detail: 'Response 98ms' },
  { id: 'HS-3', name: 'Shipment Service', status: 'ONLINE', description: 'Shipment routing and lifecycle management', detail: 'Response 139ms' },
  { id: 'HS-4', name: 'Trip Service', status: 'DEGRADED', description: 'Trip updates routed through API gateway', detail: 'Response 240ms' },
  { id: 'HS-5', name: 'Maintenance Service', status: 'ONLINE', description: 'Predictive maintenance scoring', detail: 'Response 166ms' },
  { id: 'HS-6', name: 'Route Service', status: 'ONLINE', description: 'Short path and route optimization', detail: 'Response 122ms' },
  { id: 'HS-7', name: 'AI/ML Service', status: 'ONLINE', description: 'Predictive maintenance and route recommendations', detail: 'Response 195ms' },
]

export function seedDatabase() {
  const insertUser = db.prepare(`INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`)
  for (const user of users) {
    insertUser.run(user.id, user.name, user.email, user.phone, hashPassword(user.password), user.role)
  }

  const insertVehicle = db.prepare(`INSERT OR IGNORE INTO vehicles (id, registration_number, type, status, condition, mileage, fuel_efficiency, maintenance_risk, assigned_driver_id, fuel_level, maintenance_due) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const vehicle of vehicles) {
    insertVehicle.run(vehicle.id, vehicle.registrationNumber, vehicle.type, vehicle.status, vehicle.condition, vehicle.mileage, vehicle.fuelEfficiency, vehicle.maintenanceRisk, vehicle.assignedDriver === 'Unassigned' ? null : vehicle.assignedDriver, vehicle.fuelLevel, vehicle.maintenanceDue)
  }

  const insertShipment = db.prepare(`INSERT OR IGNORE INTO shipments (id, customer_id, customer, origin, destination, status, vehicle, driver, priority, estimated_delivery, current_location, progress, type, weight, quantity, special_handling, sender_name, sender_contact, receiver_name, receiver_contact, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const shipment of shipments) {
    insertShipment.run(
      shipment.id,
      shipment.customer_id,
      shipment.customer,
      shipment.origin,
      shipment.destination,
      shipment.status,
      shipment.vehicle,
      shipment.driver,
      shipment.priority,
      shipment.estimatedDelivery,
      shipment.currentLocation,
      shipment.progress,
      shipment.type,
      shipment.weight,
      shipment.quantity,
      shipment.specialHandling,
      shipment.senderName,
      shipment.senderContact,
      shipment.receiverName,
      shipment.receiverContact,
      shipment.route,
    )
  }

  const insertTrip = db.prepare(`INSERT OR IGNORE INTO trips (id, shipment_id, source, destination, distance, estimated_time, status, route) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const trip of trips) {
    insertTrip.run(trip.id, trip.shipment_id, trip.source, trip.destination, trip.distance, trip.estimated_time, trip.status, trip.route)
  }

  const insertDriver = db.prepare(`INSERT OR IGNORE INTO drivers (id, user_id, name, license, availability, assigned_vehicle_id, current_trip_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const driver of drivers) {
    const userId = driver.id === 'D-2001' ? 'D-2001' : driver.id
    insertDriver.run(driver.id, userId, driver.name, driver.license, driver.availability, driver.assignedVehicle, driver.currentTrip, driver.status)
  }

  const insertNotification = db.prepare(`INSERT OR IGNORE INTO notifications (id, user_id, message, type, role, read) VALUES (?, ?, ?, ?, ?, ?)`)
  for (const notif of notifications) {
    insertNotification.run(notif.id, notif.user_id, notif.message, notif.type, notif.role, 0)
  }

  const insertAi = db.prepare(`INSERT OR IGNORE INTO ai_recommendations (id, title, description, score, severity, recommendation, category) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  for (const item of aiRecommendations) {
    insertAi.run(item.id, item.title, item.description, item.score, item.severity, item.recommendation, item.category)
  }

  const insertServiceHealth = db.prepare(`INSERT OR IGNORE INTO service_health (id, name, status, description, detail) VALUES (?, ?, ?, ?, ?)`)
  for (const item of health) {
    insertServiceHealth.run(item.id, item.name, item.status, item.description, item.detail)
  }
}
