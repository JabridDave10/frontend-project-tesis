'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AxiosSales } from '@/services/axiosSales'
import { AxiosClients } from '@/services/axiosClients'
import { productsService } from '@/services/productsService'
import { CreateSaleDto, CreateSaleDetailDto } from '@/types/saleTypes'
import { Client } from '@/types/clientTypes'
import { Product } from '@/types/productTypes'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingCart, User, Package, Plus, Trash2, DollarSign, X } from 'lucide-react'

interface SaleDetailForm extends Omit<CreateSaleDetailDto, 'subtotal'> {
  subtotal: number
  product_name?: string
  product_sku?: string
}

export function AddSaleView() {
  const router = useRouter()
  const salesService = new AxiosSales()
  const clientsService = new AxiosClients()
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('')
  const [saleDetails, setSaleDetails] = useState<SaleDetailForm[]>([])
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('')

  const [saleData, setSaleData] = useState<Omit<CreateSaleDto, 'details' | 'id_client' | 'subtotal' | 'total'>>({
    sale_number: '',
    id_company: 1, // TODO: Obtener del usuario logueado
    id_user: 1, // TODO: Obtener del usuario logueado
    id_route: undefined,
    discount: 0,
    tax: 0,
    status: 'pendiente',
    payment_method: '',
    payment_status: 'pendiente',
    notes: ''
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      const [clientsData, productsData] = await Promise.all([
        clientsService.getAllClients(),
        productsService.getAllProducts()
      ])
      setClients(clientsData)
      setProducts(productsData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    }
  }

  const calculateSubtotal = (detail: SaleDetailForm): number => {
    const baseSubtotal = detail.quantity * detail.unit_price
    return baseSubtotal - (detail.discount || 0)
  }

  const calculateTotals = () => {
    const subtotal = saleDetails.reduce((sum, detail) => sum + calculateSubtotal(detail), 0)
    // Asegurar que discount y tax sean números
    const discount = Number(saleData.discount) || 0
    const tax = Number(saleData.tax) || 0
    const total = subtotal - discount + tax
    return { subtotal, discount, tax, total }
  }

  const handleAddProduct = () => {
    if (!selectedProductId) return

    const product = products.find(p => p.id_product === Number(selectedProductId))
    if (!product) return

    // Verificar si el producto ya está agregado
    const existingIndex = saleDetails.findIndex(d => d.id_product === product.id_product)
    if (existingIndex >= 0) {
      // Si ya existe, aumentar la cantidad
      const updated = [...saleDetails]
      updated[existingIndex].quantity += 1
      updated[existingIndex].subtotal = calculateSubtotal(updated[existingIndex])
      setSaleDetails(updated)
    } else {
      // Agregar nuevo producto
      const newDetail: SaleDetailForm = {
        id_product: product.id_product,
        id_batch: undefined,
        quantity: 1,
        unit_type: product.primary_unit_type || 'unit',
        unit_price: 0, // El usuario debe ingresar el precio
        discount: 0,
        subtotal: 0,
        notes: '',
        product_name: product.name,
        product_sku: product.sku
      }
      setSaleDetails([...saleDetails, newDetail])
    }
    setSelectedProductId('')
  }

  const handleRemoveProduct = (index: number) => {
    setSaleDetails(saleDetails.filter((_, i) => i !== index))
  }

  const handleDetailChange = (index: number, field: keyof SaleDetailForm, value: any) => {
    const updated = [...saleDetails]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    // Recalcular subtotal si cambia cantidad, precio o descuento
    if (field === 'quantity' || field === 'unit_price' || field === 'discount') {
      updated[index].subtotal = calculateSubtotal(updated[index])
    }
    setSaleDetails(updated)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSaleData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : (name === 'id_route' || name === 'discount' || name === 'tax' ? Number(value) : value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId) {
      alert('Por favor selecciona un cliente')
      return
    }

    if (saleDetails.length === 0) {
      alert('Por favor agrega al menos un producto')
      return
    }

    // Validar que todos los detalles tengan precio
    const invalidDetails = saleDetails.filter(d => !d.unit_price || d.unit_price <= 0)
    if (invalidDetails.length > 0) {
      alert('Por favor ingresa el precio unitario para todos los productos')
      return
    }

    const { subtotal, total } = calculateTotals()

    const salePayload: CreateSaleDto = {
      ...saleData,
      id_client: Number(selectedClientId),
      subtotal,
      total,
      details: saleDetails.map(d => ({
        id_product: d.id_product,
        id_batch: d.id_batch,
        quantity: d.quantity,
        unit_type: d.unit_type,
        unit_price: d.unit_price,
        discount: d.discount || 0,
        subtotal: d.subtotal,
        notes: d.notes
      }))
    }

    setIsLoading(true)
    try {
      const result = await salesService.createSale(salePayload)
      if (result) {
        router.push('/dashboard/ventas')
      }
    } catch (error) {
      console.error('Error al crear venta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const { subtotal, discount, tax, total } = calculateTotals()

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Nueva Venta
          </h1>
          <p className="text-gray-600">Complete la información de la venta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Información Básica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    id="client"
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map((client) => (
                      <option key={client.id_client} value={client.id_client}>
                        {client.name} - {client.identification}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="sale_number">Número de Venta</Label>
                <Input
                  id="sale_number"
                  type="text"
                  name="sale_number"
                  value={saleData.sale_number || ''}
                  onChange={handleInputChange}
                  placeholder="Opcional"
                />
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  name="status"
                  value={saleData.status || 'pendiente'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="procesando">Procesando</option>
                </select>
              </div>

              <div>
                <Label htmlFor="payment_method">Método de Pago</Label>
                <Input
                  id="payment_method"
                  type="text"
                  name="payment_method"
                  value={saleData.payment_method || ''}
                  onChange={handleInputChange}
                  placeholder="Efectivo, Tarjeta, etc."
                />
              </div>

              <div>
                <Label htmlFor="payment_status">Estado de Pago</Label>
                <select
                  id="payment_status"
                  name="payment_status"
                  value={saleData.payment_status || 'pendiente'}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pagado">Pagado</option>
                  <option value="parcial">Parcial</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="notes">Notas</Label>
              <textarea
                id="notes"
                name="notes"
                value={saleData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notas adicionales sobre la venta..."
              />
            </div>
          </Card>

          {/* Productos */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Productos
            </h2>

            {/* Agregar Producto */}
            <div className="mb-4 flex gap-2">
              <div className="flex-1">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un producto</option>
                  {products.map((product) => (
                    <option key={product.id_product} value={product.id_product}>
                      {product.name} - {product.sku}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="button" onClick={handleAddProduct} disabled={!selectedProductId}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>

            {/* Lista de Productos */}
            {saleDetails.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay productos agregados</p>
            ) : (
              <div className="space-y-4">
                {saleDetails.map((detail, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-800">{detail.product_name}</h3>
                        <p className="text-sm text-gray-500">SKU: {detail.product_sku}</p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRemoveProduct(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <Label>Cantidad *</Label>
                        <Input
                          type="number"
                          min="0.001"
                          step="0.001"
                          value={detail.quantity}
                          onChange={(e) => handleDetailChange(index, 'quantity', Number(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <Label>Unidad</Label>
                        <Input
                          type="text"
                          value={detail.unit_type}
                          onChange={(e) => handleDetailChange(index, 'unit_type', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Precio Unitario *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={detail.unit_price}
                          onChange={(e) => handleDetailChange(index, 'unit_price', Number(e.target.value))}
                          required
                        />
                      </div>
                      <div>
                        <Label>Descuento</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={detail.discount || 0}
                          onChange={(e) => handleDetailChange(index, 'discount', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Subtotal</Label>
                        <div className="flex items-center px-3 py-2 bg-gray-100 rounded-md">
                          <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                          <span className="font-medium">{detail.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Resumen */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Resumen
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descuento General:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    name="discount"
                    value={saleData.discount || 0}
                    onChange={handleInputChange}
                    className="w-32"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impuesto:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    name="tax"
                    value={saleData.tax || 0}
                    onChange={handleInputChange}
                    className="w-32"
                  />
                </div>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{(total || 0).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/ventas')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || saleDetails.length === 0}>
              {isLoading ? 'Creando...' : 'Crear Venta'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

