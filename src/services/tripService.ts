import { mockTrips, useMockApi } from './mockRegistry'
import { API_BASE_URL, request } from './api'
import type { Trip } from '../types'

type ApiResponse<T> = { success: boolean; data: T; message: string }

async function fetchTrips(): Promise<Trip[]> {
  if (useMockApi()) return mockTrips
  const response = await request<ApiResponse<Trip[]>>(`${API_BASE_URL}/trips`)
  return response.data
}

export const tripService = {
  fetchTrips,
  getTripById: async (id: string) => (await fetchTrips()).find((trip) => trip.id === id) ?? null,
  start: async (id: string) => request<ApiResponse<{ id: string; status: string }>>(`${API_BASE_URL}/trips/${id}/start`, { method: 'POST' }),
  complete: async (id: string) => request<ApiResponse<{ id: string; status: string }>>(`${API_BASE_URL}/trips/${id}/complete`, { method: 'POST' }),
  updateStatus: async (id: string, status: string) => request<ApiResponse<{ id: string; status: string }>>(`${API_BASE_URL}/trips/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}
