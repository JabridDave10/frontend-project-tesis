'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { stockService } from '@/services/stockService'
import { productsService } from '@/services/productsService'
import { warehouseService } from '@/services/warehouseService'
import { getUserId } from '@/hooks/useCompanyId'
import {
  Product,
  Warehouse,
  MovementType,
  MOVEMENT_TYPE_LABELS,
} from '@/types/productTypes'
import { ArrowLeft, ArrowRightLeft, Package, MapPin, FileText } from 'lucide-react'

export function AddStockMovementView() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isFetching, setIsFetching] = useState(true)

  const [formData, setFormData] = useState({
    movement_type: MovementType.ENTRY as MovementType,
    id_product: 0,
    id_warehouse_origin: 0,
    id_warehouse_destination: 0,
    quantity: 0,
    unit_type: '',
    reference_number: '',
    notes: '',
  })

  const selectedProduct = products.find(p => p.id_product === formData.id_product)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsFetching(true)
    try {
      const [productsData, warehousesData] = await Promise.all([
        productsService.getAllProducts(),
        warehouseService.getAllWarehouses(),
      ])
      setProducts(productsData)
      setWarehouses(warehousesData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (['id_product', 'id_warehouse_origin', 'id_warehouse_destination'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))

      // Auto-fill unit_type when product is selected
      if (name === 'id_product') {
        const product = products.find(p => p.id_product === parseInt(value))
        if (product) {
          setFormData(prev => ({
            ...prev,
            id_product: parseInt(value),
            unit_type: product.primary_unit_name,
          }))
        }
      }
    } else if (name === 'quantity') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const needsOrigin = [MovementType.EXIT, MovementType.TRANSFER, MovementType.DISPATCH].includes(formData.movement_type)
  const needsDestination = [MovementType.ENTRY, MovementType.TRANSFER, MovementType.RETURN].includes(formData.movement_type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const dto = {
        id_product: formData.id_product,
        id_warehouse_origin: needsOrigin ? formData.id_warehouse_origin : undefined,
        id_warehouse_destination: needsDestination ? formData.id_warehouse_destination : undefined,
        movement_type: formData.movement_type,
        quantity: formData.quantity,
        unit_type: formData.unit_type,
        reference_number: formData.reference_number || undefined,
        notes: formData.notes || undefined,
        created_by: getUserId(),
      }

      let result
      if ([MovementType.ENTRY, MovementType.RETURN].includes(formData.movement_type)) {
        result = await stockService.addStock(dto)
      } else {
        result = await stockService.removeStock(dto)
      }

      if (result) {
        router.push('/dashboard/productos/inventario')
      }
    } catch (error) {
      console.error('Error al registrar movimiento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-400"
  const selectClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

  const movementTypes = [
    MovementType.ENTRY,
    MovementType.EXIT,
    MovementType.TRANSFER,
    MovementType.ADJUSTMENT,
    MovementType.RETURN,
  ]

  if (isFetching) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/productos/inventario')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a inventario</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Registrar Movimiento</h1>
          <p className="text-slate-500 text-sm mt-1">Registre una entrada, salida o transferencia de stock</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Movimiento */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Tipo de Movimiento</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {movementTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, movement_type: type }))}
                  className={`px-3 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                    formData.movement_type === type
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200/60 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {MOVEMENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Producto */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Producto y Cantidad</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Producto *</label>
                <select name="id_product" value={formData.id_product} onChange={handleChange} required className={selectClass}>
                  <option value={0}>Seleccione un producto</option>
                  {products.map((product) => (
                    <option key={product.id_product} value={product.id_product}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Cantidad *</label>
                <input type="number" name="quantity" value={formData.quantity || ''} onChange={handleChange} placeholder="0" min="0.01" step="0.01" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Unidad</label>
                <input type="text" name="unit_type" value={formData.unit_type} onChange={handleChange} placeholder="Unidad" className={inputClass} readOnly={!!selectedProduct} />
              </div>
            </div>
          </div>

          {/* Bodegas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Bodegas</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {needsOrigin && (
                <div className={needsDestination ? '' : 'col-span-2'}>
                  <label className={labelClass}>Bodega Origen *</label>
                  <select name="id_warehouse_origin" value={formData.id_warehouse_origin} onChange={handleChange} required className={selectClass}>
                    <option value={0}>Seleccione bodega</option>
                    {warehouses.map((w) => (
                      <option key={w.id_warehouse} value={w.id_warehouse}>
                        {w.name} - {w.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {needsDestination && (
                <div className={needsOrigin ? '' : 'col-span-2'}>
                  <label className={labelClass}>Bodega Destino *</label>
                  <select name="id_warehouse_destination" value={formData.id_warehouse_destination} onChange={handleChange} required className={selectClass}>
                    <option value={0}>Seleccione bodega</option>
                    {warehouses.map((w) => (
                      <option key={w.id_warehouse} value={w.id_warehouse}>
                        {w.name} - {w.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {!needsOrigin && !needsDestination && (
                <div className="col-span-2">
                  <label className={labelClass}>Bodega *</label>
                  <select name="id_warehouse_origin" value={formData.id_warehouse_origin} onChange={handleChange} required className={selectClass}>
                    <option value={0}>Seleccione bodega</option>
                    {warehouses.map((w) => (
                      <option key={w.id_warehouse} value={w.id_warehouse}>
                        {w.name} - {w.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Referencia y Notas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Referencia y Notas</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Numero de referencia</label>
                <input type="text" name="reference_number" value={formData.reference_number} onChange={handleChange} placeholder="Ej: OC-001, FAC-123" maxLength={100} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Notas</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Observaciones adicionales..." rows={3} maxLength={500} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard/productos/inventario')}
              disabled={isLoading}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || formData.id_product === 0 || formData.quantity <= 0}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
