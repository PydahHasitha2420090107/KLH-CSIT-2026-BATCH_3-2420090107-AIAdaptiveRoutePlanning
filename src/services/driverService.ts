import { mockDrivers, useMockApi } from './mockRegistry'
import type { Driver } from '../types'

async function fetchDrivers(): Promise<Driver[]> {
  if (useMockApi()) return mockDrivers
  return []
}

export const driverService = {
  fetchDrivers,
  getDriverById: async (id: string) => (await fetchDrivers()).find((driver) => driver.id === id) ?? null,
}
