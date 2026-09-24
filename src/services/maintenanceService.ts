import { mockVehicles, mockAIPredictions, useMockApi } from './mockRegistry'
import type { Vehicle } from '../types'

export const maintenanceService = {
  getMaintenanceAlerts: async (): Promise<Vehicle[]> => {
    if (useMockApi()) return mockVehicles.filter((vehicle) => vehicle.maintenanceRisk > 50)
    return []
  },
  getPredictions: async () => {
    if (useMockApi()) return mockAIPredictions.filter((item) => item.category === 'maintenance')
    return []
  },
}
