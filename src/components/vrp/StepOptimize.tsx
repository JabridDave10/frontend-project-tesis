'use client'

import { useState, useEffect, useMemo } from 'react'
import { DeliveryPoint, VRPAlgorithm, VRPConfig, VehicleDriverPair } from '@/types/vrpTypes'
import { Vehicle, isDriverCompatible } from '@/types/vehicleTypes'
import { Driver } from '@/types/driverTypes'
import { VehiclesService } from '@/services/vehiclesService'
import { DriversService } from '@/services/driversService'
import {
  Cpu, ChevronLeft, Loader2, Zap, Target, Route,
  Truck, Users, AlertTriangle, Settings2, ToggleLeft, ToggleRight
} from 'lucide-react'

interface StepOptimizeProps {
  deliveryPoints: DeliveryPoint[]
  config: VRPConfig
  onConfigChange: (config: VRPConfig) => void
  onOptimize: (pairs: VehicleDriverPair[]) => void
  isOptimizing: boolean
  progressMessage: string
  onBack: () => void
}

interface AlgorithmOption {
  id: VRPAlgorithm
  name: string
  description: string
  badge?: string
  icon: typeof Cpu
}

const ALGORITHMS: AlgorithmOption[] = [
  {
    id: 'clarke-wright',
    name: 'Clarke-Wright Savings',
    description: 'Mejor calidad de solucion. Fusiona rutas maximizando ahorros de distancia.',
    badge: 'Recomendado',
    icon: Target,
  },
  {
    id: 'sweep',
    name: 'Sweep (Barrido)',
    description: 'Rapido y eficaz para clusters geograficos. Agrupa puntos por angulo polar.',
    icon: Route,
  },
  {
    id: 'nearest-neighbor',
    name: 'Nearest Neighbor',
    description: 'El mas simple y rapido. Siempre va al punto mas cercano disponible.',
    icon: Zap,
  },
]

