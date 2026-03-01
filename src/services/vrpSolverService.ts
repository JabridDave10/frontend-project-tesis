import {
  DeliveryPoint,
  DistanceMatrixResult,
  VRPAlgorithm,
  VRPConfig,
  VehicleDriverPair,
  VRPRoute,
  VRPRouteStop,
  VRPResult,
} from '@/types/vrpTypes'

interface OSRMTableResponse {
  code: string
  distances: number[][] // metros
  durations: number[][] // segundos
}

interface OSRMRouteResponse {
  code: string
  routes: Array<{
    geometry: { coordinates: [number, number][] }
    distance: number
    duration: number
  }>
}

export class VRPSolverService {

  // ==================== PUBLIC API ====================

  async solve(
    depot: { lat: number; lng: number; address: string },
    deliveryPoints: DeliveryPoint[],
    vehicleDriverPairs: VehicleDriverPair[],
    config: VRPConfig,
    onProgress?: (msg: string) => void
  ): Promise<VRPResult> {
    const start = performance.now()
    const warnings: string[] = []

    if (deliveryPoints.length === 0) {
      return {
        routes: [], unassigned_points: [], algorithm_used: config.algorithm,
        applied_2opt: false, total_distance: 0, total_duration: 0,
        computation_time_ms: 0, warnings: ['No hay puntos de entrega.'],
      }
    }

    // 1. Distance matrix
    onProgress?.('Calculando matriz de distancias... (1/3)')
    const matrix = await this.computeDistanceMatrix(depot, deliveryPoints)

    // 2. Solve with chosen algorithm
    onProgress?.('Ejecutando algoritmo de optimizacion... (2/3)')

    // Max capacities for route building (use largest vehicle as reference)
    const maxWeight = vehicleDriverPairs.length > 0
      ? Math.max(...vehicleDriverPairs.map(p => p.vehicle.weight_capacity))
      : Infinity
    const maxVolume = config.respectVolumeCapacity && vehicleDriverPairs.length > 0
      ? Math.max(...vehicleDriverPairs.map(p => p.vehicle.volume_capacity || Infinity))
      : Infinity

    let clusters: number[][]
    switch (config.algorithm) {
      case 'clarke-wright':
        clusters = this.solveClarkeWright(matrix, deliveryPoints, maxWeight, maxVolume, config.maxStopsPerRoute)
        break
      case 'sweep':
        clusters = this.solveSweep(depot, deliveryPoints, maxWeight, maxVolume, config.maxStopsPerRoute)
        break
      case 'nearest-neighbor':
      default:
        clusters = this.solveNearestNeighbor(matrix, deliveryPoints, maxWeight, maxVolume, config.maxStopsPerRoute)
        break
    }

    // 3. Apply 2-opt if requested
    if (config.apply2Opt) {
      clusters = clusters.map(route => this.improve2Opt(route, matrix))
    }

    // 4. Assign vehicle-driver pairs (FFD)
    const { assigned, unassignedIndices } = this.assignVehicleDriverPairs(
      clusters, deliveryPoints, vehicleDriverPairs, config.respectVolumeCapacity
    )

    if (unassignedIndices.length > 0) {
      warnings.push(`${unassignedIndices.length} punto(s) no pudieron ser asignados a vehiculos disponibles.`)
    }

    // 5. Fetch route geometries
    onProgress?.('Obteniendo geometria de rutas... (3/3)')
    const routes: VRPRoute[] = []

    for (const a of assigned) {
      const stops: VRPRouteStop[] = a.pointIndices.map((pi, seq) => ({
        delivery_point: deliveryPoints[pi],
        sequence: seq + 1,
        arrival_distance: matrix.distances[0][pi + 1], // from depot
        arrival_duration: matrix.durations[0][pi + 1],
      }))

      const totalWeight = stops.reduce((s, st) => s + st.delivery_point.total_weight, 0)
      const totalVolume = stops.reduce((s, st) => s + st.delivery_point.total_volume, 0)

      const geo = await this.fetchRouteGeometry(
        depot,
        stops.map(s => ({
          lat: s.delivery_point.latitude,
          lng: s.delivery_point.longitude,
        }))
      )

      // Recalculate cumulative distances from geometry
      let cumDist = 0
      let cumDur = 0
      for (let i = 0; i < stops.length; i++) {
        const fromIdx = i === 0 ? 0 : a.pointIndices[i - 1] + 1
        const toIdx = a.pointIndices[i] + 1
        cumDist += matrix.distances[fromIdx][toIdx]
        cumDur += matrix.durations[fromIdx][toIdx]
        stops[i].arrival_distance = Math.round(cumDist * 100) / 100
        stops[i].arrival_duration = Math.round(cumDur * 100) / 100
      }

      const vehicleCap = a.pair?.vehicle.weight_capacity ?? 1
      const volumeCap = a.pair?.vehicle.volume_capacity ?? 1

      routes.push({
        route_code: `VRP-${Date.now()}-${routes.length + 1}`,
        vehicle: a.pair?.vehicle ?? null,
        driver: a.pair?.driver ?? null,
        stops,
        route_coordinates: geo?.coordinates ?? [],
        total_distance: geo?.distance ?? cumDist,
        total_duration: geo?.duration ?? cumDur,
        total_weight: totalWeight,
        total_volume: totalVolume,
        weight_utilization: vehicleCap > 0 ? Math.round((totalWeight / vehicleCap) * 100) : 0,
        volume_utilization: volumeCap > 0 ? Math.round((totalVolume / volumeCap) * 100) : 0,
      })

      // Small delay to avoid OSRM rate limiting
      await new Promise(r => setTimeout(r, 200))
    }

    const unassigned = unassignedIndices.map(i => deliveryPoints[i])

    const elapsed = performance.now() - start
    return {
      routes,
      unassigned_points: unassigned,
      algorithm_used: config.algorithm,
      applied_2opt: config.apply2Opt,
      total_distance: routes.reduce((s, r) => s + r.total_distance, 0),
      total_duration: routes.reduce((s, r) => s + r.total_duration, 0),
      computation_time_ms: Math.round(elapsed),
      warnings,
    }
  }

