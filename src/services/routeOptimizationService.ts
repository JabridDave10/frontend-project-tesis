import { Cargo, CargoAssignment, OptimizedRoute } from '@/types/cargoTypes'
import { Vehicle } from '@/types/vehicleTypes'
import { Driver } from '@/types/driverTypes'

interface OSRMRouteResponse {
  code: string
  routes: Array<{
    geometry: {
      coordinates: [number, number][]
    }
    distance: number // en metros
    duration: number // en segundos
  }>
}

interface DistanceMatrix {
  [key: string]: {
    distance: number // en km
    duration: number // en minutos
    coordinates: [number, number][]
  }
}

export class RouteOptimizationService {
  /**
   * Calcula la distancia y duración entre dos puntos usando OSRM
   */
  private async calculateRoute(
    origin: [number, number],
    destination: [number, number]
  ): Promise<{ distance: number; duration: number; coordinates: [number, number][] } | null> {
    try {
      // Formato: lon,lat (OSRM usa longitud primero)
      const coordinates = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`
      const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`

      const response = await fetch(url)
      const data: OSRMRouteResponse = await response.json()

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0]
        // Convertir coordenadas de [lon, lat] a [lat, lon] para Leaflet
        const coordinates = route.geometry.coordinates.map(
          ([lon, lat]) => [lat, lon] as [number, number]
        )

        return {
          distance: route.distance / 1000, // Convertir a km
          duration: route.duration / 60, // Convertir a minutos
          coordinates
        }
      }
      return null
    } catch (error) {
      console.error('Error al calcular ruta:', error)
      return null
    }
  }

  /**
   * Calcula matriz de distancias entre múltiples puntos
   */
  private async calculateDistanceMatrix(
    points: Array<{ lat: number; lng: number; id: string }>
  ): Promise<DistanceMatrix> {
    const matrix: DistanceMatrix = {}

    // Calcular distancia entre todos los pares de puntos
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const origin: [number, number] = [points[i].lat, points[i].lng]
        const destination: [number, number] = [points[j].lat, points[j].lng]

        const route = await this.calculateRoute(origin, destination)
        if (route) {
          const key1 = `${points[i].id}-${points[j].id}`
          const key2 = `${points[j].id}-${points[i].id}`
          matrix[key1] = route
          matrix[key2] = route // La distancia es simétrica
        }

        // Pequeño delay para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return matrix
  }

  /**
   * Algoritmo de asignación de cargas a vehículos
   * Optimiza la asignación considerando capacidad, tipo de vehículo y proximidad
   */
  async assignCargosToVehicles(
    cargos: Cargo[],
    vehicles: Vehicle[],
    drivers: Driver[],
    origin: { lat: number; lng: number; address: string }
  ): Promise<OptimizedRoute[]> {
    const optimizedRoutes: OptimizedRoute[] = []
    const assignedCargos = new Set<number>()
    const availableVehicles = [...vehicles]
    const availableDrivers = drivers.filter(d => d.status === 'disponible')

    // Filtrar vehículos disponibles
    const availableVehiclesFiltered = availableVehicles.filter(
      v => v.status === 'activo' && !v.id_driver
    )

    // Ordenar cargas por prioridad y peso
    const sortedCargos = [...cargos]
      .filter(c => c.status === 'pendiente')
      .sort((a, b) => {
        const priorityOrder = { urgente: 4, alta: 3, media: 2, baja: 1 }
        const aPriority = priorityOrder[a.priority || 'media'] || 2
        const bPriority = priorityOrder[b.priority || 'media'] || 2
        if (aPriority !== bPriority) return bPriority - aPriority
        return b.weight - a.weight // Cargas más pesadas primero
      })

    // Asignar cargas a vehículos
    for (const cargo of sortedCargos) {
      if (assignedCargos.has(cargo.id_cargo)) continue

      // Buscar vehículo adecuado
      const suitableVehicle = availableVehiclesFiltered.find(vehicle => {
        // Verificar capacidad de peso
        if (cargo.weight > vehicle.weight_capacity) return false

        // Verificar capacidad de volumen si aplica
        if (cargo.volume && vehicle.volume_capacity && cargo.volume > vehicle.volume_capacity) {
          return false
        }

        // Verificar tipo de vehículo apropiado
        // Cargas pequeñas pueden ir en motos, cargas grandes requieren camiones
        if (cargo.weight < 50 && vehicle.vehicle_type === 'moto') return true
        if (cargo.weight >= 50 && ['camion', 'camion_articulado'].includes(vehicle.vehicle_type)) {
          return true
        }
        if (cargo.weight < 500 && ['carro', 'furgoneta'].includes(vehicle.vehicle_type)) {
          return true
        }

        return false
      })

      if (!suitableVehicle) continue

      // Buscar conductor disponible
      const availableDriver = availableDrivers.find(d => d.status === 'disponible')
      if (!availableDriver) continue

      // Crear o agregar a ruta existente
      let existingRoute = optimizedRoutes.find(
        r => r.id_vehicle === suitableVehicle.id_vehicle && r.status === 'pendiente'
      )

      if (!existingRoute) {
        // Crear nueva ruta
        existingRoute = {
          route_code: `ROUTE-${Date.now()}-${optimizedRoutes.length + 1}`,
          id_vehicle: suitableVehicle.id_vehicle,
          id_driver: availableDriver.id_driver,
          origin_address: origin.address,
          origin_latitude: origin.lat,
          origin_longitude: origin.lng,
          assignments: [],
          route_coordinates: [],
          total_distance: 0,
          total_duration: 0,
          total_weight: 0,
          total_volume: 0,
          status: 'pendiente'
        }
        optimizedRoutes.push(existingRoute)
      }

      // Verificar que la carga cabe en la ruta
      const newTotalWeight = existingRoute.total_weight + cargo.weight
      const newTotalVolume = (existingRoute.total_volume || 0) + (cargo.volume || 0)

      if (
        newTotalWeight > suitableVehicle.weight_capacity ||
        (suitableVehicle.volume_capacity && newTotalVolume > suitableVehicle.volume_capacity)
      ) {
        continue // No cabe, buscar otro vehículo
      }

      // Agregar carga a la ruta
      existingRoute.assignments.push({
        cargo,
        vehicle: {
          id_vehicle: suitableVehicle.id_vehicle,
          license_plate: suitableVehicle.license_plate,
          vehicle_type: suitableVehicle.vehicle_type,
          weight_capacity: suitableVehicle.weight_capacity,
          volume_capacity: suitableVehicle.volume_capacity
        },
        driver: {
          id_driver: availableDriver.id_driver,
          first_name: availableDriver.first_name || '',
          last_name: availableDriver.last_name || '',
          phone: availableDriver.phone
        },
        route_order: existingRoute.assignments.length + 1
      })

      existingRoute.total_weight = newTotalWeight
      existingRoute.total_volume = newTotalVolume
      assignedCargos.add(cargo.id_cargo)
    }

    // Optimizar orden de paradas para cada ruta
    for (const route of optimizedRoutes) {
      await this.optimizeRouteOrder(route, origin)
    }

    return optimizedRoutes
  }

  /**
   * Optimiza el orden de las paradas en una ruta usando algoritmo Nearest Neighbor mejorado
   */
  private async optimizeRouteOrder(
    route: OptimizedRoute,
    origin: { lat: number; lng: number; address: string }
  ) {
    if (route.assignments.length === 0) return

    // Preparar puntos para calcular matriz de distancias
    const points = [
      { lat: origin.lat, lng: origin.lng, id: 'origin', cargo: null },
      ...route.assignments.map((assignment, index) => ({
        lat: assignment.cargo.destination_latitude || 0,
        lng: assignment.cargo.destination_longitude || 0,
        id: `cargo-${assignment.cargo.id_cargo}`,
        cargo: assignment.cargo,
        assignmentIndex: index
      }))
    ]

    // Filtrar puntos sin coordenadas
    const validPoints = points.filter(p => p.lat !== 0 && p.lng !== 0)
    if (validPoints.length <= 1) return

    // Calcular matriz de distancias
    const distanceMatrix = await this.calculateDistanceMatrix(validPoints)

    // Algoritmo Nearest Neighbor mejorado
    const visited = new Set<string>()
    const optimizedOrder: typeof validPoints = []
    let currentPoint = validPoints[0] // Empezar desde el origen
    visited.add(currentPoint.id)
    optimizedOrder.push(currentPoint)

    while (visited.size < validPoints.length) {
      let nearestPoint: typeof validPoints[0] | null = null
      let nearestDistance = Infinity

      for (const point of validPoints) {
        if (visited.has(point.id)) continue

        const key = `${currentPoint.id}-${point.id}`
        const distance = distanceMatrix[key]?.distance || Infinity

        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestPoint = point
        }
      }

      if (nearestPoint) {
        visited.add(nearestPoint.id)
        optimizedOrder.push(nearestPoint)
        currentPoint = nearestPoint
      } else {
        break
      }
    }

    // Reordenar assignments según el orden optimizado
    const optimizedAssignments: CargoAssignment[] = []
    let totalDistance = 0
    let totalDuration = 0
    const routeCoordinates: [number, number][] = []

    // Agregar origen
    routeCoordinates.push([origin.lat, origin.lng])

    for (let i = 1; i < optimizedOrder.length; i++) {
      const point = optimizedOrder[i]
      const assignment = route.assignments.find(
        a => a.cargo.id_cargo === point.cargo?.id_cargo
      )

      if (assignment) {
        assignment.route_order = i
        optimizedAssignments.push(assignment)

        // Calcular distancia desde el punto anterior
        const prevPoint = optimizedOrder[i - 1]
        const key = `${prevPoint.id}-${point.id}`
        const routeInfo = distanceMatrix[key]

        if (routeInfo) {
          totalDistance += routeInfo.distance
          totalDuration += routeInfo.duration
          // Agregar coordenadas de la ruta (sin el origen que ya está)
          routeCoordinates.push(...routeInfo.coordinates.slice(1))
        }

        // Agregar coordenadas del destino
        if (point.lat && point.lng) {
          routeCoordinates.push([point.lat, point.lng])
        }
      }
    }

    // Actualizar ruta
    route.assignments = optimizedAssignments
    route.total_distance = totalDistance
    route.total_duration = totalDuration
    route.route_coordinates = routeCoordinates
  }

  /**
   * Calcula ruta completa con múltiples paradas
   */
  async calculateMultiStopRoute(
    origin: [number, number],
    stops: Array<{ lat: number; lng: number }>
  ): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> {
    if (stops.length === 0) return null

    try {
      // Construir URL para ruta con múltiples paradas
      // Formato OSRM: lon1,lat1;lon2,lat2;lon3,lat3...
      const waypoints = [
        `${origin[1]},${origin[0]}`,
        ...stops.map(stop => `${stop.lng},${stop.lat}`)
      ].join(';')

      const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`

      const response = await fetch(url)
      const data: OSRMRouteResponse = await response.json()

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0]
        // Convertir coordenadas de [lon, lat] a [lat, lon] para Leaflet
        const coordinates = route.geometry.coordinates.map(
          ([lon, lat]) => [lat, lon] as [number, number]
        )

        return {
          coordinates,
          distance: route.distance / 1000, // Convertir a km
          duration: route.duration / 60 // Convertir a minutos
        }
      }
      return null
    } catch (error) {
      console.error('Error al calcular ruta con múltiples paradas:', error)
      return null
    }
  }
}

