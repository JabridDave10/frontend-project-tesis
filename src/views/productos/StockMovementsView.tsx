'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { stockService } from '@/services/stockService'
import { productsService } from '@/services/productsService'
import { StockMovement, Product, MOVEMENT_TYPE_LABELS } from '@/types/productTypes'
import { ArrowLeft, ArrowRightLeft } from 'lucide-react'

const num = (v: any): number => Number(v) || 0
const formatQty = (v: any): string => {
  const n = num(v)
  return n % 1 === 0 ? n.toLocaleString() : n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })
}

export function StockMovementsView() {
  const router = useRouter()
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [limit, setLimit] = useState(50)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedProduct && selectedProduct !== 'all') {
      loadMovements(parseInt(selectedProduct))
    }
  }, [selectedProduct, limit])

  const loadData = async () => {
    setIsLoading(true)
    const productsData = await productsService.getAllProducts()
    setProducts(productsData)
    setIsLoading(false)
  }

  const loadMovements = async (productId: number) => {
    setIsLoading(true)
    const data = await stockService.getMovementHistory(productId, limit)
    setMovements(data)
    setIsLoading(false)
  }

  const getMovementTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      entry: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      exit: 'bg-red-50 text-red-700 border-red-200',
      transfer: 'bg-blue-50 text-blue-700 border-blue-200',
      adjustment: 'bg-purple-50 text-purple-700 border-purple-200',
      reservation: 'bg-amber-50 text-amber-700 border-amber-200',
      dispatch: 'bg-orange-50 text-orange-700 border-orange-200',
      return: 'bg-teal-50 text-teal-700 border-teal-200',
    }

    return (
      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-lg border ${styles[type] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
        {MOVEMENT_TYPE_LABELS[type as keyof typeof MOVEMENT_TYPE_LABELS] || type}
      </span>
    )
  }

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Historial de Movimientos</h1>
          <p className="text-slate-500 text-sm mt-1">Registro de entradas, salidas y transferencias</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/productos/inventario')}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Inventario
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 shadow-sm"
        >
          <option value="all">Seleccione un producto</option>
          {products.map((product) => (
            <option key={product.id_product} value={product.id_product}>
              {product.sku} - {product.name}
            </option>
          ))}
        </select>
        <select
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 shadow-sm min-w-[160px]"
        >
          <option value={25}>Ultimos 25</option>
          <option value={50}>Ultimos 50</option>
          <option value={100}>Ultimos 100</option>
          <option value={200}>Ultimos 200</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Cargando...</p>
          </div>
        ) : selectedProduct === 'all' ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">Seleccione un producto</h3>
            <p className="text-slate-500 text-sm">Elija un producto del selector para ver su historial de movimientos</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Cargando movimientos...</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">Sin movimientos</h3>
            <p className="text-slate-500 text-sm">No hay movimientos registrados para este producto</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Origen</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Destino</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Referencia</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usuario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((movement) => (
                  <tr key={movement.id_movement} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMovementTypeBadge(movement.movement_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{movement.sku}</div>
                      <div className="text-xs text-slate-500">{movement.product_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${['entry', 'return'].includes(movement.movement_type) ? 'text-emerald-600' : 'text-red-600'}`}>
                        {['entry', 'return'].includes(movement.movement_type) ? '+' : '-'}{formatQty(movement.quantity)}
                      </span>
                      <span className="text-slate-500 ml-1">{movement.unit_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {movement.origin_name || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {movement.destination_name || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {movement.reference_number || <span className="text-slate-400 italic">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {movement.first_name && movement.last_name
                        ? `${movement.first_name} ${movement.last_name}`
                        : `ID: ${movement.created_by}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {movements.length > 0 && (
        <div className="mt-4 text-sm text-slate-500">
          Mostrando {movements.length} movimientos
        </div>
      )}
    </div>
  )
}
