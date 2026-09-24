import { useMockApi, mockShipments } from './mockRegistry'
import type { Shipment } from '../types'

async function fetchShipments(): Promise<Shipment[]> {
  if (useMockApi()) return mockShipments
  return []
}

export const shipmentService = {
  fetchShipments,
  getShipmentById: async (id: string) => (await fetchShipments()).find((shipment) => shipment.id === id) ?? null,
}
