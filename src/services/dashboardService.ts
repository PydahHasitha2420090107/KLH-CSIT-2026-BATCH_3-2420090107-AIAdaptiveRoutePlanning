import { API_BASE_URL, request } from './api'
import type { ShipmentStatus } from '../types'

type ApiResponse<T> = { success: boolean; data: T; message: string }

export type DriverDashboardData = {
  stats: {
    todayTrips: number
    assignedRequests: number
    pendingPickups: number
    completedRequests: number
    currentVehicle: string | null
  }
  assignments: Array<{
    id: string
    type: string
    origin: string
    destination: string
    weight: string
    status: ShipmentStatus
  }>
  currentTrip: null | {
    id: string
    source: string
    destination: string
    distance: string
    estimatedTime: string
    status: string
    route: string
    shipmentId: string
  }
}

export type ManagerDashboardData = {
  kpis: {
    totalVehicles: number
    availableVehicles: number
    activeTrips: number
    activeTransportRequests: number
    completedRequests: number
    maintenanceAlerts: number
    fleetUtilization: number
    averageFuelEfficiency: number
  }
  utilizationData: Array<{ name: string; value: number }>
  activeTrips: Array<{ id: string; source: string; destination: string; status: string }>
  maintenanceAlerts: Array<{ id: string; maintenanceRisk: number }>
  aiRecommendations: Array<{ id: string; title: string; recommendation: string; severity: string }>
  serviceHealth: Array<{ id: string; name: string; status: string; detail: string }>
  shipmentOverview: Array<{ name: string; value: number }>
  driverCount: number
}

export const dashboardService = {
  fetchDriver: async () => (await request<ApiResponse<DriverDashboardData>>(`${API_BASE_URL}/dashboard/driver`)).data,
  fetchManager: async () => (await request<ApiResponse<ManagerDashboardData>>(`${API_BASE_URL}/dashboard/manager`)).data,
}