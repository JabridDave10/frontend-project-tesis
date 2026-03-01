'use client'

import { useState } from 'react'
import { DeliveryPoint, DeliveryItem } from '@/types/vrpTypes'
import { Stock, Product } from '@/types/productTypes'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import {
  ChevronDown, ChevronUp, Trash2, Plus, Package, MapPin,
  User, Phone, Weight, Box, AlertTriangle, CheckCircle2
} from 'lucide-react'

interface DeliveryPointCardProps {
  point: DeliveryPoint
  index: number
  products: Product[]
  warehouseStock: Stock[]
  /** Stock already allocated by all points (product_id -> qty) */
  allocatedStock: Map<number, number>
  /** City context for address autocomplete (e.g. "Bogota, Colombia") */
  searchContext: string
  /** Nominatim viewbox for address search */
  viewbox: string
  onChange: (updated: DeliveryPoint) => void
  onRemove: () => void
}

export function DeliveryPointCard({
  point,
  index,
  products,
  warehouseStock,
  allocatedStock,
  searchContext,
  viewbox,
  onChange,
  onRemove,
}: DeliveryPointCardProps) {
  const [collapsed, setCollapsed] = useState(false)

  const fmt = (v: unknown, d = 1) => (Number(v) || 0).toFixed(d)

  const priorityConfig: Record<string, { bg: string; text: string; border: string }> = {
    baja: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
    media: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    alta: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    urgente: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  }

  const hasValidAddress = point.address && point.latitude !== 0 && point.longitude !== 0

  const handleAddressChange = (address: string, lat?: number, lng?: number) => {
    onChange({ ...point, address, latitude: lat ?? 0, longitude: lng ?? 0 })
  }

  const handleFieldChange = (field: keyof DeliveryPoint, value: string) => {
    onChange({ ...point, [field]: value })
  }

  const handlePriorityChange = (priority: DeliveryPoint['priority']) => {
    onChange({ ...point, priority })
  }

  const getAvailableStock = (productId: number): number => {
    const stockItem = warehouseStock.find(s => s.id_product === productId)
    if (!stockItem) return 0
    const allocated = allocatedStock.get(productId) || 0
    const thisPointQty = point.items.find(i => i.id_product === productId)?.quantity || 0
    return Math.max(0, stockItem.quantity_available - allocated + thisPointQty)
  }

  const handleAddItem = () => {
    const availableProducts = products.filter(p => {
      const avail = getAvailableStock(p.id_product)
      return avail > 0 && !point.items.some(i => i.id_product === p.id_product)
    })

    if (availableProducts.length === 0) return

    const product = availableProducts[0]
    const available = getAvailableStock(product.id_product)
    const newItem: DeliveryItem = {
      id_product: product.id_product,
      product_name: product.name,
      sku: product.sku,
      quantity: 1,
      weight_per_unit: product.weight_per_unit || 0,
      volume_per_unit: product.volume_per_unit || 0,
      total_weight: product.weight_per_unit || 0,
      total_volume: product.volume_per_unit || 0,
      requires_refrigeration: product.requires_refrigeration,
      is_fragile: product.is_fragile,
      is_hazardous: product.is_hazardous,
      stock_available: available,
    }

    const newItems = [...point.items, newItem]
    const totalWeight = newItems.reduce((s, i) => s + i.total_weight, 0)
    const totalVolume = newItems.reduce((s, i) => s + i.total_volume, 0)
    onChange({ ...point, items: newItems, total_weight: totalWeight, total_volume: totalVolume })
  }

  const handleItemProductChange = (itemIdx: number, productId: number) => {
    const product = products.find(p => p.id_product === productId)
    if (!product) return

    const available = getAvailableStock(productId)
    const newItems = [...point.items]
    newItems[itemIdx] = {
      id_product: product.id_product,
      product_name: product.name,
      sku: product.sku,
      quantity: 1,
      weight_per_unit: product.weight_per_unit || 0,
      volume_per_unit: product.volume_per_unit || 0,
      total_weight: product.weight_per_unit || 0,
      total_volume: product.volume_per_unit || 0,
      requires_refrigeration: product.requires_refrigeration,
      is_fragile: product.is_fragile,
      is_hazardous: product.is_hazardous,
      stock_available: available,
    }

    const totalWeight = newItems.reduce((s, i) => s + i.total_weight, 0)
    const totalVolume = newItems.reduce((s, i) => s + i.total_volume, 0)
    onChange({ ...point, items: newItems, total_weight: totalWeight, total_volume: totalVolume })
  }

  const handleItemQtyChange = (itemIdx: number, qty: number) => {
    const newItems = [...point.items]
    const item = newItems[itemIdx]
    const available = getAvailableStock(item.id_product)
    const clampedQty = Math.max(1, Math.min(qty, available))

    newItems[itemIdx] = {
      ...item,
      quantity: clampedQty,
      total_weight: clampedQty * item.weight_per_unit,
      total_volume: clampedQty * item.volume_per_unit,
    }

    const totalWeight = newItems.reduce((s, i) => s + i.total_weight, 0)
    const totalVolume = newItems.reduce((s, i) => s + i.total_volume, 0)
    onChange({ ...point, items: newItems, total_weight: totalWeight, total_volume: totalVolume })
  }

  const handleRemoveItem = (itemIdx: number) => {
    const newItems = point.items.filter((_, i) => i !== itemIdx)
    const totalWeight = newItems.reduce((s, i) => s + i.total_weight, 0)
    const totalVolume = newItems.reduce((s, i) => s + i.total_volume, 0)
    onChange({ ...point, items: newItems, total_weight: totalWeight, total_volume: totalVolume })
  }

  const availableProductsForAdd = products.filter(p => {
    const avail = getAvailableStock(p.id_product)
    return avail > 0 && !point.items.some(i => i.id_product === p.id_product)
  })

  const pCfg = priorityConfig[point.priority] || priorityConfig.media

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{index + 1}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {point.address || 'Sin direccion'}
              </p>
              {hasValidAddress ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              ) : point.address ? (
                <span title="Direccion no geocodificada"><AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /></span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{point.items.length} producto(s)</span>
              <span className="text-slate-300">|</span>
              <span>{fmt(point.total_weight)} kg</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${pCfg.bg} ${pCfg.text}`}>
                {point.priority}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {collapsed ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Direccion de entrega
            </label>
            <AddressAutocomplete
              value={point.address}
              onChange={handleAddressChange}
              placeholder="Buscar direccion..."
              searchContext={searchContext}
              viewbox={viewbox}
              bounded={true}
            />
            {point.address && !hasValidAddress && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Selecciona una direccion del listado para obtener coordenadas
              </p>
            )}
          </div>

          {/* Recipient */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3" /> Destinatario
              </label>
              <input
                type="text"
                value={point.recipient_name || ''}
                onChange={e => handleFieldChange('recipient_name', e.target.value)}
                placeholder="Nombre (opcional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Telefono
              </label>
              <input
                type="text"
                value={point.recipient_phone || ''}
                onChange={e => handleFieldChange('recipient_phone', e.target.value)}
                placeholder="Telefono (opcional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Prioridad</label>
            <div className="flex gap-2">
              {(['baja', 'media', 'alta', 'urgente'] as const).map(p => {
                const cfg = priorityConfig[p]
                const selected = point.priority === p
                return (
                  <button
                    key={p}
                    onClick={() => handlePriorityChange(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selected
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-offset-1 ring-blue-400`
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3 h-3" /> Productos
              </label>
              <button
                onClick={handleAddItem}
                disabled={availableProductsForAdd.length === 0}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  availableProductsForAdd.length > 0
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>

            {point.items.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Agrega productos a este punto de entrega</p>
              </div>
            ) : (
              <div className="space-y-2">
                {point.items.map((item, itemIdx) => {
                  const available = getAvailableStock(item.id_product)
                  const overStock = item.quantity > available

                  return (
                    <div
                      key={itemIdx}
                      className={`flex items-center gap-2 p-3 rounded-xl border ${
                        overStock
                          ? 'bg-red-50 border-red-200'
                          : 'bg-white border-slate-200/60'
                      }`}
                    >
                      {/* Product selector */}
                      <select
                        value={item.id_product}
                        onChange={e => handleItemProductChange(itemIdx, Number(e.target.value))}
                        className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value={item.id_product}>{item.product_name} ({item.sku})</option>
                        {products
                          .filter(p => p.id_product !== item.id_product && !point.items.some(i => i.id_product === p.id_product))
                          .filter(p => getAvailableStock(p.id_product) > 0)
                          .map(p => (
                            <option key={p.id_product} value={p.id_product}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                      </select>

                      {/* Quantity */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={available}
                          value={item.quantity}
                          onChange={e => handleItemQtyChange(itemIdx, parseInt(e.target.value) || 1)}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 text-center focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
                        />
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          / {available}
                        </span>
                      </div>

                      {/* Weight */}
                      <span className="text-[10px] text-slate-500 whitespace-nowrap hidden sm:block font-medium">
                        {fmt(item.total_weight)} kg
                      </span>

                      {/* Flags */}
                      <div className="flex gap-0.5">
                        {item.requires_refrigeration && <span title="Refrigerado" className="text-[10px]">❄️</span>}
                        {item.is_fragile && <span title="Fragil" className="text-[10px]">⚠️</span>}
                        {item.is_hazardous && <span title="Peligroso" className="text-[10px]">☢️</span>}
                      </div>

                      {overStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}

                      <button
                        onClick={() => handleRemoveItem(itemIdx)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1 font-medium">
              <Weight className="w-3 h-3 text-blue-500" /> {fmt(point.total_weight)} kg
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Box className="w-3 h-3 text-blue-500" /> {fmt(point.total_volume)} L
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Notas</label>
            <input
              type="text"
              value={point.notes || ''}
              onChange={e => handleFieldChange('notes', e.target.value)}
              placeholder="Instrucciones especiales (opcional)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}
