# Algoritmo de Optimización de Rutas y Seguimiento GPS

## 📋 Resumen

Este documento describe la implementación del algoritmo de optimización de rutas y seguimiento GPS en tiempo real para el sistema de gestión de flota.

## 🎯 Funcionalidades Implementadas

### 1. **Algoritmo de Optimización de Rutas**

#### A. Asignación de Cargas a Vehículos
- **Ubicación**: `src/services/routeOptimizationService.ts`
- **Método**: `assignCargosToVehicles()`

**Características:**
- Asigna cargas a vehículos considerando:
  - Capacidad de peso y volumen
  - Tipo de vehículo apropiado (motos para cargas pequeñas, camiones para cargas grandes)
  - Prioridad de las cargas (urgente, alta, media, baja)
- Agrupa múltiples cargas en una sola ruta cuando es posible
- Optimiza el uso de la capacidad de los vehículos

**Algoritmo:**
1. Ordena cargas por prioridad y peso
2. Para cada carga, busca el vehículo más adecuado
3. Verifica disponibilidad de conductor
4. Agrupa cargas en rutas cuando la capacidad lo permite

#### B. Optimización de Orden de Paradas
- **Método**: `optimizeRouteOrder()`

**Características:**
- Usa algoritmo **Nearest Neighbor** mejorado
- Calcula matriz de distancias usando OSRM
- Optimiza el orden de las paradas para minimizar distancia y tiempo
- Considera el origen como punto de partida

**Algoritmo:**
1. Calcula matriz de distancias entre todos los puntos
2. Aplica Nearest Neighbor empezando desde el origen
3. Selecciona la parada más cercana en cada iteración
4. Construye la ruta optimizada con coordenadas reales

#### C. Cálculo de Rutas con OSRM
- **Método**: `calculateRoute()`, `calculateMultiStopRoute()`

**Características:**
- Usa Open Source Routing Machine (OSRM) para rutas reales
- Convierte coordenadas de [lon, lat] a [lat, lon] para Leaflet
- Calcula distancia en km y duración en minutos
- Obtiene coordenadas de la ruta que sigue las carreteras

### 2. **Seguimiento GPS en Tiempo Real**

#### A. Servicio de Seguimiento GPS
- **Ubicación**: `src/services/gpsTrackingService.ts`
- **Clase**: `GPSTrackingService`

**Características:**
- Conexión WebSocket para actualizaciones en tiempo real
- Reconexión automática en caso de desconexión
- Suscripción a vehículos específicos
- Cálculo de progreso de ruta
- Envío de posiciones GPS (desde app móvil)

**Métodos principales:**
- `connect()`: Conecta al WebSocket
- `sendPosition()`: Envía posición GPS
- `subscribeToVehicle()`: Suscribe a un vehículo específico
- `calculateRouteProgress()`: Calcula progreso de ruta

#### B. Hook de Seguimiento GPS
- **Ubicación**: `src/hooks/useGPSTracking.ts`
- **Hook**: `useGPSTracking()`

**Características:**
- Maneja estado de conexión WebSocket
- Actualiza posición actual del vehículo
- Calcula progreso de ruta
- Maneja errores de conexión

### 3. **Visualización en el Mapa**

#### A. Mapa de Rutas Optimizadas
- **Ubicación**: `src/components/map/OptimizedRouteMap.tsx`
- **Componente**: `OptimizedRouteMap`

**Características:**
- Muestra múltiples rutas con diferentes colores
- Marcadores para origen y paradas
- Líneas de ruta que siguen las carreteras
- Panel de información de rutas
- Ajuste automático del zoom a todas las rutas
- Soporte para seguimiento en tiempo real de vehículos

#### B. Componente de Demostración
- **Ubicación**: `src/components/route-optimization/RouteOptimizationDemo.tsx`
- **Componente**: `RouteOptimizationDemo`

**Características:**
- Carga cargas pendientes, vehículos y conductores disponibles
- Botón para optimizar rutas
- Muestra estadísticas y rutas optimizadas
- Integra el mapa de rutas optimizadas

