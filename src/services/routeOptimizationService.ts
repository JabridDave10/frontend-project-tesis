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
    
    // Filtrar conductores disponibles (si no hay disponibles, usar todos)
    let availableDrivers = drivers.filter(d => d.status === 'disponible')
    if (availableDrivers.length === 0 && drivers.length > 0) {
      availableDrivers = drivers // Usar todos los conductores si no hay disponibles
    }

    // Filtrar vehículos disponibles (más flexible: activos, con o sin conductor)
    const availableVehiclesFiltered = availableVehicles.filter(
      v => v.status === 'activo'
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

      // Buscar el mejor vehículo para esta carga considerando:
      // 1. Capacidad disponible
      // 2. Rutas existentes para distribuir mejor
      const suitableVehicles = availableVehiclesFiltered
        .map(vehicle => {
          // Verificar capacidad de peso
          if (cargo.weight > vehicle.weight_capacity) return null

          // Verificar capacidad de volumen si aplica
          if (cargo.volume && vehicle.volume_capacity && cargo.volume > vehicle.volume_capacity) {
            return null
          }

          // Verificar tipo de vehículo apropiado (lógica más flexible)
          let isSuitable = false
          if (cargo.weight <= vehicle.weight_capacity) {
            // Cargas muy pequeñas pueden ir en motos
            if (cargo.weight < 50 && vehicle.vehicle_type === 'moto') isSuitable = true
            // Cargas medianas pueden ir en carros o furgonetas
            else if (cargo.weight < 500 && ['carro', 'furgoneta'].includes(vehicle.vehicle_type)) {
              isSuitable = true
            }
            // Cargas grandes requieren camiones
            else if (cargo.weight >= 50 && ['camion', 'camion_articulado'].includes(vehicle.vehicle_type)) {
              isSuitable = true
            }
            // Si no cumple ninguna condición específica pero tiene capacidad, permitirlo
            else isSuitable = true
          }

          if (!isSuitable) return null

          // Buscar ruta existente para este vehículo
          const existingRoute = optimizedRoutes.find(
            r => r.id_vehicle === vehicle.id_vehicle && r.status === 'pendiente'
          )

          // Calcular capacidad disponible
          const usedWeight = existingRoute?.total_weight || 0
          const usedVolume = existingRoute?.total_volume || 0
          const availableWeight = vehicle.weight_capacity - usedWeight
          const availableVolume = vehicle.volume_capacity 
            ? vehicle.volume_capacity - usedVolume 
            : Infinity

          // Verificar que la carga cabe
          if (cargo.weight > availableWeight || (cargo.volume && cargo.volume > availableVolume)) {
            return null
          }

          return {
            vehicle,
            existingRoute,
            availableWeight,
            availableVolume,
            utilization: usedWeight / vehicle.weight_capacity // Porcentaje de uso
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

      if (suitableVehicles.length === 0) {
        console.log(`No se encontró vehículo adecuado para carga ${cargo.id_cargo} (peso: ${cargo.weight} kg)`)
        continue
      }

      // Seleccionar el mejor vehículo:
      // 1. Preferir vehículos con rutas existentes que tengan espacio
      // 2. Si hay múltiples opciones, elegir el que tenga menor utilización (distribuir mejor)
      // 3. Si no hay rutas existentes, crear una nueva en el vehículo menos utilizado
      suitableVehicles.sort((a, b) => {
        // Priorizar vehículos con rutas existentes
        if (a.existingRoute && !b.existingRoute) return -1
        if (!a.existingRoute && b.existingRoute) return 1
        
        // Si ambos tienen o no tienen ruta, priorizar menor utilización
        return a.utilization - b.utilization
      })

      const selected = suitableVehicles[0]
      const suitableVehicle = selected.vehicle
      let existingRoute = selected.existingRoute

      // Buscar conductor disponible (opcional - si no hay, crear ruta sin conductor)
      let availableDriver = availableDrivers.find(d => d.status === 'disponible')
      if (!availableDriver && availableDrivers.length > 0) {
        availableDriver = availableDrivers[0] // Usar el primero disponible
      }
      
      // Si no hay conductor, usar un conductor temporal (opcional)
      // Por ahora permitimos crear rutas sin conductor asignado
      const driverId = availableDriver ? availableDriver.id_driver : 0 // 0 indica sin conductor
      const driverInfo = availableDriver ? {
        id_driver: availableDriver.id_driver,
        first_name: availableDriver.first_name || 'Sin',
        last_name: availableDriver.last_name || 'Conductor',
        phone: availableDriver.phone
      } : {
        id_driver: 0,
        first_name: 'Sin',
        last_name: 'Conductor',
        phone: undefined
      }

      // Crear nueva ruta si no existe
      if (!existingRoute) {
        existingRoute = {
          route_code: `ROUTE-${Date.now()}-${optimizedRoutes.length + 1}`,
          id_vehicle: suitableVehicle.id_vehicle,
          id_driver: driverId, // Puede ser 0 si no hay conductor
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
        console.log(`Nueva ruta creada para vehículo ${suitableVehicle.license_plate}`)
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
        driver: driverInfo,
        route_order: existingRoute.assignments.length + 1
      })

      existingRoute.total_weight += cargo.weight
      existingRoute.total_volume = (existingRoute.total_volume || 0) + (cargo.volume || 0)
      assignedCargos.add(cargo.id_cargo)
      console.log(`Carga ${cargo.id_cargo} asignada a vehículo ${suitableVehicle.license_plate} (ruta: ${existingRoute.route_code})`)
    }

    console.log(`Total de rutas creadas antes de optimizar: ${optimizedRoutes.length}`)
    console.log(`Cargos asignados: ${assignedCargos.size} de ${sortedCargos.length}`)

    // Optimizar orden de paradas para cada ruta
    for (const route of optimizedRoutes) {
      await this.optimizeRouteOrder(route, origin)
    }

    console.log(`Total de rutas optimizadas: ${optimizedRoutes.length}`)
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

        if (routeInfo && routeInfo.coordinates && routeInfo.coordinates.length > 0) {
          totalDistance += routeInfo.distance
          totalDuration += routeInfo.duration
          // Agregar coordenadas de la ruta (sin el primer punto que es el origen)
          // y sin el último punto que es el destino (lo agregamos después)
          const routeCoords = routeInfo.coordinates.slice(1, -1)
          if (routeCoords.length > 0) {
            routeCoordinates.push(...routeCoords)
          }
        } else {
          // Si no hay ruta calculada, usar línea recta como fallback
          const prevLat = optimizedOrder[i - 1].lat
          const prevLng = optimizedOrder[i - 1].lng
          if (prevLat && prevLng && point.lat && point.lng) {
            // Agregar punto intermedio para la línea recta
            const midLat = (prevLat + point.lat) / 2
            const midLng = (prevLng + point.lng) / 2
            routeCoordinates.push([midLat, midLng])
          }
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

