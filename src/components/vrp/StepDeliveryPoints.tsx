'use client'

import { DeliveryPoint } from '@/types/vrpTypes'
import { Stock, Product } from '@/types/productTypes'
import { DeliveryPointCard } from './DeliveryPointCard'
import {
  MapPin, Plus, ChevronLeft, ChevronRight,
  Weight, Box, Package, AlertTriangle
} from 'lucide-react'

interface StepDeliveryPointsProps {
  deliveryPoints: DeliveryPoint[]
  products: Product[]
  warehouseStock: Stock[]
  /** City context for address autocomplete */
  searchContext: string
  /** Nominatim viewbox for address search */
  viewbox: string
  onChange: (points: DeliveryPoint[]) => void
  onBack: () => void
  onNext: () => void
}

function generateId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `dp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }
}

export function StepDeliveryPoints({
  deliveryPoints,
  products,
  warehouseStock,
  searchContext,
  viewbox,
  onChange,
  onBack,
  onNext,
}: StepDeliveryPointsProps) {

  const handleAdd = () => {
    const newPoint: DeliveryPoint = {
      id: generateId(),
      address: '',
      latitude: 0,
      longitude: 0,
      items: [],
      total_weight: 0,
      total_volume: 0,
      priority: 'media',
    }
    onChange([...deliveryPoints, newPoint])
  }

  const handleChange = (index: number, updated: DeliveryPoint) => {
    const newPoints = [...deliveryPoints]
    newPoints[index] = updated
    onChange(newPoints)
  }

  const handleRemove = (index: number) => {
    onChange(deliveryPoints.filter((_, i) => i !== index))
  }

  const buildAllocatedStock = (): Map<number, number> => {
    const map = new Map<number, number>()
    deliveryPoints.forEach(point => {
      point.items.forEach(item => {
        const prev = map.get(item.id_product) || 0
        map.set(item.id_product, prev + item.quantity)
      })
    })
    return map
  }

  const totalWeight = deliveryPoints.reduce((s, p) => s + (Number(p.total_weight) || 0), 0)
  const totalVolume = deliveryPoints.reduce((s, p) => s + (Number(p.total_volume) || 0), 0)
  const totalItems = deliveryPoints.reduce((s, p) => s + (p.items?.length || 0), 0)

  // Validation
  const invalidPoints = deliveryPoints.filter(
    p => !p.address || p.latitude === 0 || p.longitude === 0 || p.items.length === 0
  )
  const hasValidPoints = deliveryPoints.length > 0 && invalidPoints.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            Puntos de Entrega
          </h2>
          <p className="text-slate-500 text-sm mt-1 ml-10">
            Agrega las direcciones de destino y los productos a entregar en cada punto.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 font-medium text-sm transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Agregar Punto
        </button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 px-5 py-3.5 bg-white rounded-xl border border-slate-200/60 shadow-sm text-sm">
        <span className="flex items-center gap-1.5 text-slate-700">
          <MapPin className="w-4 h-4 text-blue-600" />
          <strong className="text-slate-900">{deliveryPoints.length}</strong> puntos
        </span>
        <span className="w-px h-4 bg-slate-200" />
        <span className="flex items-center gap-1.5 text-slate-700">
          <Package className="w-4 h-4 text-blue-600" />
          <strong className="text-slate-900">{totalItems}</strong> productos
        </span>
        <span className="w-px h-4 bg-slate-200" />
        <span className="flex items-center gap-1.5 text-slate-700">
          <Weight className="w-4 h-4 text-blue-600" />
          <strong className="text-slate-900">{totalWeight.toFixed(1)}</strong> kg
        </span>
        <span className="w-px h-4 bg-slate-200" />
        <span className="flex items-center gap-1.5 text-slate-700">
          <Box className="w-4 h-4 text-blue-600" />
          <strong className="text-slate-900">{totalVolume.toFixed(1)}</strong> L
        </span>
      </div>

      {/* Validation warning */}
      {deliveryPoints.length > 0 && invalidPoints.length > 0 && (
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-amber-700">
            <p className="font-medium">{invalidPoints.length} punto(s) incompletos:</p>
            <ul className="mt-1 text-xs space-y-0.5">
              {invalidPoints.map(p => {
                const issues = []
                if (!p.address || p.latitude === 0) issues.push('sin direccion valida')
                if (p.items.length === 0) issues.push('sin productos')
                return (
                  <li key={p.id}>Punto "{p.address || 'vacio'}" - {issues.join(', ')}</li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Delivery Points list */}
      {deliveryPoints.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-3">No hay puntos de entrega</p>
          <button
            onClick={handleAdd}
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
          >
            + Agregar primer punto
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveryPoints.map((point, idx) => (
            <DeliveryPointCard
              key={point.id}
              point={point}
              index={idx}
              products={products}
              warehouseStock={warehouseStock}
              allocatedStock={buildAllocatedStock()}
              searchContext={searchContext}
              viewbox={viewbox}
              onChange={updated => handleChange(idx, updated)}
              onRemove={() => handleRemove(idx)}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Atras
        </button>
        <button
          onClick={onNext}
          disabled={!hasValidPoints}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            hasValidPoints
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
