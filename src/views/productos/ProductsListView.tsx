'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { productsService } from '@/services/productsService'
import { categoriesService } from '@/services/categoriesService'
import { Product, ProductCategory } from '@/types/productTypes'
import { Plus, Search, Pencil, Trash2, Package, Snowflake, AlertTriangle, ShieldAlert, Tags } from 'lucide-react'

export function ProductsListView() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsService.getAllProducts(),
        categoriesService.getAllCategories(),
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Estas seguro de eliminar este producto?')) {
      const success = await productsService.deleteProduct(id)
      if (success) {
        loadData()
      }
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'null' && !product.id_category) ||
      product.id_category?.toString() === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} producto{products.length !== 1 ? 's' : ''} registrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/productos/agregar')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Producto
        </button>
      </div>

      {/* Search + Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o descripcion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 shadow-sm min-w-[200px]"
        >
          <option value="all">Todas las categorias</option>
          <option value="null">Sin categoria</option>
          {categories.map((category) => (
            <option key={category.id_category} value={category.id_category}>
              {category.icon ? `${category.icon} ` : ''}{category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 mb-1">No hay productos</h3>
            <p className="text-slate-500 text-sm mb-4">
              {searchTerm || selectedCategory !== 'all' ? 'No se encontraron resultados para tu busqueda' : 'Agrega tu primer producto para comenzar'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => router.push('/dashboard/productos/agregar')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all"
              >
                Agregar Producto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/60">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unidad</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Atributos</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id_product} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-800">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-slate-500 truncate max-w-xs">{product.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category_name ? (
                        <span className="text-sm text-slate-700">{product.category_name}</span>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Sin categoria</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">{product.primary_unit_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.requires_refrigeration && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                            <Snowflake className="w-3 h-3" /> Refrigerado
                          </span>
                        )}
                        {product.is_fragile && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" /> Fragil
                          </span>
                        )}
                        {product.is_hazardous && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200">
                            <ShieldAlert className="w-3 h-3" /> Peligroso
                          </span>
                        )}
                        {product.requires_batch_control && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                            <Tags className="w-3 h-3" /> Lote
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/dashboard/productos/editar/${product.id_product}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id_product)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
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
