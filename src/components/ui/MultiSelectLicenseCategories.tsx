'use client'

import { useState, useEffect } from 'react'
import { LicenseCategory, LICENSE_CATEGORY_LABELS } from '@/types/driverTypes'

interface MultiSelectLicenseCategoriesProps {
  selectedCategories: LicenseCategory[]
  onChange: (categories: LicenseCategory[]) => void
  required?: boolean
}

export const MultiSelectLicenseCategories = ({
  selectedCategories,
  onChange,
  required = true
}: MultiSelectLicenseCategoriesProps) => {
  const [error, setError] = useState<string | null>(null)

  const handleCategoryToggle = (category: LicenseCategory) => {
    let newCategories: LicenseCategory[]

    if (selectedCategories.includes(category)) {
      // Remover categoría
      newCategories = selectedCategories.filter(c => c !== category)
    } else {
      // Agregar categoría
      newCategories = [...selectedCategories, category]
    }

    onChange(newCategories)

    // Validar
    if (required && newCategories.length === 0) {
      setError('Debe seleccionar al menos una categoría de licencia')
    } else {
      setError(null)
    }
  }

  // Validar al montar si es requerido
  useEffect(() => {
    if (required && selectedCategories.length === 0) {
      setError('Debe seleccionar al menos una categoría de licencia')
    }
  }, [])

  const getCategoryTooltip = (category: LicenseCategory): string => {
    const tooltips: Record<LicenseCategory, string> = {
      [LicenseCategory.A1]: 'Permite conducir motocicletas, motociclos y mototriciclos de hasta 125 c.c.',
      [LicenseCategory.A2]: 'Permite conducir motocicletas, motociclos y mototriciclos de más de 125 c.c.',
      [LicenseCategory.B1]: 'Permite conducir automóviles, motocarros, cuatrimotos, camperos, camionetas y microbuses para servicio particular.',
      [LicenseCategory.B2]: 'Permite conducir camiones rígidos, busetas y buses para servicio particular.',
      [LicenseCategory.B3]: 'Permite conducir vehículos articulados para servicio particular.',
      [LicenseCategory.C1]: 'Permite conducir automóviles, motocarros, camionetas y microbuses para servicio público.',
      [LicenseCategory.C2]: 'Permite conducir camiones rígidos, busetas y buses para servicio público.',
      [LicenseCategory.C3]: 'Permite conducir vehículos articulados para servicio público.',
    }
    return tooltips[category]
  }

  const isPublicService = (category: LicenseCategory) => {
    return [LicenseCategory.C1, LicenseCategory.C2, LicenseCategory.C3].includes(category)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Categorías de Licencia
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <p className="text-xs text-gray-500 mb-3">
        Seleccione todas las categorías que posee el conductor. Puede seleccionar múltiples categorías.
      </p>

      <div className="space-y-2 border border-gray-200 rounded-lg p-4">
        {/* Categorías A - Motocicletas */}
        <div className="border-b border-gray-100 pb-3 mb-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">CATEGORÍA A - Motocicletas</p>
          <div className="space-y-2">
            {[LicenseCategory.A1, LicenseCategory.A2].map(category => (
              <label
                key={category}
                className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors group"
                title={getCategoryTooltip(category)}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {LICENSE_CATEGORY_LABELS[category]}
                  </span>
                  <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                    {getCategoryTooltip(category)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Categorías B - Servicio Particular */}
        <div className="border-b border-gray-100 pb-3 mb-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">CATEGORÍA B - Servicio Particular</p>
          <div className="space-y-2">
            {[LicenseCategory.B1, LicenseCategory.B2, LicenseCategory.B3].map(category => (
              <label
                key={category}
                className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors group"
                title={getCategoryTooltip(category)}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {LICENSE_CATEGORY_LABELS[category]}
                  </span>
                  <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                    {getCategoryTooltip(category)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Categorías C - Servicio Público */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">CATEGORÍA C - Servicio Público</p>
          <div className="space-y-2">
            {[LicenseCategory.C1, LicenseCategory.C2, LicenseCategory.C3].map(category => (
              <label
                key={category}
                className="flex items-start cursor-pointer hover:bg-green-50 p-2 rounded transition-colors group"
                title={getCategoryTooltip(category)}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {LICENSE_CATEGORY_LABELS[category]}
                  </span>
                  <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                    {getCategoryTooltip(category)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de selección */}
      {selectedCategories.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-900 mb-1">
            Categorías seleccionadas: {selectedCategories.length}
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedCategories.map(category => (
              <span
                key={category}
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  isPublicService(category)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}
