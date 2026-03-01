'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { stockService } from '@/services/stockService'
import { warehouseService } from '@/services/warehouseService'
import { Stock, Warehouse } from '@/types/productTypes'
import { Search, Plus, PackageOpen, Warehouse as WarehouseIcon, ArrowRightLeft } from 'lucide-react'

// PostgreSQL numeric(10,3) llega como string "150.000" — parseamos a number
const num = (v: any): number => Number(v) || 0

const formatQty = (v: any): string => {
  const n = num(v)
  return n % 1 === 0 ? n.toLocaleString() : n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

export function StockListView() {
  const router = useRouter()
  const [stockItems, setStockItems] = useState<Stock[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWarehouse, setSelectedWarehouse] = useState<number>(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadWarehouses()
  }, [])

  useEffect(() => {
    if (selectedWarehouse > 0) {
      loadStock()
    }
  }, [selectedWarehouse])

  const loadWarehouses = async () => {
    const data = await warehouseService.getAllWarehouses()
    setWarehouses(data)
    if (data.length > 0) {
      setSelectedWarehouse(data[0].id_warehouse)
    }
    setIsLoading(false)
  }

  const loadStock = async () => {
    setIsLoading(true)
    const data = await stockService.getStockByWarehouse(selectedWarehouse)
    setStockItems(data)
    setIsLoading(false)
  }

  const filteredStock = stockItems.filter(
    (item) =>
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalAvailable = filteredStock.reduce((sum, item) => sum + num(item.quantity_available), 0)
  const totalReserved = filteredStock.reduce((sum, item) => sum + num(item.reserved_quantity), 0)

  const getStockStatusBadge = (rawAvailable: any, rawReserved: any) => {
    const available = num(rawAvailable)
    const reserved = num(rawReserved)
    const total = available + reserved
    if (total === 0) {
      return { className: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Sin stock' }
    } else if (available === 0 && reserved > 0) {
      return { className: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Reservado' }
    } else if (available > 0 && available <= 10) {
      return { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Stock bajo' }
    }
    return { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Disponible' }
  }

  // No warehouses at all
  if (!isLoading && warehouses.length === 0) {
    return (
      <div className="p-8 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-slate-500 text-sm mt-1">Gestion de stock por bodega</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <WarehouseIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-1">No hay bodegas registradas</h3>
          <p className="text-slate-500 text-sm mb-4">Crea tu primera bodega para comenzar a gestionar inventario</p>
          <button
            onClick={() => router.push('/dashboard/productos/bodegas')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm"
          >
            Ir a Bodegas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
          <p className="text-slate-500 text-sm mt-1">Gestion de stock por bodega</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/productos/inventario/movimientos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Movimientos
          </button>
          <button
            onClick={() => router.push('/dashboard/productos/inventario/agregar-stock')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Registrar Movimiento
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Items en bodega</p>
          <p className="text-2xl font-bold text-slate-800">{filteredStock.length}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Disponible</p>
          <p className="text-2xl font-bold text-emerald-600">{formatQty(totalAvailable)}</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Reservado</p>
          <p className="text-2xl font-bold text-amber-600">{formatQty(totalReserved)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(parseInt(e.target.value))}
          className="px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 shadow-sm min-w-[250px]"
        >
          {warehouses.map((warehouse) => (
            <option key={warehouse.id_warehouse} value={warehouse.id_warehouse}>
              {warehouse.name} - {warehouse.address}
            </option>
          ))}
        </select>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Cargando inventario...</p>
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">Sin stock</h3>
            <p className="text-slate-500 text-sm mb-4">
              {searchTerm ? 'No se encontraron productos' : 'No hay stock registrado en esta bodega'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/dashboard/productos/inventario/agregar-stock')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all"
              >
                Registrar Entrada
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Disponible</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reservado</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ultima Act.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStock.map((item) => {
                  const available = num(item.quantity_available)
                  const reserved = num(item.reserved_quantity)
                  const total = available + reserved
                  const status = getStockStatusBadge(item.quantity_available, item.reserved_quantity)
                  return (
                    <tr key={item.id_stock} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-800">{item.sku}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-800">{item.product_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-emerald-600">{formatQty(available)}</span>
                        <span className="text-xs text-slate-500 ml-1">{item.primary_unit_name || item.unit_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-amber-600">{formatQty(reserved)}</span>
                        <span className="text-xs text-slate-500 ml-1">{item.primary_unit_name || item.unit_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-800">{formatQty(total)}</span>
                        <span className="text-xs text-slate-500 ml-1">{item.primary_unit_name || item.unit_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-lg border ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(item.last_updated).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
