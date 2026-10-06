export type MaintenanceRiskInput = {
  vehicleId?: string
  mileage?: number
  vehicleAge?: number
  condition?: string
  usage?: string
  maintenanceHistory?: number
}

export type FuelPredictionInput = {
  vehicleType?: string
  distance?: number
  fuelType?: string
  load?: number
  historicalEfficiency?: number
  condition?: string
}

export type TravelTimeInput = {
  distance?: number
  vehicleType?: string
  load?: number
  condition?: string
}

export function predictMaintenanceRisk(input: MaintenanceRiskInput) {
  const mileage = Number(input.mileage ?? 0)
  const age = Number(input.vehicleAge ?? 0)
  const history = Number(input.maintenanceHistory ?? 0)
  const condition = (input.condition ?? 'Good').toUpperCase()
  const usage = (input.usage ?? 'normal').toLowerCase()

  let score = 15 + mileage / 2000 + age * 7 + history * 10
  if (condition === 'POOR') score += 30
  else if (condition === 'FAIR') score += 18
  else if (condition === 'GOOD') score += 8

  if (usage.includes('heavy')) score += 18
  else if (usage.includes('long')) score += 12

  if (score > 80) return { riskLevel: 'HIGH', riskScore: Math.min(100, Math.round(score)), vehicleId: input.vehicleId ?? 'UNKNOWN', recommendation: 'Schedule inspection immediately and verify brake and axle systems.' }
  if (score > 45) return { riskLevel: 'MEDIUM', riskScore: Math.min(100, Math.round(score)), vehicleId: input.vehicleId ?? 'UNKNOWN', recommendation: 'Perform routine inspection within the next maintenance cycle.' }
  return { riskLevel: 'LOW', riskScore: Math.min(100, Math.round(score)), vehicleId: input.vehicleId ?? 'UNKNOWN', recommendation: 'Continue the standard maintenance schedule.' }
}

export function predictFuelUsage(input: FuelPredictionInput) {
  const distance = Number(input.distance ?? 0)
  const load = Number(input.load ?? 0)
  const historical = Number(input.historicalEfficiency ?? 12)
  const condition = (input.condition ?? 'Good').toUpperCase()
  const adjustment = condition === 'POOR' ? 1.18 : condition === 'FAIR' ? 1.1 : 1

  const baseFuelNeeded = (distance / historical) * adjustment
  const loadFactor = 1 + (load / 1000) * 0.18
  const fuelRequired = baseFuelNeeded * loadFactor

  return {
    vehicleType: input.vehicleType ?? 'Truck',
    fuelType: input.fuelType ?? 'diesel',
    distance,
    predictedFuelUsage: Number(fuelRequired.toFixed(2)),
    estimatedCost: Number((fuelRequired * 1.8).toFixed(2)),
    recommendation: fuelRequired > 30 ? 'Consider a route optimization to reduce fuel burn.' : 'Fuel usage is within expected range.',
  }
}

export function recommendVehicle(input: {
  transportType?: string
  pickup?: string
  destination?: string
  weight?: number
  quantity?: number
  priority?: string
  requiredVehicleType?: string
  vehicles?: Array<Record<string, any>>
}) {
  const vehicles = Array.isArray(input.vehicles) && input.vehicles.length > 0 ? input.vehicles : [
    { id: 'V-101', type: 'Truck', status: 'Available', fuelEfficiency: 12.5, maintenanceRisk: 28 },
    { id: 'V-102', type: 'Van', status: 'Available', fuelEfficiency: 14.2, maintenanceRisk: 31 },
    { id: 'V-103', type: 'Trailer', status: 'In Use', fuelEfficiency: 11.3, maintenanceRisk: 42 },
  ]

  const sorted = [...vehicles].sort((a, b) => {
    const riskA = Number(a.maintenance_risk ?? a.maintenanceRisk ?? 0)
    const riskB = Number(b.maintenance_risk ?? b.maintenanceRisk ?? 0)
    const effA = Number(a.fuel_efficiency ?? a.fuelEfficiency ?? 0)
    const effB = Number(b.fuel_efficiency ?? b.fuelEfficiency ?? 0)
    return (riskA + 10 - effA) - (riskB + 10 - effB)
  })

  const candidate = sorted[0] ?? vehicles[0]

  return {
    selectedVehicleId: candidate.id,
    selectedVehicleType: candidate.type ?? input.requiredVehicleType ?? 'Truck',
    reason: `Recommended for ${input.transportType ?? 'shipment'} from ${input.pickup ?? 'origin'} to ${input.destination ?? 'destination'} using the lowest-risk available asset.`,
    eta: `${Math.max(1, Number(input.quantity ?? 1) + 1)}h`,
  }
}

export function predictTravelTime(input: TravelTimeInput) {
  const distance = Number(input.distance ?? 0)
  const load = Number(input.load ?? 0)
  const vehicleType = input.vehicleType ?? 'Truck'
  const condition = (input.condition ?? 'Good').toUpperCase()

  const baseSpeed = vehicleType.toLowerCase().includes('van') ? 42 : vehicleType.toLowerCase().includes('trailer') ? 38 : 35
  const loadPenalty = 1 + load / 1000
  const conditionPenalty = condition === 'POOR' ? 1.22 : condition === 'FAIR' ? 1.1 : 1
  const hours = (distance / baseSpeed) * loadPenalty * conditionPenalty

  return {
    vehicleType,
    distance,
    predictedHours: Number(hours.toFixed(2)),
    predictedMinutes: Math.round(hours * 60),
    recommendation: hours > 10 ? 'High travel time detected; consider route splitting or a faster alternative.' : 'Travel time is within normal operating range.',
  }
}
