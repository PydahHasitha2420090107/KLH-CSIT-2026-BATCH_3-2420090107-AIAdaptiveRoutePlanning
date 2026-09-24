import { mockAIPredictions, useMockApi } from './mockRegistry'

export const routeService = {
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
