'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { categoriesService } from '@/services/categoriesService';
import {
  CreateProductCategoryDto,
  StorageType,
  STORAGE_TYPE_LABELS,
} from '@/types/productTypes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AddCategoryView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [categoryData, setCategoryData] = useState<CreateProductCategoryDto>({
    id_company: 1, // TODO: Obtener del usuario logueado
    name: '',
    description: '',
    default_storage_type: undefined,
    icon: '',
    color: '#3B82F6', // Azul por defecto
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({
      ...prev,
      [name]: name === 'default_storage_type' && value === ''
        ? undefined
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await categoriesService.createCategory(categoryData);
      if (result) {
        router.push('/dashboard/productos/categorias');
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Agregar Categoría
          </h1>
          <p className="text-gray-600">
            Complete la información de la categoría de producto
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Información Básica
              </h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  name="name"
                  value={categoryData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre de la categoría *"
                  required
                  maxLength={100}
                />

                <textarea
                  name="description"
                  value={categoryData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción de la categoría"
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800 resize-none"
                />
              </div>
            </div>

            {/* Configuración de Almacenamiento */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Configuración de Almacenamiento
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de almacenamiento por defecto
                </label>
                <select
                  name="default_storage_type"
                  value={categoryData.default_storage_type || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                >
                  <option value="">Ninguno</option>
                  {Object.values(StorageType).map((type) => (
                    <option key={type} value={type}>
                      {STORAGE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Personalización */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Personalización
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icono (emoji)
                  </label>
                  <Input
                    type="text"
                    name="icon"
                    value={categoryData.icon}
                    onChange={handleInputChange}
                    placeholder="📦"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Puedes usar un emoji: 📦 🍕 🥤 🧊 etc.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="color"
                      value={categoryData.color}
                      onChange={handleInputChange}
                      className="h-10 w-20 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      name="color"
                      value={categoryData.color}
                      onChange={handleInputChange}
                      placeholder="#3B82F6"
                      maxLength={7}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: categoryData.color }}
                  ></div>
                  <span className="text-lg">
                    {categoryData.icon && <span className="mr-2">{categoryData.icon}</span>}
                    {categoryData.name || 'Nombre de la categoría'}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/productos/categorias')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Categoría'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
