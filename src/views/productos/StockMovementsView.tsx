'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { stockService } from '@/services/stockService';
import { productsService } from '@/services/productsService';
import { StockMovement, Product, MOVEMENT_TYPE_LABELS } from '@/types/productTypes';
import { Button } from '@/components/ui/button';

export function StockMovementsView() {
  const router = useRouter();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct && selectedProduct !== 'all') {
      loadMovements(parseInt(selectedProduct));
    }
  }, [selectedProduct, limit]);

  const loadData = async () => {
    setIsLoading(true);
    const productsData = await productsService.getAllProducts();
    setProducts(productsData);
    setIsLoading(false);
  };

  const loadMovements = async (productId: number) => {
    setIsLoading(true);
    const data = await stockService.getMovementHistory(productId, limit);
    setMovements(data);
    setIsLoading(false);
  };

  const getMovementTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      entry: 'bg-green-100 text-green-800',
      exit: 'bg-red-100 text-red-800',
      transfer: 'bg-blue-100 text-blue-800',
      adjustment: 'bg-purple-100 text-purple-800',
      reservation: 'bg-yellow-100 text-yellow-800',
      dispatch: 'bg-orange-100 text-orange-800',
      return: 'bg-teal-100 text-teal-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          typeColors[type] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {MOVEMENT_TYPE_LABELS[type as keyof typeof MOVEMENT_TYPE_LABELS] || type}
      </span>
    );
  };

  if (isLoading && products.length === 0) {
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
          Historial de Movimientos
        </h1>
        <Button
          variant="secondary"
          onClick={() => router.push('/dashboard/productos/inventario')}
        >
          Volver a Inventario
        </Button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Producto
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Seleccione un producto</option>
            {products.map((product) => (
              <option key={product.id_product} value={product.id_product}>
                {product.sku} - {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Límite de registros
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={25}>Últimos 25</option>
            <option value={50}>Últimos 50</option>
            <option value={100}>Últimos 100</option>
            <option value={200}>Últimos 200</option>
          </select>
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedProduct === 'all' ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Seleccione un producto para ver su historial de movimientos
                  </td>
                </tr>
              ) : isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No hay movimientos registrados para este producto
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id_movement} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getMovementTypeBadge(movement.movement_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.sku}
                      </div>
                      <div className="text-sm text-gray-500">
                        {movement.product_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-semibold ${
                          ['entry', 'return'].includes(movement.movement_type)
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {['entry', 'return'].includes(movement.movement_type)
                          ? '+'
                          : '-'}
                        {movement.quantity.toLocaleString()}
                      </span>{' '}
                      <span className="text-gray-500">
                        {movement.unit_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.origin_location || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.destination_location || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.reference_number || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.first_name && movement.last_name
                        ? `${movement.first_name} ${movement.last_name}`
                        : `ID: ${movement.created_by}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen */}
      {movements.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {movements.length} movimientos
        </div>
      )}
    </div>
  );
}
