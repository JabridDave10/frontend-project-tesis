'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { stockService } from '@/services/stockService';
import { Stock } from '@/types/productTypes';
import { Button } from '@/components/ui/Button';

// TODO: Obtener de un servicio de bodegas
const WAREHOUSES = [
  { id: 1, name: 'Bodega Principal', location: 'Sede Central' },
  { id: 2, name: 'Bodega Norte', location: 'Zona Norte' },
  { id: 3, name: 'Bodega Sur', location: 'Zona Sur' },
];

export function StockListView() {
  const router = useRouter();
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadStock();
  }, [selectedWarehouse]);

  const loadStock = async () => {
    setIsLoading(true);
    const data = await stockService.getStockByWarehouse(selectedWarehouse);
    setStockItems(data);
    setIsLoading(false);
  };

  const filteredStock = stockItems.filter(
    (item) =>
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatusBadge = (available: number, reserved: number) => {
    const total = available + reserved;
    if (total === 0) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          Sin stock
        </span>
      );
    } else if (available === 0 && reserved > 0) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Todo reservado
        </span>
      );
    } else if (available > 0 && available <= 10) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
          Stock bajo
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Disponible
        </span>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Inventario / Stock
        </h1>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              router.push('/dashboard/productos/inventario/movimientos')
            }
          >
            Ver Movimientos
          </Button>
          <Button
            onClick={() =>
              router.push('/dashboard/productos/inventario/agregar-stock')
            }
          >
            Registrar Movimiento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bodega
          </label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {WAREHOUSES.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} - {warehouse.location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla de Stock */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reservado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Act.
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStock.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm
                      ? 'No se encontraron productos'
                      : 'No hay stock registrado en esta bodega'}
                  </td>
                </tr>
              ) : (
                filteredStock.map((item) => (
                  <tr key={item.id_stock} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-green-600">
                        {item.quantity_available.toLocaleString()}
                      </span>{' '}
                      <span className="text-gray-500">
                        {item.primary_unit_name || item.unit_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-yellow-600">
                        {item.reserved_quantity.toLocaleString()}
                      </span>{' '}
                      <span className="text-gray-500">
                        {item.primary_unit_name || item.unit_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold">
                        {(
                          item.quantity_available + item.reserved_quantity
                        ).toLocaleString()}
                      </span>{' '}
                      <span className="text-gray-500">
                        {item.primary_unit_name || item.unit_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStockStatusBadge(
                        item.quantity_available,
                        item.reserved_quantity
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <span>
          Mostrando {filteredStock.length} productos
        </span>
        <div className="flex gap-6">
          <span>
            Total Disponible:{' '}
            <span className="font-semibold text-green-600">
              {filteredStock
                .reduce((sum, item) => sum + item.quantity_available, 0)
                .toLocaleString()}
            </span>
          </span>
          <span>
            Total Reservado:{' '}
            <span className="font-semibold text-yellow-600">
              {filteredStock
                .reduce((sum, item) => sum + item.reserved_quantity, 0)
                .toLocaleString()}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
