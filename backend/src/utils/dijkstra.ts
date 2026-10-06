export type DijkstraResult = {
  path: string[]
  distance: number
}

export const fleetRouteGraph: Record<string, Record<string, number>> = {
  Colombo: { Negombo: 25, Kandy: 180 },
  Negombo: { Colombo: 25, Galle: 160 },
  Galle: { Negombo: 160, Matale: 220 },
  Matale: { Galle: 220, Kandy: 70 },
  Kandy: { Colombo: 180, Matale: 70, Dambulla: 80 },
  Dambulla: { Kandy: 80, Trincomalee: 170 },
  Trincomalee: { Dambulla: 170 },
}

export function dijkstra(graph: Record<string, Record<string, number>>, start: string, target: string): DijkstraResult {
  const distances: Record<string, number> = {}
  const previous: Record<string, string | null> = {}
  const visited = new Set<string>()
  const unvisited = new Set<string>(Object.keys(graph))

  for (const node of Object.keys(graph)) {
    distances[node] = node === start ? 0 : Number.POSITIVE_INFINITY
    previous[node] = null
  }

  while (unvisited.size > 0) {
    let current: string | null = null
    let currentDistance = Number.POSITIVE_INFINITY

    for (const node of unvisited) {
      const distance = distances[node]
      if (distance < currentDistance) {
        current = node
        currentDistance = distance
      }
    }

    if (current === null) break
    if (current === target) break

    unvisited.delete(current)
    visited.add(current)

    const neighbors = graph[current] ?? {}
    for (const [neighbor, weight] of Object.entries(neighbors)) {
      if (!unvisited.has(neighbor) && !visited.has(neighbor)) continue

      const nextDistance = currentDistance + weight
      if (nextDistance < (distances[neighbor] ?? Number.POSITIVE_INFINITY)) {
        distances[neighbor] = nextDistance
        previous[neighbor] = current
      }
    }
  }

  if (!Object.prototype.hasOwnProperty.call(distances, target) || distances[target] === Number.POSITIVE_INFINITY) {
    return { path: [], distance: Number.POSITIVE_INFINITY }
  }

  const path: string[] = []
  let cursor: string | null = target
  while (cursor) {
    path.unshift(cursor)
    cursor = previous[cursor] ?? null
  }

  return {
    path,
    distance: distances[target],
  }
}