  // ==================== DISTANCE MATRIX (OSRM /table) ====================

  private async computeDistanceMatrix(
    depot: { lat: number; lng: number },
    points: DeliveryPoint[]
  ): Promise<DistanceMatrixResult> {
    // index 0 = depot, 1..N = delivery points
    const coords = [
      `${depot.lng},${depot.lat}`,
      ...points.map(p => `${p.longitude},${p.latitude}`),
    ].join(';')

    try {
      const url = `https://router.project-osrm.org/table/v1/driving/${coords}?annotations=distance,duration`
      const res = await fetch(url)
      const data: OSRMTableResponse = await res.json()

      if (data.code === 'Ok') {
        return {
          distances: data.distances.map(row => row.map(d => d / 1000)),   // m → km
          durations: data.durations.map(row => row.map(d => d / 60)),     // s → min
        }
      }
    } catch (err) {
      console.error('OSRM Table API error, falling back to haversine:', err)
    }

    // Fallback: haversine-based matrix
    return this.buildHaversineMatrix(depot, points)
  }

  private buildHaversineMatrix(
    depot: { lat: number; lng: number },
    points: DeliveryPoint[]
  ): DistanceMatrixResult {
    const allLats = [depot.lat, ...points.map(p => p.latitude)]
    const allLngs = [depot.lng, ...points.map(p => p.longitude)]
    const n = allLats.length

    const distances: number[][] = Array.from({ length: n }, () => Array(n).fill(0))
    const durations: number[][] = Array.from({ length: n }, () => Array(n).fill(0))

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const d = this.haversine(allLats[i], allLngs[i], allLats[j], allLngs[j])
        distances[i][j] = d
        distances[j][i] = d
        // Estimate ~40 km/h average speed
        const t = (d / 40) * 60
        durations[i][j] = t
        durations[j][i] = t
      }
    }
    return { distances, durations }
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  // ==================== CLARKE-WRIGHT SAVINGS ====================

  private solveClarkeWright(
    matrix: DistanceMatrixResult,
    points: DeliveryPoint[],
    maxWeight: number,
    maxVolume: number,
    maxStops: number
  ): number[][] {
    const n = points.length
    const dist = matrix.distances

    // 1. One route per point
    const routes: Map<number, number[]> = new Map()
    for (let i = 0; i < n; i++) routes.set(i, [i])

    // Which route does point i belong to?
    const routeOf = new Array(n)
    for (let i = 0; i < n; i++) routeOf[i] = i

    // 2. Calculate savings: s(i,j) = dist(depot,i) + dist(depot,j) - dist(i,j)
    // Depot is index 0 in the matrix, points are 1..n
    const savings: { i: number; j: number; saving: number }[] = []
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const s = dist[0][i + 1] + dist[0][j + 1] - dist[i + 1][j + 1]
        if (s > 0) savings.push({ i, j, saving: s })
      }
    }

    // 3. Sort descending
    savings.sort((a, b) => b.saving - a.saving)

    // Helper: route weight/volume
    const routeWeight = (r: number[]): number =>
      r.reduce((s, idx) => s + points[idx].total_weight, 0)
    const routeVolume = (r: number[]): number =>
      r.reduce((s, idx) => s + points[idx].total_volume, 0)

    // 4. Merge
    for (const { i, j } of savings) {
      const rA = routeOf[i]
      const rB = routeOf[j]
      if (rA === rB) continue // same route

      const routeA = routes.get(rA)
      const routeB = routes.get(rB)
      if (!routeA || !routeB) continue

      // Check: i must be at the end of routeA and j at the start of routeB (or vice versa)
      const iAtEndA = routeA[routeA.length - 1] === i
      const jAtStartB = routeB[0] === j
      const jAtEndA = routeA[routeA.length - 1] === j
      const iAtStartB = routeB[0] === i

      let merged: number[] | null = null
      if (iAtEndA && jAtStartB) {
        merged = [...routeA, ...routeB]
      } else if (jAtEndA && iAtStartB) {
        merged = [...routeA, ...routeB]
      } else if (iAtEndA && routeB[routeB.length - 1] === j) {
        merged = [...routeA, ...routeB.reverse()]
      } else if (routeA[0] === i && jAtStartB) {
        merged = [...routeA.reverse(), ...routeB]
      } else {
        continue
      }

      // Check constraints
      const combinedWeight = routeWeight(routeA) + routeWeight(routeB)
      const combinedVolume = routeVolume(routeA) + routeVolume(routeB)
      if (combinedWeight > maxWeight) continue
      if (combinedVolume > maxVolume) continue
      if (merged.length > maxStops) continue

      // Apply merge
      routes.delete(rA)
      routes.delete(rB)
      const newId = rA
      routes.set(newId, merged)
      for (const idx of merged) routeOf[idx] = newId
    }

    return Array.from(routes.values())
  }

  // ==================== SWEEP ALGORITHM ====================

  private solveSweep(
    depot: { lat: number; lng: number },
    points: DeliveryPoint[],
    maxWeight: number,
    maxVolume: number,
    maxStops: number
  ): number[][] {
    // 1. Calculate polar angles
    const indexed = points.map((p, i) => ({
      index: i,
      angle: Math.atan2(p.latitude - depot.lat, p.longitude - depot.lng),
      weight: p.total_weight,
      volume: p.total_volume,
    }))

    // 2. Sort by angle
    indexed.sort((a, b) => a.angle - b.angle)

    // 3. Sweep
    const routes: number[][] = []
    let current: number[] = []
    let currentWeight = 0
    let currentVolume = 0

    for (const pt of indexed) {
      if (
        current.length > 0 &&
        (currentWeight + pt.weight > maxWeight ||
         currentVolume + pt.volume > maxVolume ||
         current.length >= maxStops)
      ) {
        routes.push(current)
        current = []
        currentWeight = 0
        currentVolume = 0
      }
      current.push(pt.index)
      currentWeight += pt.weight
      currentVolume += pt.volume
    }
    if (current.length > 0) routes.push(current)

    // 4. Within each cluster, order by nearest neighbor
    return routes.map(cluster => this.orderByNearest(cluster, points, depot))
  }

  private orderByNearest(cluster: number[], points: DeliveryPoint[], depot: { lat: number; lng: number }): number[] {
    if (cluster.length <= 1) return cluster

    const ordered: number[] = []
    const remaining = new Set(cluster)

    // Start from the point closest to depot
    let current = { lat: depot.lat, lng: depot.lng }
    while (remaining.size > 0) {
      let nearest = -1
      let nearestDist = Infinity
      for (const idx of remaining) {
        const d = this.haversine(current.lat, current.lng, points[idx].latitude, points[idx].longitude)
        if (d < nearestDist) {
          nearestDist = d
          nearest = idx
        }
      }
      if (nearest >= 0) {
        ordered.push(nearest)
        remaining.delete(nearest)
        current = { lat: points[nearest].latitude, lng: points[nearest].longitude }
      } else {
        break
      }
    }
    return ordered
  }

  // ==================== NEAREST NEIGHBOR ====================

  private solveNearestNeighbor(
    matrix: DistanceMatrixResult,
    points: DeliveryPoint[],
    maxWeight: number,
    maxVolume: number,
    maxStops: number
  ): number[][] {
    const n = points.length
    const dist = matrix.distances
    const visited = new Set<number>()
    const routes: number[][] = []

    while (visited.size < n) {
      const route: number[] = []
      let currentIdx = 0 // depot in matrix
      let routeWeight = 0
      let routeVolume = 0

      while (route.length < maxStops) {
        let nearest = -1
        let nearestDist = Infinity

        for (let i = 0; i < n; i++) {
          if (visited.has(i)) continue
          const d = dist[currentIdx][i + 1]
          if (d < nearestDist) {
            // Check capacity
            if (routeWeight + points[i].total_weight <= maxWeight &&
                routeVolume + points[i].total_volume <= maxVolume) {
              nearestDist = d
              nearest = i
            }
          }
        }

        if (nearest < 0) break

        route.push(nearest)
        visited.add(nearest)
        routeWeight += points[nearest].total_weight
        routeVolume += points[nearest].total_volume
        currentIdx = nearest + 1 // matrix index
      }

      if (route.length === 0) {
        // Remaining points exceed all capacity — add them individually
        for (let i = 0; i < n; i++) {
          if (!visited.has(i)) {
            routes.push([i])
            visited.add(i)
          }
        }
        break
      }

      routes.push(route)
    }

    return routes
  }

  // ==================== 2-OPT IMPROVEMENT ====================

  private improve2Opt(route: number[], matrix: DistanceMatrixResult): number[] {
    if (route.length < 3) return route

    const dist = matrix.distances
    let improved = true
    const r = [...route]

    // Cost helper: distance from depot through route back to depot
    const segDist = (from: number, to: number) => {
      // Matrix indices: depot=0, point i => i+1
      const fi = from === -1 ? 0 : from + 1
      const ti = to === -1 ? 0 : to + 1
      return dist[fi][ti]
    }

    while (improved) {
      improved = false
      for (let i = 0; i < r.length - 1; i++) {
        for (let j = i + 1; j < r.length; j++) {
          // Current edges
          const prevI = i === 0 ? -1 : r[i - 1]
          const nextJ = j === r.length - 1 ? -1 : r[j + 1]

          const oldCost = segDist(prevI, r[i]) + segDist(r[j], nextJ)
          const newCost = segDist(prevI, r[j]) + segDist(r[i], nextJ)

          if (newCost < oldCost - 0.001) {
            // Reverse segment [i..j]
            const segment = r.slice(i, j + 1).reverse()
            for (let k = 0; k < segment.length; k++) {
              r[i + k] = segment[k]
            }
            improved = true
          }
        }
      }
    }

    return r
  }

  // ==================== VEHICLE-DRIVER ASSIGNMENT (FFD) ====================

  private assignVehicleDriverPairs(
    routes: number[][],
    points: DeliveryPoint[],
    pairs: VehicleDriverPair[],
    respectVolume: boolean
  ): {
    assigned: { pointIndices: number[]; pair: VehicleDriverPair | null }[]
    unassignedIndices: number[]
  } {
    // Calculate route demands
    const routeDemands = routes.map(r => ({
      indices: r,
      weight: r.reduce((s, i) => s + points[i].total_weight, 0),
      volume: r.reduce((s, i) => s + points[i].total_volume, 0),
    }))

    // Sort routes by weight descending (FFD)
    const sortedRoutes = routeDemands
      .map((d, i) => ({ ...d, originalIndex: i }))
      .sort((a, b) => b.weight - a.weight)

    // Sort pairs by capacity descending
    const sortedPairs = pairs
      .map((p, i) => ({ ...p, originalIndex: i }))
      .sort((a, b) => b.vehicle.weight_capacity - a.vehicle.weight_capacity)

    const usedPairs = new Set<number>()
    const assigned: { pointIndices: number[]; pair: VehicleDriverPair | null }[] = []
    const unassignedPointSets: number[][] = []

    for (const route of sortedRoutes) {
      let found = false
      for (const pairEntry of sortedPairs) {
        if (usedPairs.has(pairEntry.originalIndex)) continue

        const fits = route.weight <= pairEntry.vehicle.weight_capacity &&
          (!respectVolume || route.volume <= (pairEntry.vehicle.volume_capacity || Infinity))

        if (fits) {
          assigned.push({ pointIndices: route.indices, pair: pairEntry })
          usedPairs.add(pairEntry.originalIndex)
          found = true
          break
        }
      }

      if (!found) {
        // If no pair available, still include route without vehicle (will show warning)
        if (pairs.length === 0) {
          assigned.push({ pointIndices: route.indices, pair: null })
        } else {
          unassignedPointSets.push(route.indices)
        }
      }
    }

    const unassignedIndices = unassignedPointSets.flat()
    return { assigned, unassignedIndices }
  }

  // ==================== ROUTE GEOMETRY (OSRM /route) ====================

  private async fetchRouteGeometry(
    depot: { lat: number; lng: number },
    stops: { lat: number; lng: number }[]
  ): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> {
    if (stops.length === 0) return null

    try {
      const waypoints = [
        `${depot.lng},${depot.lat}`,
        ...stops.map(s => `${s.lng},${s.lat}`),
      ].join(';')

      const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
      const res = await fetch(url)
      const data: OSRMRouteResponse = await res.json()

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates.map(
          ([lon, lat]) => [lat, lon] as [number, number]
        )
        return {
          coordinates,
          distance: route.distance / 1000,
          duration: route.duration / 60,
        }
      }
    } catch (err) {
      console.error('Error fetching route geometry:', err)
    }
    return null
  }
}

export const vrpSolverService = new VRPSolverService()
