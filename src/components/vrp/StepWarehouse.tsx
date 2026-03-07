'use client'

import { useState, useEffect } from 'react'
import { Warehouse, Stock } from '@/types/productTypes'
import { warehouseService } from '@/services/warehouseService'
import { StockService } from '@/services/stockService'
import { Warehouse as WarehouseIcon, MapPin, Loader2, Package, ChevronRight } from 'lucide-react'

interface StepWarehouseProps {
  selectedWarehouse: Warehouse | null
  warehouseCoords: { lat: number; lng: number } | null
  warehouseStock: Stock[]
  onSelect: (warehouse: Warehouse, coords: { lat: number; lng: number }, stock: Stock[]) => void
  onNext: () => void
}

export function StepWarehouse({
  selectedWarehouse,
  warehouseCoords,
  warehouseStock,
  onSelect,
  onNext,
}: StepWarehouseProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [geocoding, setGeocoding] = useState(false)

  const stockService = new StockService()

  useEffect(() => {
    loadWarehouses()
  }, [])

  const loadWarehouses = async () => {
    setLoading(true)
    const data = await warehouseService.getAllWarehouses()
    setWarehouses(data)
    setLoading(false)
  }

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return null

    try {
      const encoded = encodeURIComponent(address + ', Colombia')
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&components=country:CO&key=${apiKey}`
      )
      const data = await res.json()
      if (data.status === 'OK' && data.results.length > 0) {
        const loc = data.results[0].geometry.location
        return { lat: loc.lat, lng: loc.lng }
      }
    } catch (err) {
      console.error('Geocoding error:', err)
    }
    return null
  }

  const handleSelect = async (warehouse: Warehouse) => {
    setGeocoding(true)
    try {
      const [coords, stock] = await Promise.all([
        geocodeAddress(warehouse.address),
        stockService.getStockByWarehouse(warehouse.id_warehouse),
      ])
      onSelect(warehouse, coords ?? { lat: 4.711, lng: -74.072 }, stock)
    } finally {
      setGeocoding(false)
    }
  }

  const canProceed = selectedWarehouse && warehouseCoords

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <WarehouseIcon className="w-4 h-4 text-white" />
          </div>
          Seleccionar Bodega de Origen
        </h2>
        <p className="text-slate-500 text-sm mt-1 ml-10">
          Elige la bodega desde donde saldran los vehiculos con la mercancia.
        </p>
      </div>

      {/* Warehouse List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-500">Cargando bodegas...</span>
        </div>
      ) : warehouses.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200/60">
          <WarehouseIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No hay bodegas registradas.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {warehouses.map(w => {
            const isSelected = selectedWarehouse?.id_warehouse === w.id_warehouse
            return (
              <button
                key={w.id_warehouse}
                onClick={() => handleSelect(w)}
                disabled={geocoding}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-sm shadow-blue-500/10'
                    : 'bg-white border-slate-200/60 hover:border-blue-300 hover:bg-slate-50'
                } ${geocoding ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <WarehouseIcon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                        {w.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-slate-500 ml-6">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{w.address}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {geocoding && selectedWarehouse?.id_warehouse === w.id_warehouse && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 ml-2" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected warehouse info */}
      {selectedWarehouse && warehouseCoords && (
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Bodega Seleccionada</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400 text-xs">Coordenadas</span>
              <p className="text-slate-700 font-mono text-xs mt-0.5">
                {warehouseCoords.lat.toFixed(6)}, {warehouseCoords.lng.toFixed(6)}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-xs">Productos en stock</span>
              <p className="text-slate-700 flex items-center gap-1 mt-0.5">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold">{warehouseStock.length}</span> items
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            canProceed
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
