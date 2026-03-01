'use client'

import { Truck, Wifi, WifiOff, Gauge } from 'lucide-react'
import type { VehiclePosition } from '@/services/gpsTrackingService'

interface ActiveDriversPanelProps {
  drivers: VehiclePosition[]
  isConnected: boolean
  onDriverClick: (driver: VehiclePosition) => void
  selectedDriverId?: number | null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'en_ruta': return 'bg-cyan-500'
    case 'disponible': return 'bg-emerald-500'
    case 'detenido': return 'bg-amber-500'
    default: return 'bg-slate-400'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'en_ruta': return 'En Ruta'
    case 'disponible': return 'Disponible'
    case 'detenido': return 'Detenido'
    default: return status
  }
}

export const ActiveDriversPanel = ({
  drivers,
  isConnected,
  onDriverClick,
  selectedDriverId,
}: ActiveDriversPanelProps) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Conductores Activos</h3>
            <p className="text-xs text-slate-400 mt-0.5">{drivers.length} rastreando</p>
          </div>
          <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
            isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {isConnected ? (
              <><Wifi className="w-3 h-3" /> Conectado</>
            ) : (
              <><WifiOff className="w-3 h-3" /> Desconectado</>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {drivers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-medium">Sin conductores activos</p>
            <p className="text-xs text-slate-400 mt-1">
              Los conductores apareceran aqui cuando inicien su tracking GPS
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {drivers.map((driver) => {
              const name = `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Conductor'
              const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
              const isSelected = selectedDriverId === driver.id_driver

              return (
                <button
                  key={driver.id_driver}
                  onClick={() => onDriverClick(driver)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left ${
                    isSelected ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 truncate">{name}</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(driver.status)}`} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {driver.license_plate && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {driver.license_plate}
                        </span>
                      )}
                      {driver.speed !== undefined && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          {Math.round(driver.speed)} km/h
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    driver.status === 'en_ruta' ? 'bg-cyan-50 text-cyan-700' :
                    driver.status === 'disponible' ? 'bg-emerald-50 text-emerald-700' :
                    driver.status === 'detenido' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {getStatusLabel(driver.status)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