export function StepOptimize({
  deliveryPoints,
  config,
  onConfigChange,
  onOptimize,
  isOptimizing,
  progressMessage,
  onBack,
}: StepOptimizeProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loadingFleet, setLoadingFleet] = useState(true)

  useEffect(() => {
    loadFleet()
  }, [])

  const loadFleet = async () => {
    setLoadingFleet(true)
    const vehiclesService = new VehiclesService()
    const driversService = new DriversService()

    const [v, d] = await Promise.all([
      vehiclesService.getAvailableVehicles().then(async res => {
        if (res.length === 0) return vehiclesService.getAllVehicles()
        return res
      }),
      driversService.getAvailableDrivers().then(async res => {
        if (res.length === 0) return driversService.getAllDrivers()
        return res
      }),
    ])

    setVehicles(v)
    setDrivers(d)
    setLoadingFleet(false)
  }

  // Normalize license_categories: backend raw SQL returns a comma-separated
  // string (e.g. "B2,C2") instead of an array because TypeORM simple-array
  // transformer only runs on repository methods, not dataSource.query().
  const parseLicenses = (raw: unknown): string[] => {
    if (Array.isArray(raw)) return raw
    if (typeof raw === 'string' && raw.length > 0) return raw.split(',').map(s => s.trim())
    return []
  }

  const pairs = useMemo((): VehicleDriverPair[] => {
    const result: VehicleDriverPair[] = []
    const usedDrivers = new Set<number>()

    const sorted = [...vehicles]
      .filter(v => v.status === 'activo' || vehicles.every(x => x.status !== 'activo'))
      .sort((a, b) => b.weight_capacity - a.weight_capacity)

    for (const vehicle of sorted) {
      const compatibleDriver = drivers.find(d => {
        if (usedDrivers.has(d.id_driver)) return false
        return isDriverCompatible(parseLicenses(d.license_categories), vehicle.vehicle_type)
      })

      if (compatibleDriver) {
        result.push({
          vehicle: {
            id_vehicle: vehicle.id_vehicle,
            license_plate: vehicle.license_plate,
            vehicle_type: vehicle.vehicle_type,
            weight_capacity: vehicle.weight_capacity,
            volume_capacity: vehicle.volume_capacity || 0,
            brand: vehicle.brand,
            model: vehicle.model,
          },
          driver: {
            id_driver: compatibleDriver.id_driver,
            first_name: compatibleDriver.first_name || '',
            last_name: compatibleDriver.last_name || '',
            phone: compatibleDriver.phone,
            license_categories: parseLicenses(compatibleDriver.license_categories),
          },
        })
        usedDrivers.add(compatibleDriver.id_driver)
      }
    }

    return result
  }, [vehicles, drivers])

  const totalDemandWeight = deliveryPoints.reduce((s, p) => s + (Number(p.total_weight) || 0), 0)
  const totalDemandVolume = deliveryPoints.reduce((s, p) => s + (Number(p.total_volume) || 0), 0)
  const totalFleetCapacity = pairs.reduce((s, p) => s + (Number(p.vehicle.weight_capacity) || 0), 0)
  const totalFleetVolume = pairs.reduce((s, p) => s + (Number(p.vehicle.volume_capacity) || 0), 0)

  const warnings: string[] = []
  if (pairs.length === 0 && vehicles.length > 0 && drivers.length > 0) {
    warnings.push('No hay pares vehiculo-conductor compatibles. Verifica las licencias de los conductores.')
  }
  if (totalDemandWeight > totalFleetCapacity && pairs.length > 0) {
    warnings.push(`Peso total (${totalDemandWeight.toFixed(1)} kg) excede la capacidad de flota (${totalFleetCapacity.toFixed(1)} kg).`)
  }
  if (config.respectVolumeCapacity && totalDemandVolume > totalFleetVolume && totalFleetVolume > 0) {
    warnings.push(`Volumen total (${totalDemandVolume.toFixed(1)} L) excede la capacidad volumetrica (${totalFleetVolume.toFixed(1)} L).`)
  }
  if (vehicles.length === 0) warnings.push('No hay vehiculos disponibles.')
  if (drivers.length === 0) warnings.push('No hay conductores disponibles.')

  const canOptimize = deliveryPoints.length > 0 && !isOptimizing

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          Configurar Optimizacion
        </h2>
        <p className="text-slate-500 text-sm mt-1 ml-10">
          Elige el algoritmo y las opciones. El sistema asignara vehiculos y conductores automaticamente.
        </p>
      </div>

      {/* Algorithm selector */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Algoritmo de Ruteo</label>
        <div className="grid gap-3">
          {ALGORITHMS.map(algo => {
            const Icon = algo.icon
            const selected = config.algorithm === algo.id
            return (
              <button
                key={algo.id}
                onClick={() => onConfigChange({ ...config, algorithm: algo.id })}
                disabled={isOptimizing}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? 'bg-blue-50 border-blue-500 shadow-sm shadow-blue-500/10'
                    : 'bg-white border-slate-200/60 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selected ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${selected ? 'text-blue-700' : 'text-slate-800'}`}>
                        {algo.name}
                      </span>
                      {algo.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          {algo.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{algo.description}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Settings2 className="w-3.5 h-3.5" /> Opciones
        </label>
        <div className="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-100">
          {/* 2-opt */}
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Mejora 2-opt</p>
              <p className="text-xs text-slate-500">Post-procesamiento que reduce distancia invirtiendo segmentos</p>
            </div>
            <button onClick={() => onConfigChange({ ...config, apply2Opt: !config.apply2Opt })}>
              {config.apply2Opt
                ? <ToggleRight className="w-9 h-9 text-blue-600" />
                : <ToggleLeft className="w-9 h-9 text-slate-300" />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Considerar volumen</p>
              <p className="text-xs text-slate-500">Respetar capacidad volumetrica de los vehiculos</p>
            </div>
            <button onClick={() => onConfigChange({ ...config, respectVolumeCapacity: !config.respectVolumeCapacity })}>
              {config.respectVolumeCapacity
                ? <ToggleRight className="w-9 h-9 text-blue-600" />
                : <ToggleLeft className="w-9 h-9 text-slate-300" />}
            </button>
          </div>

          {/* Max stops */}
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Max paradas por ruta</p>
              <p className="text-xs text-slate-500">Limite de puntos de entrega en cada ruta</p>
            </div>
            <input
              type="number"
              min={2}
              max={50}
              value={config.maxStopsPerRoute}
              onChange={e => onConfigChange({ ...config, maxStopsPerRoute: Math.max(2, parseInt(e.target.value) || 10) })}
              className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-800 text-center focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Fleet summary */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resumen de Flota</label>
        {loadingFleet ? (
          <div className="flex items-center gap-2 p-4 bg-white rounded-xl border border-slate-200/60">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-slate-500">Cargando flota...</span>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/60 p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Truck, count: vehicles.length, label: 'Vehiculos' },
                { icon: Users, count: drivers.length, label: 'Conductores' },
                { icon: Route, count: pairs.length, label: 'Pares compatibles' },
              ].map(({ icon: Icon, count, label }) => (
                <div key={label} className="text-center p-3 bg-slate-50 rounded-xl">
                  <Icon className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                  <p className="text-xl font-bold text-slate-900">{count}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {pairs.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Asignaciones</p>
                {pairs.map((pair, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-3 py-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-700 font-medium">
                      {pair.vehicle.license_plate}
                      <span className="text-slate-400 ml-1">({pair.vehicle.vehicle_type})</span>
                    </span>
                    <span className="text-slate-600">
                      {pair.driver.first_name} {pair.driver.last_name}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {pair.vehicle.weight_capacity} kg
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <span className="text-amber-700">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Optimize button / progress */}
      {isOptimizing ? (
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Loader2 className="w-7 h-7 animate-spin text-white" />
            </div>
          </div>
          <p className="text-sm text-blue-700 font-semibold">{progressMessage || 'Optimizando...'}</p>
          <p className="text-xs text-slate-400">Esto puede tardar unos segundos</p>
        </div>
      ) : (
        <div className="flex justify-between pt-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Atras
          </button>
          <button
            onClick={() => onOptimize(pairs)}
            disabled={!canOptimize}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all ${
              canOptimize
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Optimizar Rutas
          </button>
        </div>
      )}
    </div>
  )
}
