'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { categoriesService } from '@/services/categoriesService'
import { ProductCategory, STORAGE_TYPE_LABELS } from '@/types/productTypes'
import { Plus, Search, Pencil, Trash2, Tag } from 'lucide-react'

export function CategoriesListView() {
  const router = useRouter()
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    const data = await categoriesService.getAllCategories()
    setCategories(data)
    setIsLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Estas seguro de eliminar esta categoria?')) {
      const success = await categoriesService.deleteCategory(id)
      if (success) {
        loadCategories()
      }
    }
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categorias</h1>
          <p className="text-slate-500 text-sm mt-1">{categories.length} categoria{categories.length !== 1 ? 's' : ''} registrada{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/productos/categorias/agregar')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Categoria
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar categoria..."
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
            <p className="text-slate-500">Cargando categorias...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No hay categorias</h3>
            <p className="text-slate-500 text-sm mb-4">
              {searchTerm ? 'No se encontraron resultados' : 'Agrega tu primera categoria'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/dashboard/productos/categorias/agregar')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all"
              >
                Agregar Categoria
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripcion</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Almacenamiento</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Productos</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id_category} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {category.color && (
                          <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: category.color }} />
                        )}
                        <span className="text-sm font-medium text-slate-800">
                          {category.icon && <span className="mr-1.5">{category.icon}</span>}
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500 max-w-xs truncate">
                        {category.description || <span className="text-slate-400 italic">Sin descripcion</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.default_storage_type ? (
                        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700">
                          {STORAGE_TYPE_LABELS[category.default_storage_type]}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {category.product_count || 0} productos
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/productos/categorias/editar/${category.id_category}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id_category)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={
                            (category.product_count || 0) > 0
                              ? 'No se puede eliminar porque tiene productos'
                              : 'Eliminar categoria'
                          }
                          disabled={(category.product_count || 0) > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
