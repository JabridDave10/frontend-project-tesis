'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { categoriesService } from '@/services/categoriesService'
import {
  UpdateProductCategoryDto,
  StorageType,
  STORAGE_TYPE_LABELS,
} from '@/types/productTypes'
import { ArrowLeft, Tag, Archive, Palette } from 'lucide-react'

interface EditCategoryViewProps {
  categoryId: number
}

export function EditCategoryView({ categoryId }: EditCategoryViewProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [categoryData, setCategoryData] = useState<UpdateProductCategoryDto>({
    name: '',
    description: '',
    default_storage_type: undefined,
    icon: '',
    color: '#3B82F6',
  })

  useEffect(() => {
    loadCategory()
  }, [categoryId])

  const loadCategory = async () => {
    setIsFetching(true)
    try {
      const category = await categoriesService.getCategoryById(categoryId)
      if (category) {
        setCategoryData({
          name: category.name,
          description: category.description || '',
          default_storage_type: category.default_storage_type || undefined,
          icon: category.icon || '',
          color: category.color || '#3B82F6',
        })
      }
    } catch (error) {
      console.error('Error al cargar categoria:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setCategoryData((prev) => ({
      ...prev,
      [name]: name === 'default_storage_type' && value === '' ? undefined : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await categoriesService.updateCategory(categoryId, categoryData)
      if (result) {
        router.push('/dashboard/productos/categorias')
      }
    } catch (error) {
      console.error('Error al actualizar categoria:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-800 placeholder:text-slate-400"
  const selectClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-700"
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5"

  if (isFetching) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando categoria...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/productos/categorias')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a categorias</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Editar Categoria</h1>
          <p className="text-slate-500 text-sm mt-1">Modifique la informacion de la categoria</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Basica */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Informacion Basica</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" name="name" value={categoryData.name} onChange={handleInputChange} placeholder="Nombre de la categoria" required maxLength={100} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Descripcion</label>
                <textarea name="description" value={categoryData.description} onChange={handleInputChange} placeholder="Descripcion de la categoria" rows={3} maxLength={500} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>

          {/* Almacenamiento */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Archive className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Almacenamiento</h2>
            </div>
            <div>
              <label className={labelClass}>Tipo de almacenamiento por defecto</label>
              <select name="default_storage_type" value={categoryData.default_storage_type || ''} onChange={handleInputChange} className={selectClass}>
                <option value="">Ninguno</option>
                {Object.values(StorageType).map((type) => (
                  <option key={type} value={type}>{STORAGE_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Personalizacion */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Personalizacion</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Icono (emoji)</label>
                <input type="text" name="icon" value={categoryData.icon} onChange={handleInputChange} placeholder="Ej: 📦 🍕 🥤" maxLength={50} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" name="color" value={categoryData.color} onChange={handleInputChange} className="h-[42px] w-16 rounded-xl border border-slate-200/60 cursor-pointer" />
                  <input type="text" name="color" value={categoryData.color} onChange={handleInputChange} placeholder="#3B82F6" maxLength={7} className={`${inputClass} flex-1`} />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Vista previa</p>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border border-slate-200" style={{ backgroundColor: categoryData.color }} />
                <span className="text-base font-medium text-slate-800">
                  {categoryData.icon && <span className="mr-1.5">{categoryData.icon}</span>}
                  {categoryData.name || 'Nombre de la categoria'}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard/productos/categorias')}
              disabled={isLoading}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
