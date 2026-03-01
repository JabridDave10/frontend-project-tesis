'use client'

import { useState } from 'react'
import { VRPResult, VRPRoute, convertVRPRoutesToOptimizedRoutes } from '@/types/vrpTypes'
import { RoutesService } from '@/services/routesService'
import { stockService } from '@/services/stockService'
import { CapacityBar } from './CapacityBar'
import dynamic from 'next/dynamic'
import {
  CheckCircle2, AlertTriangle, ChevronLeft, Save, Loader2,
  Route, Clock, MapPin, Truck, User, RotateCcw, Cpu
} from 'lucide-react'
import { toast } from 'react-toastify'

const OptimizedRouteMap = dynamic(() => import('@/components/map/OptimizedRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200/60">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
})

interface StepResultsProps {
  result: VRPResult
  origin: { address: string; lat: number; lng: number }
  warehouseId: number
  onBack: () => void
  onReset: () => void
}

export function StepResults({
  result,
  origin,
  warehouseId,
  onBack,
  onReset,
}: StepResultsProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const optimizedRoutes = convertVRPRoutesToOptimizedRoutes(result.routes, origin)

  const handleSave = async () => {
    setSaving(true)
    const routesService = new RoutesService()

    try {
      let savedCount = 0

      for (const route of result.routes) {
        const lastStop = route.stops[route.stops.length - 1]
        const cargoDesc = route.stops
          .flatMap(s => s.delivery_point.items.map(i => `${i.product_name} x${i.quantity}`))
          .join('; ')

        const created = await routesService.createRoute({
          route_code: route.route_code,
          id_driver: route.driver?.id_driver,
          id_vehicle: route.vehicle?.id_vehicle,
          origin_address: origin.address,
          origin_latitude: origin.lat,
          origin_longitude: origin.lng,
          destination_address: lastStop?.delivery_point.address ?? '',
          destination_latitude: lastStop?.delivery_point.latitude,
          destination_longitude: lastStop?.delivery_point.longitude,
          cargo_weight: route.total_weight,
          cargo_volume: route.total_volume,
          cargo_description: cargoDesc,
          estimated_distance: Math.round(route.total_distance * 100) / 100,
          estimated_duration: Math.round(route.total_duration),
          status: 'pendiente',
          notes: `VRP ${result.algorithm_used}${result.applied_2opt ? ' +2opt' : ''} | ${route.stops.length} paradas`,
        })

        if (created) {
          savedCount++
          const userId = JSON.parse(localStorage.getItem('user') || '{}').id_user || 1
          for (const stop of route.stops) {
            for (const item of stop.delivery_point.items) {
              await stockService.reserveStock({
                id_product: item.id_product,
                id_warehouse: warehouseId,
                quantity: item.quantity,
                reserved_by: userId,
              })
            }
          }
        }
      }

      if (savedCount === result.routes.length) {
        toast.success(`${savedCount} ruta(s) guardadas exitosamente`)
        setSaved(true)
      } else {
        toast.warning(`Solo se guardaron ${savedCount} de ${result.routes.length} rutas`)
      }
    } catch (err) {
      console.error('Error saving routes:', err)
      toast.error('Error al guardar las rutas')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
          Resultados de Optimizacion
        </h2>
        <p className="text-slate-500 text-sm mt-1 ml-10">
          Revisa las rutas generadas y guardalas cuando estes listo.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Route className="w-5 h-5 text-blue-600" />} label="Rutas" value={result.routes.length.toString()} />
        <StatCard icon={<MapPin className="w-5 h-5 text-blue-600" />} label="Distancia total" value={`${result.total_distance.toFixed(1)} km`} />
        <StatCard icon={<Clock className="w-5 h-5 text-blue-600" />} label="Duracion total" value={`${result.total_duration.toFixed(0)} min`} />
        <StatCard icon={<Cpu className="w-5 h-5 text-blue-600" />} label="Tiempo computo" value={`${result.computation_time_ms} ms`} />
      </div>

      {/* Algorithm badge */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
          Algoritmo: <strong className="text-blue-600">{result.algorithm_used}</strong>
        </span>
        {result.applied_2opt && (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
            2-opt aplicado
          </span>
        )}
      </div>

      {/* Unassigned */}
      {result.unassigned_points.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">
              {result.unassigned_points.length} punto(s) no asignados
            </span>
          </div>
          {result.unassigned_points.map((p, i) => (
            <p key={i} className="text-xs text-amber-600 pl-7">
              - {p.address} ({(Number(p.total_weight) || 0).toFixed(1)} kg)
            </p>
          ))}
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="space-y-1">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-600">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Route cards */}
      <div className="space-y-4">
        {result.routes.map((route, idx) => (
          <RouteCard key={idx} route={route} index={idx} />
        ))}
      </div>

      {/* Map */}
      {optimizedRoutes.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Mapa de Rutas</h3>
          <OptimizedRouteMap key={`vrp-map-${result.computation_time_ms}`} routes={optimizedRoutes} />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Atras
        </button>

        <div className="flex gap-3">
          <button
            onClick={onReset}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Nueva Planificacion
          </button>

          {!saved ? (
            <button
              onClick={handleSave}
              disabled={saving || result.routes.length === 0}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${
                saving
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Rutas
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Rutas Guardadas
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-4 text-center shadow-sm">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-[11px] text-slate-500 font-medium">{label}</p>
    </div>
  )
}

function RouteCard({ route, index }: { route: VRPRoute; index: number }) {
  const borderColors = ['border-l-blue-500', 'border-l-emerald-500', 'border-l-amber-500', 'border-l-red-500', 'border-l-purple-500', 'border-l-pink-500']
  const borderColor = borderColors[index % borderColors.length]

  return (
    <div className={`bg-white rounded-xl border border-slate-200/60 border-l-4 ${borderColor} shadow-sm p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900 text-sm">{route.route_code}</h4>
        <span className="text-xs text-slate-500">
          {route.total_distance.toFixed(1)} km | {route.total_duration.toFixed(0)} min
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-600">
        {route.vehicle && (
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            {route.vehicle.license_plate} ({route.vehicle.vehicle_type})
          </span>
        )}
        {route.driver && (
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-blue-600" />
            {route.driver.first_name} {route.driver.last_name}
          </span>
        )}
      </div>

      {route.vehicle && (
        <div className="space-y-2">
          <CapacityBar label="Peso" current={route.total_weight} max={route.vehicle.weight_capacity} unit="kg" />
          {route.vehicle.volume_capacity > 0 && (
            <CapacityBar label="Volumen" current={route.total_volume} max={route.vehicle.volume_capacity} unit="L" />
          )}
        </div>
      )}

      <div className="space-y-1.5">
        {route.stops.map(stop => (
          <div
            key={stop.sequence}
            className="flex items-center gap-2 text-xs px-3 py-2 bg-slate-50 rounded-lg"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-[10px]">
              {stop.sequence}
            </span>
            <span className="text-slate-700 truncate flex-1">{stop.delivery_point.address}</span>
            <span className="text-slate-400 whitespace-nowrap font-medium">
              {(Number(stop.delivery_point.total_weight) || 0).toFixed(1)} kg
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
