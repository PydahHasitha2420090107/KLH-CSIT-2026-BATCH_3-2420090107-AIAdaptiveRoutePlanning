const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '')
export const API_BASE_URL = configuredApiBaseUrl.endsWith('/api') ? configuredApiBaseUrl : `${configuredApiBaseUrl}/api`
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

const authTokenKey = 'smartfleet-token'

export function getAuthToken() {
  return localStorage.getItem(authTokenKey)
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(authTokenKey, token)
  else localStorage.removeItem(authTokenKey)
}

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
  const headers = new Headers(options?.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = getAuthToken()
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('Sorry, I could not connect to the SmartFleet AI service. Please try again.')
  }

  const body = await response.json() as { message?: string }
  if (!response.ok) {
    throw new Error(body.message || `Request failed with status ${response.status}`)
  }

  return body as T
}
