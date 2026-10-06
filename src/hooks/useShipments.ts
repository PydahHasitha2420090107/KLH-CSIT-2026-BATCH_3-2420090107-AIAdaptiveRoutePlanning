import { useEffect, useState } from 'react'
import { shipmentService } from '../services/shipmentService'
import type { Shipment } from '../types'

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    void shipmentService.fetchShipments()
      .then((result) => { if (active) setShipments(result) })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load transport requests.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  return { shipments, loading, error }
}