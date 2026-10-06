import { mockDrivers, useMockApi } from './mockRegistry'
import { API_BASE_URL, request } from './api'
import type { Driver } from '../types'

type ApiResponse<T> = { success: boolean; data: T; message: string }

async function fetchDrivers(): Promise<Driver[]> {
  if (useMockApi()) return mockDrivers
  const response = await request<ApiResponse<Driver[]>>(`${API_BASE_URL}/drivers`)
  return response.data
}

export const driverService = {
  fetchDrivers,
  fetchAvailable: async () => (await request<ApiResponse<Driver[]>>(`${API_BASE_URL}/drivers/available`)).data,
  getDriverById: async (id: string) => (await fetchDrivers()).find((driver) => driver.id === id) ?? null,
}
