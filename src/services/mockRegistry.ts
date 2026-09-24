import { mockAIPredictions, mockDrivers, mockNotifications, mockServiceHealth, mockShipments, mockTrips, mockUsers, mockVehicles } from '../mocks/mockData'

export const useMockApi = () => import.meta.env.VITE_USE_MOCK_API !== 'false'

export { mockAIPredictions, mockDrivers, mockNotifications, mockServiceHealth, mockShipments, mockTrips, mockUsers, mockVehicles }
