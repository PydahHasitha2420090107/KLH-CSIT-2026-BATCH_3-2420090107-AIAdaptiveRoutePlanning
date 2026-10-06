import { mockVehicles, useMockApi } from './mockRegistry'
import { API_BASE_URL, request } from './api'
import type { Vehicle } from '../types'

type ApiResponse<T> = { success: boolean; data: T; message: string }

async function fetchVehicles(): Promise<Vehicle[]> {
  if (useMockApi()) return mockVehicles
  const response = await request<ApiResponse<Vehicle[]>>(`${API_BASE_URL}/vehicles`)
  return response.data
}

async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  if (useMockApi()) return mockVehicles.find((vehicle) => vehicle.id === id) ?? null
  const response = await request<ApiResponse<Vehicle>>(`${API_BASE_URL}/vehicles/${id}`)
  return response.data
}

export const vehicleService = {
  fetchVehicles,
  fetchAvailable: async () => (await request<ApiResponse<Vehicle[]>>(`${API_BASE_URL}/vehicles/available`)).data,
  getVehicleById: fetchVehicleById,
}
