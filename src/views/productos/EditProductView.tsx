'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { productsService } from '@/services/productsService'
import { categoriesService } from '@/services/categoriesService'
import {
  UpdateProductDto,
  ProductCategory,
  UnitTypeEnum,
  UNIT_TYPE_LABELS,
} from '@/types/productTypes'
import { ArrowLeft, Package, Ruler, Thermometer, Shield, FileText } from 'lucide-react'

interface EditProductViewProps {
  productId: number
}

export function EditProductView({ productId }: EditProductViewProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [categories, setCategories] = useState<ProductCategory[]>([])

  const [productData, setProductData] = useState<UpdateProductDto>({
    sku: '',
    name: '',
    description: '',
    primary_unit_type: UnitTypeEnum.UNIT,
    primary_unit_name: 'Unidad',
    id_category: undefined,
    weight_per_unit: undefined,
    volume_per_unit: undefined,
    width: undefined,
    height: undefined,
    length: undefined,
    requires_refrigeration: false,
    min_temperature: undefined,
    max_temperature: undefined,
    is_fragile: false,
    is_hazardous: false,
    requires_batch_control: false,
    requires_expiry_date: false,
    photo: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [productId])

  const loadData = async () => {
    setIsFetching(true)
    try {
      const [product, categoriesData] = await Promise.all([
        productsService.getProductById(productId),
        categoriesService.getAllCategories(),
      ])
      setCategories(categoriesData)

      if (product) {
        setProductData({
          sku: product.sku,
          name: product.name,
          description: product.description || '',
          primary_unit_type: product.primary_unit_type,
          primary_unit_name: product.primary_unit_name,
          id_category: product.id_category || undefined,
          weight_per_unit: product.weight_per_unit || undefined,
          volume_per_unit: product.volume_per_unit || undefined,
          width: product.width || undefined,
          height: product.height || undefined,
          length: product.length || undefined,
          requires_refrigeration: product.requires_refrigeration,
          min_temperature: product.min_temperature || undefined,
          max_temperature: product.max_temperature || undefined,
          is_fragile: product.is_fragile,
          is_hazardous: product.is_hazardous,
          requires_batch_control: product.requires_batch_control,
          requires_expiry_date: product.requires_expiry_date,
          photo: product.photo || '',
          notes: product.notes || '',
        })
      }
    } catch (error) {
      console.error('Error al cargar producto:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setProductData((prev) => ({ ...prev, [name]: checked }))
    } else if (
      ['weight_per_unit', 'volume_per_unit', 'width', 'height', 'length', 'min_temperature', 'max_temperature'].includes(name)
    ) {
      setProductData((prev) => ({ ...prev, [name]: value ? parseFloat(value) : undefined }))
    } else if (name === 'id_category') {
      setProductData((prev) => ({ ...prev, [name]: value ? parseInt(value) : undefined }))
    } else {
      setProductData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await productsService.updateProduct(productId, productData)
      if (result) {
        router.push('/dashboard/productos')
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error)
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
          <p className="text-slate-500">Cargando producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard/productos')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Volver a productos</span>
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Editar Producto</h1>
          <p className="text-slate-500 text-sm mt-1">Modifique la informacion del producto</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Basica */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Informacion Basica</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>SKU / Codigo *</label>
                <input type="text" name="sku" value={productData.sku} onChange={handleInputChange} placeholder="SKU-001" required maxLength={50} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nombre *</label>
                <input type="text" name="name" value={productData.name} onChange={handleInputChange} placeholder="Nombre del producto" required maxLength={200} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Categoria</label>
                <select name="id_category" value={productData.id_category || ''} onChange={handleInputChange} className={selectClass}>
                  <option value="">Sin categoria</option>
                  {categories.map((category) => (
                    <option key={category.id_category} value={category.id_category}>
                      {category.icon ? `${category.icon} ` : ''}{category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Descripcion</label>
                <textarea name="description" value={productData.description} onChange={handleInputChange} placeholder="Descripcion del producto" rows={3} maxLength={1000} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>

          {/* Unidades y Medidas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Ruler className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Unidades y Medidas</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo de Unidad *</label>
                <select name="primary_unit_type" value={productData.primary_unit_type} onChange={handleInputChange} required className={selectClass}>
                  {Object.values(UnitTypeEnum).map((type) => (
                    <option key={type} value={type}>{UNIT_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nombre de la unidad *</label>
                <input type="text" name="primary_unit_name" value={productData.primary_unit_name} onChange={handleInputChange} placeholder="Ej: Kilogramo, Litro" required maxLength={50} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Peso por unidad (kg)</label>
                <input type="number" name="weight_per_unit" value={productData.weight_per_unit || ''} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Volumen por unidad (L)</label>
                <input type="number" name="volume_per_unit" value={productData.volume_per_unit || ''} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ancho (cm)</label>
                <input type="number" name="width" value={productData.width || ''} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Alto (cm)</label>
                <input type="number" name="height" value={productData.height || ''} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Largo (cm)</label>
                <input type="number" name="length" value={productData.length || ''} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Almacenamiento */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-cyan-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Almacenamiento y Temperatura</h2>
            </div>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input type="checkbox" name="requires_refrigeration" checked={productData.requires_refrigeration} onChange={handleInputChange} className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500/20" />
              <span className="text-slate-700 font-medium">Requiere refrigeracion</span>
            </label>
            {productData.requires_refrigeration && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Temperatura minima (C)</label>
                  <input type="number" name="min_temperature" value={productData.min_temperature || ''} onChange={handleInputChange} placeholder="-18" step="0.1" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Temperatura maxima (C)</label>
                  <input type="number" name="max_temperature" value={productData.max_temperature || ''} onChange={handleInputChange} placeholder="4" step="0.1" className={inputClass} />
                </div>
              </div>
            )}
          </div>

          {/* Atributos */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Atributos</h2>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_fragile" checked={productData.is_fragile} onChange={handleInputChange} className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-2 focus:ring-amber-500/20" />
                <span className="text-slate-700 font-medium">Producto fragil</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_hazardous" checked={productData.is_hazardous} onChange={handleInputChange} className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-2 focus:ring-red-500/20" />
                <span className="text-slate-700 font-medium">Material peligroso</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="requires_batch_control" checked={productData.requires_batch_control} onChange={handleInputChange} className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-2 focus:ring-purple-500/20" />
                <span className="text-slate-700 font-medium">Requiere control de lotes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="requires_expiry_date" checked={productData.requires_expiry_date} onChange={handleInputChange} className="w-5 h-5 text-orange-600 border-slate-300 rounded focus:ring-2 focus:ring-orange-500/20" />
                <span className="text-slate-700 font-medium">Requiere fecha de vencimiento</span>
              </label>
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Notas</h2>
            </div>
            <textarea name="notes" value={productData.notes} onChange={handleInputChange} placeholder="Notas, observaciones o informacion adicional..." rows={4} maxLength={1000} className={`${inputClass} resize-none`} />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard/productos')}
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