## 📁 Estructura de Archivos

```
src/
├── types/
│   └── cargoTypes.ts              # Tipos para cargas y rutas optimizadas
├── services/
│   ├── routeOptimizationService.ts  # Servicio de optimización
│   ├── gpsTrackingService.ts       # Servicio de seguimiento GPS
│   └── cargoService.ts              # Servicio CRUD de cargas
├── hooks/
│   ├── useRouteOptimization.ts     # Hook para optimización
│   └── useGPSTracking.ts           # Hook para seguimiento GPS
└── components/
    ├── map/
    │   └── OptimizedRouteMap.tsx   # Mapa de rutas optimizadas
    └── route-optimization/
        └── RouteOptimizationDemo.tsx  # Componente de demostración
```

## 🔧 Uso

### 1. Optimizar Rutas

```typescript
import { useRouteOptimization } from '@/hooks/useRouteOptimization'

const { optimizeRoutes, isOptimizing, optimizedRoutes } = useRouteOptimization()

// Optimizar rutas
const routes = await optimizeRoutes(
  cargos,      // Array de Cargo
  vehicles,    // Array de Vehicle
  drivers,     // Array de Driver
  origin       // { lat, lng, address }
)
```

### 2. Seguimiento GPS

```typescript
import { useGPSTracking } from '@/hooks/useGPSTracking'

const { currentPosition, isConnected, calculateProgress } = useGPSTracking(vehicleId)

// Calcular progreso
const progress = calculateProgress(routeCoordinates)
```

### 3. Visualizar Rutas en el Mapa

```typescript
import OptimizedRouteMap from '@/components/map/OptimizedRouteMap'

<OptimizedRouteMap
  routes={optimizedRoutes}
  vehiclePositions={vehiclePositionsMap}
  showVehicleTracking={true}
/>
```

## 🚀 Próximos Pasos

### Backend (NestJS)
1. **WebSocket Gateway** para recibir y transmitir posiciones GPS
2. **Endpoint de optimización** que use el algoritmo del frontend o uno más avanzado
3. **Integración con Redis** para almacenar posiciones temporalmente
4. **Endpoints CRUD** para cargas
5. **Transacciones** para creación de rutas, inicio de ruta, entrega de carga

### Frontend
1. **Integración completa** con el backend
2. **Interfaz de usuario** para crear y gestionar cargas
3. **Visualización de vehículos en tiempo real** en el mapa
4. **Notificaciones** de actualizaciones de rutas
5. **Historial de rutas** y estadísticas

## 📊 Algoritmos Utilizados

### 1. Asignación de Cargas
- **Tipo**: Algoritmo voraz (Greedy)
- **Complejidad**: O(n * m) donde n = cargas, m = vehículos
- **Optimización**: Considera capacidad, tipo de vehículo y prioridad

### 2. Optimización de Orden
- **Tipo**: Nearest Neighbor (Vecino más cercano)
- **Complejidad**: O(n²) donde n = número de paradas
- **Optimización**: Minimiza distancia total usando OSRM

### 3. Cálculo de Rutas
- **Servicio**: OSRM (Open Source Routing Machine)
- **Tipo**: Algoritmo de Dijkstra modificado
- **Resultado**: Ruta real que sigue las carreteras

## 🔐 Consideraciones de Seguridad

1. **Validación de datos** antes de optimizar
2. **Límites de rate** para llamadas a OSRM
3. **Autenticación** para WebSocket
4. **Validación de permisos** para acceder a rutas

## 📝 Notas

- El algoritmo actual es una versión básica. Para producción, considera algoritmos más avanzados como:
  - **2-opt** para mejorar el orden de paradas
  - **Simulated Annealing** para optimización global
  - **Genetic Algorithms** para problemas complejos
- OSRM es un servicio público. Para producción, considera usar tu propia instancia de OSRM.
- El seguimiento GPS requiere un backend con WebSocket implementado.

