'use client'

import { useState, useEffect } from 'react'
import { warehouseService } from '@/services/warehouseService'
import { getCompanyId } from '@/hooks/useCompanyId'
import { Warehouse } from '@/types/productTypes'
import { Plus, Search, Pencil, Trash2, Warehouse as WarehouseIcon, X } from 'lucide-react'

export function WarehousesListView() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState({ name: '', address: '' })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadWarehouses()
  }, [])

  const loadWarehouses = async () => {
    setIsLoading(true)
    const data = await warehouseService.getAllWarehouses()
    setWarehouses(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Estas seguro de eliminar esta bodega?')) {
      const success = await warehouseService.deleteWarehouse(id)
      if (success) {
        loadWarehouses()
      }
    }
  }

  const openAddModal = () => {
    setEditingWarehouse(null)
    setFormData({ name: '', address: '' })
    setShowModal(true)
  }

  const openEditModal = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    setFormData({ name: warehouse.name, address: warehouse.address })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingWarehouse) {
        const result = await warehouseService.updateWarehouse(editingWarehouse.id_warehouse, formData)
        if (result) {
          setShowModal(false)
          loadWarehouses()
        }
      } else {
        const result = await warehouseService.createWarehouse({
          ...formData,
          id_company: getCompanyId(),
        })
        if (result) {
          setShowModal(false)
          loadWarehouses()
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const filteredWarehouses = warehouses.filter(
    (w) =>
      w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: number) => {
    if (status === 1) return { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Activa' }
    return { className: 'bg-slate-100 text-slate-500 border-slate-200', label: 'Inactiva' }
  }

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bodegas</h1>
          <p className="text-slate-500 text-sm mt-1">{warehouses.length} bodega{warehouses.length !== 1 ? 's' : ''} registrada{warehouses.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Bodega
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o direccion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Cargando bodegas...</p>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <WarehouseIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No hay bodegas</h3>
            <p className="text-slate-500 text-sm mb-4">
              {searchTerm ? 'No se encontraron resultados' : 'Agrega tu primera bodega'}
            </p>
            {!searchTerm && (
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all"
              >
                Agregar Bodega
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Direccion</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWarehouses.map((warehouse) => {
                  const status = getStatusBadge(warehouse.id_status)
                  const stockCount = parseInt(String(warehouse.stock_count)) || 0
                  return (
                    <tr key={warehouse.id_warehouse} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-800">{warehouse.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{warehouse.address}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-lg border ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                          {stockCount} items
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(warehouse)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(warehouse.id_warehouse)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={stockCount > 0 ? 'No se puede eliminar (tiene stock)' : 'Eliminar'}
                            disabled={stockCount > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingWarehouse ? 'Editar Bodega' : 'Agregar Bodega'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Bodega Principal"
                  required
                  maxLength={200}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Direccion *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ej: Av. Principal 123, Ciudad"
                  required
                  maxLength={500}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : editingWarehouse ? 'Guardar' : 'Crear Bodega'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
