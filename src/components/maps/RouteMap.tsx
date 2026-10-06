import { useEffect, useMemo, useState } from 'react'
import L, { type LatLngTuple } from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type Coordinate = { lat: number; lng: number }

type ShipmentRouteData = {
  origin?: string | null
  destination?: string | null
  pickupLocation?: string | null
  destinationAddress?: string | null
}

type RouteMapProps = {
  origin?: string | null
  destination?: string | null
  currentLocation?: Coordinate | null
  waypoints?: string[]
  shipment?: ShipmentRouteData
  smartFleetRoute?: string[]
  smartFleetDistance?: string
  smartFleetDuration?: string
  height?: number
}

type RoadGeometry = {
  coords: LatLngTuple[]
  distanceKm: number | null
  durationMinutes: number | null
}

const noWaypoints: string[] = []

function RouteFeedback({ message, detail }: { message: string; detail?: string }) {
  return (
    <div className="route-map-feedback" role="status">
      <strong>{message}</strong>
      {detail && <small>{detail}</small>}
    </div>
  )
}

function createMarkerIcon(label: string, color: string) {
  return L.divIcon({
    className: 'smartfleet-route-marker',
    html: `<span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:${color};color:white;font-weight:700;border:2px solid rgba(255,255,255,0.8);box-shadow:0 6px 18px rgba(0,0,0,0.2);">${label}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

function FitRouteToBounds({ points }: { points: LatLngTuple[] }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return
    map.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 12 })
  }, [map, points])

  return null
}

async function geocodeAddress(address: string): Promise<Coordinate | null> {
  const trimmed = address.trim()
  if (!trimmed) return null

  const query = encodeURIComponent(trimmed)
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`, {
    headers: {
      'Accept-Language': 'en',
    },
  })

  if (!response.ok) return null

  const results = await response.json() as Array<{ lat?: string; lon?: string }>
  const result = results[0]
  if (!result?.lat || !result?.lon) return null

  return { lat: Number(result.lat), lng: Number(result.lon) }
}

async function fetchRoadGeometry(origin: Coordinate, destination: Coordinate): Promise<RoadGeometry | null> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=false`
  const response = await fetch(url)
  if (!response.ok) return null

  const payload = await response.json() as { routes?: Array<{ distance?: number; duration?: number; geometry?: { coordinates?: [number, number][] } }> }
  const route = payload.routes?.[0]
  const geometry = route?.geometry?.coordinates
  if (!route || !geometry || !geometry.length) return null

  return {
    coords: geometry.map(([lng, lat]) => [lat, lng] as LatLngTuple),
    distanceKm: typeof route.distance === 'number' ? route.distance / 1000 : null,
    durationMinutes: typeof route.duration === 'number' ? route.duration / 60 : null,
  }
}

export function RouteMap({
  origin,
  destination,
  currentLocation,
  waypoints = noWaypoints,
  shipment,
  smartFleetRoute,
  smartFleetDistance,
  smartFleetDuration,
  height = 400,
}: RouteMapProps) {
  const pickup = (origin ?? shipment?.origin ?? shipment?.pickupLocation ?? '').trim()
  const dropoff = (destination ?? shipment?.destination ?? shipment?.destinationAddress ?? '').trim()

  const [originCoordinate, setOriginCoordinate] = useState<Coordinate | null>(null)
  const [destinationCoordinate, setDestinationCoordinate] = useState<Coordinate | null>(null)
  const [routeGeometry, setRouteGeometry] = useState<RoadGeometry | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setMessage('')
    setOriginCoordinate(null)
    setDestinationCoordinate(null)
    setRouteGeometry(null)

    if (!pickup || !dropoff) {
      setLoading(false)
      return () => { active = false }
    }

    void (async () => {
      try {
        const [pickupPoint, destinationPoint] = await Promise.all([
          geocodeAddress(pickup),
          geocodeAddress(dropoff),
        ])

        if (!active) return

        if (!pickupPoint || !destinationPoint) {
          setMessage('We could not locate the pickup and destination for this route.')
          setLoading(false)
          return
        }

        setOriginCoordinate(pickupPoint)
        setDestinationCoordinate(destinationPoint)

        const geometry = await fetchRoadGeometry(pickupPoint, destinationPoint)
        if (!active) return

        setRouteGeometry(geometry)
        if (!geometry) {
          setMessage('OpenStreetMap road geometry is temporarily unavailable, but the shipment markers are shown.')
        }
      } catch {
        if (active) setMessage('Unable to load the route map for these addresses.')
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => { active = false }
  }, [pickup, dropoff])

  const routePoints = useMemo<LatLngTuple[]>(() => {
    const points: LatLngTuple[] = []
    if (originCoordinate) points.push([originCoordinate.lat, originCoordinate.lng])
    if (destinationCoordinate) points.push([destinationCoordinate.lat, destinationCoordinate.lng])
    if (currentLocation) points.push([currentLocation.lat, currentLocation.lng])
    if (routeGeometry?.coords?.length) points.push(...routeGeometry.coords)
    return points
  }, [currentLocation, destinationCoordinate, originCoordinate, routeGeometry])

  if (!pickup || !dropoff) {
    return <RouteFeedback message="Route information is unavailable for this shipment." />
  }

  if (loading) {
    return <RouteFeedback message="Loading route map..." />
  }

  if (!originCoordinate || !destinationCoordinate) {
    return <RouteFeedback message="Unable to load the route map." detail={message || 'Please confirm the shipment pickup and destination are valid addresses.'} />
  }

  const center = [originCoordinate.lat, originCoordinate.lng] as LatLngTuple
  const routeName = smartFleetRoute?.length ? smartFleetRoute.join(' → ') : 'Dijkstra recommendation'
  const geometryDistance = routeGeometry?.distanceKm == null ? 'Unavailable' : `${routeGeometry.distanceKm.toFixed(1)} km`
  const geometryDuration = routeGeometry?.durationMinutes == null ? 'Unavailable' : `${Math.round(routeGeometry.durationMinutes)} min`

  return (
    <div className="route-map-content">
      {message && <div className="route-map-feedback" role="status"><strong>{message}</strong></div>}
      <div className="route-map-canvas" style={{ height }}>
        <MapContainer center={center} zoom={8} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitRouteToBounds points={routePoints} />

          {routeGeometry?.coords && routeGeometry.coords.length > 1 && (
            <Polyline positions={routeGeometry.coords} pathOptions={{ color: '#146f69', weight: 6, opacity: 0.9 }} />
          )}

          <Marker position={[originCoordinate.lat, originCoordinate.lng]} icon={createMarkerIcon('P', '#1b8a7f')} />
          <Marker position={[destinationCoordinate.lat, destinationCoordinate.lng]} icon={createMarkerIcon('D', '#d04f4f')} />

          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={createMarkerIcon('V', '#1d4ed8')} />
          )}

          {waypoints.map((waypoint) => {
            if (!waypoint?.trim()) return null
            return <Marker key={waypoint} position={[originCoordinate.lat, originCoordinate.lng]} icon={createMarkerIcon('W', '#f59e0b')} />
          })}
        </MapContainer>
      </div>

      <div className="route-map-summary" aria-label="Calculated route details">
        <div><span>OpenStreetMap route distance</span><strong>{geometryDistance}</strong></div>
        <div><span>OpenStreetMap route time</span><strong>{geometryDuration}</strong></div>
        <div className="route-map-summary-recommendation"><span>Dijkstra route decision</span><strong>{routeName}</strong></div>
        {smartFleetDistance && <div><span>Dijkstra graph distance</span><strong>{smartFleetDistance}</strong></div>}
        {smartFleetDuration && <div><span>Dijkstra graph estimate</span><strong>{smartFleetDuration}</strong></div>}
      </div>
    </div>
  )
}