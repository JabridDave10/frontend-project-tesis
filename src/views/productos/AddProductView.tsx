'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';
import {
  CreateProductDto,
  ProductCategory,
  UnitTypeEnum,
  UNIT_TYPE_LABELS,
} from '@/types/productTypes';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AddProductView() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  const [productData, setProductData] = useState<CreateProductDto>({
    id_company: 1, // TODO: Obtener del usuario logueado
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
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await categoriesService.getAllCategories();
    setCategories(data);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProductData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (
      [
        'weight_per_unit',
        'volume_per_unit',
        'width',
        'height',
        'length',
        'min_temperature',
        'max_temperature',
      ].includes(name)
    ) {
      setProductData((prev) => ({
        ...prev,
        [name]: value ? parseFloat(value) : undefined,
      }));
    } else if (name === 'id_category') {
      setProductData((prev) => ({
        ...prev,
        [name]: value ? parseInt(value) : undefined,
      }));
    } else {
      setProductData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await productsService.createProduct(productData);
      if (result) {
        router.push('/dashboard/productos');
      }
    } catch (error) {
      console.error('Error al crear producto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Agregar Producto
          </h1>
          <p className="text-gray-600">
            Complete la información del producto
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Información Básica
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                name="sku"
                value={productData.sku}
                onChange={handleInputChange}
                placeholder="SKU / Código *"
                required
                maxLength={50}
              />

              <Input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                placeholder="Nombre del producto *"
                required
                maxLength={200}
              />

              <div className="col-span-2">
                <select
                  name="id_category"
                  value={productData.id_category || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id_category} value={category.id_category}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                  placeholder="Descripción del producto"
                  rows={3}
                  maxLength={1000}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Unidades y Medidas */}
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              📏 Unidades y Medidas
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Unidad *
                </label>
                <select
                  name="primary_unit_type"
                  value={productData.primary_unit_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-800"
                >
                  {Object.values(UnitTypeEnum).map((type) => (
                    <option key={type} value={type}>
                      {UNIT_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                type="text"
                name="primary_unit_name"
                value={productData.primary_unit_name}
                onChange={handleInputChange}
                placeholder="Nombre de la unidad *"
                required
                maxLength={50}
              />

              <Input
                type="number"
                name="weight_per_unit"
                value={productData.weight_per_unit || ''}
                onChange={handleInputChange}
                placeholder="Peso por unidad (kg)"
                step="0.01"
                min="0"
              />

              <Input
                type="number"
                name="volume_per_unit"
                value={productData.volume_per_unit || ''}
                onChange={handleInputChange}
                placeholder="Volumen por unidad (L)"
                step="0.01"
                min="0"
              />

              <Input
                type="number"
                name="width"
                value={productData.width || ''}
                onChange={handleInputChange}
                placeholder="Ancho (cm)"
                step="0.01"
                min="0"
              />

              <Input
                type="number"
                name="height"
                value={productData.height || ''}
                onChange={handleInputChange}
                placeholder="Alto (cm)"
                step="0.01"
                min="0"
              />

              <Input
                type="number"
                name="length"
                value={productData.length || ''}
                onChange={handleInputChange}
                placeholder="Largo (cm)"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Almacenamiento */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ❄️ Almacenamiento y Temperatura
            </h2>

            <div className="mb-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requires_refrigeration"
                  checked={productData.requires_refrigeration}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">
                  Requiere refrigeración
                </span>
              </label>
            </div>

            {productData.requires_refrigeration && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Input
                  type="number"
                  name="min_temperature"
                  value={productData.min_temperature || ''}
                  onChange={handleInputChange}
                  placeholder="Temperatura mínima (°C)"
                  step="0.1"
                />

                <Input
                  type="number"
                  name="max_temperature"
                  value={productData.max_temperature || ''}
                  onChange={handleInputChange}
                  placeholder="Temperatura máxima (°C)"
                  step="0.1"
                />
              </div>
            )}
          </div>

          {/* Atributos del Producto */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ⚙️ Atributos del Producto
            </h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_fragile"
                  checked={productData.is_fragile}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
                />
                <span className="text-gray-700 font-medium">
                  📦 Producto frágil
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_hazardous"
                  checked={productData.is_hazardous}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                />
                <span className="text-gray-700 font-medium">
                  ⚠️ Material peligroso
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requires_batch_control"
                  checked={productData.requires_batch_control}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-700 font-medium">
                  🏷️ Requiere control de lotes
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requires_expiry_date"
                  checked={productData.requires_expiry_date}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-700 font-medium">
                  📅 Requiere fecha de vencimiento
                </span>
              </label>
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Notas Adicionales
            </h2>
            <textarea
              name="notes"
              value={productData.notes}
              onChange={handleInputChange}
              placeholder="Notas, observaciones o información adicional..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/productos')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
