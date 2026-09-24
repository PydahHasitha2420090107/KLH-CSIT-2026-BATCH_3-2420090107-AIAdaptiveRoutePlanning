import { mockTrips, useMockApi } from './mockRegistry'
import type { Trip } from '../types'

async function fetchTrips(): Promise<Trip[]> {
  if (useMockApi()) return mockTrips
  return []
}

export const tripService = {
  fetchTrips,
  getTripById: async (id: string) => (await fetchTrips()).find((trip) => trip.id === id) ?? null,
}
