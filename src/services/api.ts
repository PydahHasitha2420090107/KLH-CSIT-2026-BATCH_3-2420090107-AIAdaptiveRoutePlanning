export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

export const serviceUrls = {
  vehicle: import.meta.env.VITE_VEHICLE_SERVICE_URL || `${API_BASE_URL}/vehicle`,
  driver: import.meta.env.VITE_DRIVER_SERVICE_URL || `${API_BASE_URL}/driver`,
  shipment: import.meta.env.VITE_SHIPMENT_SERVICE_URL || `${API_BASE_URL}/shipment`,
  trip: import.meta.env.VITE_TRIP_SERVICE_URL || `${API_BASE_URL}/trip`,
  route: import.meta.env.VITE_ROUTE_SERVICE_URL || `${API_BASE_URL}/route`,
  maintenance: import.meta.env.VITE_MAINTENANCE_SERVICE_URL || `${API_BASE_URL}/maintenance`,
  ai: import.meta.env.VITE_AI_SERVICE_URL || `${API_BASE_URL}/ai`,
}

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}
