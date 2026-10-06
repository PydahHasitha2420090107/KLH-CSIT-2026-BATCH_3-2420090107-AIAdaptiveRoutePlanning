import { useMockApi, mockShipments } from './mockRegistry'
import { API_BASE_URL, request } from './api'
import type { Shipment } from '../types'

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export type UserDashboardData = {
  stats: {
    activeTransportRequests: number
    completedRequests: number
    pendingRequests: number
    delayedRequests: number
  }
  activeShipment: {
    id: string
    status: Shipment['status']
    currentLocation: string
    estimatedDelivery: string
    progress: number
  } | null
}

async function fetchShipments(): Promise<Shipment[]> {
  if (useMockApi()) return mockShipments
  const response = await request<ApiResponse<Shipment[]>>(`${API_BASE_URL}/shipments/my`)
  return response.data
}

async function fetchAllShipments(): Promise<Shipment[]> {
  if (useMockApi()) return mockShipments
  const response = await request<ApiResponse<Shipment[]>>(`${API_BASE_URL}/shipments`)
  return response.data
}

export const shipmentService = {
  fetchShipments,
  fetchAllShipments,
  getShipmentById: async (id: string) => (await fetchShipments()).find((shipment) => shipment.id === id) ?? null,
  createShipment: async (payload: Record<string, unknown>) => {
    const response = await request<ApiResponse<Shipment>>(`${API_BASE_URL}/shipments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return response.data
  },
  fetchUserDashboard: async () => {
    const response = await request<ApiResponse<UserDashboardData>>(`${API_BASE_URL}/dashboard/user`)
    return response.data
  },
  assign: async (id: string, vehicleId: string, driverId: string) => {
    const response = await request<ApiResponse<{ id: string; tripId: string; vehicleId: string; driverId: string; status: string }>>(`${API_BASE_URL}/shipments/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ vehicleId, driverId }),
    })
    return response.data
  },
}
