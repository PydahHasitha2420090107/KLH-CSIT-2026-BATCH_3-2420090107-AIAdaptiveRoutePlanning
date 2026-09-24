import { mockVehicles, useMockApi } from './mockRegistry'
import type { Vehicle } from '../types'

async function fetchVehicles(): Promise<Vehicle[]> {
  if (useMockApi()) return mockVehicles
  return []
}

export const vehicleService = {
  fetchVehicles,
  getVehicleById: async (id: string) => (await fetchVehicles()).find((vehicle) => vehicle.id === id) ?? null,
}
