import { mockAIPredictions, useMockApi } from './mockRegistry'
import { API_BASE_URL, request } from './api'

export type SmartFleetRoute = {
  recommendedRoute: string[]
  distance: string
  estimatedDuration: string
  algorithmUsed: string
  origin: string
  destination: string
}

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export const routeService = {
  optimizeRoute: async (origin: string, destination: string) => {
    const response = await request<ApiResponse<SmartFleetRoute>>(`${API_BASE_URL}/routes/optimize`, {
      method: 'POST',
      body: JSON.stringify({ origin, destination }),
    })
    return response.data
  },

  getRouteRecommendations: async () => {
    if (useMockApi()) return [
      { name: 'Route A', distance: '152 km', predictedTime: '3h 42m', score: 88 },
      { name: 'Route B', distance: '146 km', predictedTime: '3h 21m', score: 94 },
      { name: 'Route C', distance: '158 km', predictedTime: '3h 58m', score: 81 },
    ]
    return []
  },
  getRouteInsights: async () => mockAIPredictions.filter((item) => item.category === 'route'),
}
