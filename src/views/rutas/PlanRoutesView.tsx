'use client'

import { useState, useEffect } from 'react'
import { RouteOptimizationService } from '@/services/routeOptimizationService'
import { VehiclesService } from '@/services/vehiclesService'
import { DriversService } from '@/services/driversService'
import { ProductsService } from '@/services/productsService'
import { RoutesService } from '@/services/routesService'
import { warehouseService } from '@/services/warehouseService'
import { AxiosClients } from '@/services/axiosClients'
import { AxiosSales } from '@/services/axiosSales'
import { OptimizedRoute } from '@/types/cargoTypes'
import { Vehicle } from '@/types/vehicleTypes'
import { Driver } from '@/types/driverTypes'
import { Product, Warehouse } from '@/types/productTypes'
import { Client } from '@/types/clientTypes'
import { Sale } from '@/types/saleTypes'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import dynamic from 'next/dynamic'
import {
  MapPin, Package, Truck, Route, Loader2, ShoppingCart, CheckCircle2,
  Warehouse as WarehouseIcon, ChevronRight, ChevronLeft, Save, RotateCcw,
  Weight, Box, DollarSign, Clock, Navigation
} from 'lucide-react'
import { toast } from 'react-toastify'

const OptimizedRouteMap = dynamic(() => import('@/components/map/OptimizedRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Cargando mapa...</p>
      </div>
    </div>
  )
})

interface SaleWithClient extends Sale {
  client?: Client
  destination_address?: string
  destination_latitude?: number
  destination_longitude?: number
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount)

export const PlanRoutesView = () => {
  const [step, setStep] = useState<'sales' | 'vehicles' | 'optimize' | 'results'>('sales')
  const [isLoading, setIsLoading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Origen (bodega)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(0)
  const [originAddress, setOriginAddress] = useState('')
  const [originLat, setOriginLat] = useState<number>(0)
  const [originLng, setOriginLng] = useState<number>(0)
  const [isGeocodingOrigin, setIsGeocodingOrigin] = useState(false)

  // Selecciones
  const [selectedSales, setSelectedSales] = useState<number[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([])

  // Datos cargados
  const [sales, setSales] = useState<SaleWithClient[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])

  // Resultados
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([])

  const routeOptimizationService = new RouteOptimizationService()
  const vehiclesService = new VehiclesService()
  const driversService = new DriversService()
  const productsService = new ProductsService()
  const routesService = new RoutesService()
  const clientsService = new AxiosClients()
  const salesService = new AxiosSales()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      const [salesData, vehiclesData, driversData, clientsData, productsData, warehousesData] = await Promise.all([
        salesService.getAllSales(),
        vehiclesService.getAvailableVehicles(),
        driversService.getAvailableDrivers(),
        clientsService.getAllClients(),
        productsService.getAllProducts(),
        warehouseService.getAllWarehouses()
      ])

      const pendingSales = salesData.filter(sale => !sale.id_route && (sale.status === 'pendiente' || !sale.status))

      const salesWithClients: SaleWithClient[] = pendingSales.map(sale => {
        const client = clientsData.find(c => c.id_client === sale.id_client)
        return {
          ...sale,
          client,
          destination_address: client?.address,
          destination_latitude: undefined,
          destination_longitude: undefined
        }
      })

      setSales(salesWithClients)
      setProducts(productsData)
      setWarehouses(warehousesData)

      let finalVehicles = vehiclesData
      if (vehiclesData.length === 0) {
        finalVehicles = await vehiclesService.getAllVehicles()
        if (finalVehicles.length === 0) {
          toast.warning('No hay vehiculos registrados. Agrega vehiculos primero.')
        }
      }
      setVehicles(finalVehicles)
      setDrivers(driversData)
      setClients(clientsData)

      if (salesWithClients.length === 0) {
        toast.info('No hay ventas pendientes para planificar rutas')
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar los datos iniciales')
    } finally {
      setIsLoading(false)
    }
  }

  // Geocodificar dirección de la bodega seleccionada
  const handleWarehouseSelect = async (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId)
    if (warehouseId === 0) {
      setOriginAddress('')
      setOriginLat(0)
      setOriginLng(0)
      return
    }

    const warehouse = warehouses.find(w => w.id_warehouse === warehouseId)
    if (!warehouse) return

    setOriginAddress(warehouse.address)
    setIsGeocodingOrigin(true)

    try {
      const coords = await geocodeAddress(warehouse.address)
      if (coords) {
        setOriginLat(coords.lat)
        setOriginLng(coords.lng)
      } else {
        toast.warning('No se pudieron obtener coordenadas para la bodega. Verifica la direccion.')
        setOriginLat(0)
        setOriginLng(0)
      }
    } finally {
      setIsGeocodingOrigin(false)
    }
  }

  const handleSaleToggle = (saleId: number) => {
    setSelectedSales(prev =>
      prev.includes(saleId) ? prev.filter(id => id !== saleId) : [...prev, saleId]
    )
  }

  const handleVehicleToggle = (vehicleId: number) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicleId) ? prev.filter(id => id !== vehicleId) : [...prev, vehicleId]
    )
  }

  const calculateTotalWeight = (): number => {
    const selectedSalesData = sales.filter(s => selectedSales.includes(s.id_sale))
    let totalWeight = 0
    selectedSalesData.forEach(sale => {
      if (sale.details) {
        sale.details.forEach(detail => {
          const product = products.find(p => p.id_product === detail.id_product)
          if (product && product.weight_per_unit) totalWeight += product.weight_per_unit * detail.quantity
        })
      }
    })
    return totalWeight
  }

  const calculateTotalVolume = (): number => {
    const selectedSalesData = sales.filter(s => selectedSales.includes(s.id_sale))
    let totalVolume = 0
    selectedSalesData.forEach(sale => {
      if (sale.details) {
        sale.details.forEach(detail => {
          const product = products.find(p => p.id_product === detail.id_product)
          if (product && product.volume_per_unit) totalVolume += product.volume_per_unit * detail.quantity
        })
      }
    })
    return totalVolume
  }

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const searchQuery = `${address}, Colombia`
      const viewbox = '-74.3,4.4,-73.9,4.9'
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1&viewbox=${viewbox}&bounded=0&countrycodes=co`
      const response = await fetch(url, { headers: { 'User-Agent': 'RoutePlanningApp/1.0' } })
      const data = await response.json()
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      }
      return null
    } catch (error) {
      console.error('Error al geocodificar direccion:', error)
      return null
    }
  }

  const handleOptimize = async () => {
    if (selectedSales.length === 0) { toast.error('Selecciona al menos una venta'); return }
    if (selectedVehicles.length === 0) { toast.error('Selecciona al menos un vehiculo'); return }
    if (!selectedWarehouseId) { toast.error('Selecciona una bodega de origen'); return }
    if (!originLat || !originLng) {
      toast.error('La bodega seleccionada no tiene coordenadas validas. Verifica la direccion.')
      return
    }

    setIsOptimizing(true)
    setStep('optimize')

    try {
      const selectedSalesData = sales.filter(s => selectedSales.includes(s.id_sale))

      toast.info('Obteniendo coordenadas de las direcciones...')
      const salesWithCoords = await Promise.all(
        selectedSalesData.map(async (sale) => {
          if (!sale.destination_address) {
            toast.warning(`La venta ${sale.sale_number || sale.id_sale} no tiene direccion de cliente`)
            return null
          }
          if (sale.destination_latitude && sale.destination_longitude) return sale
          const coords = await geocodeAddress(sale.destination_address)
          if (coords) {
            return { ...sale, destination_latitude: coords.lat, destination_longitude: coords.lng }
          }
          toast.warning(`No se obtuvieron coordenadas para: ${sale.destination_address}`)
          return null
        })
      )

      const validSales = salesWithCoords.filter(
        (s): s is SaleWithClient => s !== null && s.destination_latitude !== undefined && s.destination_longitude !== undefined
      )

      if (validSales.length === 0) {
        toast.error('No se obtuvieron coordenadas validas para ninguna venta.')
        setIsOptimizing(false)
        setStep('sales')
        return
      }

      const now = new Date().toISOString()
      const cargos = validSales.map((sale) => {
        let totalWeight = 0
        let totalVolume = 0
        const productDescriptions: string[] = []

        if (sale.details) {
          sale.details.forEach(detail => {
            const product = products.find(p => p.id_product === detail.id_product)
            if (product) {
              totalWeight += (product.weight_per_unit || 0) * detail.quantity
              totalVolume += (product.volume_per_unit || 0) * detail.quantity
              productDescriptions.push(`${product.name} (${detail.quantity})`)
            }
          })
        }

        return {
          id_cargo: sale.id_sale,
          id_company: sale.id_company,
          description: `Venta ${sale.sale_number || sale.id_sale}: ${productDescriptions.join(', ')}`,
          weight: totalWeight,
          volume: totalVolume,
          destination_address: sale.destination_address || sale.client?.address || '',
          destination_latitude: sale.destination_latitude!,
          destination_longitude: sale.destination_longitude!,
          recipient_name: sale.client?.name || sale.client_name || '',
          recipient_phone: sale.client?.phone || '',
          priority: 'media' as const,
          status: 'pendiente' as const,
          created_at: now,
          modified_at: now
        }
      })

      const selectedVehiclesData = vehicles.filter(v => selectedVehicles.includes(v.id_vehicle))

      if (cargos.length === 0) {
        toast.error('No hay cargos validos para optimizar.')
        setIsOptimizing(false)
        setStep('sales')
        return
      }

      const optimized = await routeOptimizationService.assignCargosToVehicles(
        cargos,
        selectedVehiclesData,
        drivers,
        { lat: originLat, lng: originLng, address: originAddress }
      )

      if (optimized.length === 0) {
        const maxCapacity = selectedVehiclesData.reduce((max, v) => Math.max(max, v.weight_capacity), 0)
        toast.error(
          `No se generaron rutas. Verifica capacidad (max: ${maxCapacity}kg), direcciones y disponibilidad.`,
          { autoClose: 5000 }
        )
        setIsOptimizing(false)
        setStep('vehicles')
        return
      }

      setOptimizedRoutes(optimized)
      setStep('results')
      toast.success(`Se optimizaron ${optimized.length} ruta(s)`)
    } catch (error) {
      console.error('Error al optimizar rutas:', error)
      toast.error('Error al optimizar las rutas')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleSaveRoutes = async () => {
    setIsLoading(true)
    try {
      for (const route of optimizedRoutes) {
        await routesService.createRoute({
          route_code: route.route_code,
          id_driver: route.id_driver === 0 ? undefined : route.id_driver,
          id_vehicle: route.id_vehicle,
          origin_address: route.origin_address,
          origin_latitude: route.origin_latitude,
          origin_longitude: route.origin_longitude,
          destination_address: route.assignments[0]?.cargo.destination_address || '',
          destination_latitude: route.assignments[0]?.cargo.destination_latitude,
          destination_longitude: route.assignments[0]?.cargo.destination_longitude,
          cargo_weight: route.total_weight,
          cargo_volume: route.total_volume,
          cargo_description: route.assignments.map(a => a.cargo.description).join('; '),
          status: 'pendiente',
          estimated_distance: route.total_distance,
          estimated_duration: route.total_duration
        })
      }

      toast.success('Rutas guardadas exitosamente')
      setSelectedSales([])
      setSelectedVehicles([])
      setOptimizedRoutes([])
      setStep('sales')
      await loadInitialData()
    } catch (error) {
      console.error('Error al guardar rutas:', error)
      toast.error('Error al guardar las rutas')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = ['sales', 'vehicles', 'optimize', 'results'] as const
  const stepLabels = ['Ventas', 'Vehiculos', 'Optimizando', 'Resultados']
  const stepIcons = [ShoppingCart, Truck, Loader2, Route]
  const currentStepIndex = steps.indexOf(step)

  const selectedSalesTotal = sales
    .filter(s => selectedSales.includes(s.id_sale))
    .reduce((sum, sale) => sum + (Number(sale.total) || 0), 0)

  const selectedWarehouse = warehouses.find(w => w.id_warehouse === selectedWarehouseId)

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Planificar Rutas</h1>
        <p className="text-slate-500 text-sm mt-1">Optimiza la distribucion de carga entre vehiculos</p>
      </div>

      {/* Stepper */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => {
            const Icon = stepIcons[index]
            const isActive = step === s
            const isCompleted = currentStepIndex > index
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/25'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive && s === 'optimize' ? 'animate-spin' : ''}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {stepLabels[index]}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all ${isCompleted ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Loading inicial */}
      {isLoading && sales.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-12 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Cargando datos...</p>
        </div>
      )}

      {/* ===================== PASO 1: VENTAS ===================== */}
      {step === 'sales' && !isLoading && (
        <div className="space-y-6">
          {/* Bodega de origen */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <WarehouseIcon className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Bodega de Origen</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Selecciona la bodega</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => handleWarehouseSelect(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200/60 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-700 shadow-sm"
                >
                  <option value={0}>Seleccione una bodega...</option>
                  {warehouses.map((w) => (
                    <option key={w.id_warehouse} value={w.id_warehouse}>
                      {w.name} - {w.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Coordenadas</label>
                <div className="px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-sm">
                  {isGeocodingOrigin ? (
                    <span className="text-blue-600 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Geocodificando...
                    </span>
                  ) : originLat && originLng ? (
                    <span className="text-emerald-600 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {originLat.toFixed(6)}, {originLng.toFixed(6)}
                    </span>
                  ) : (
                    <span className="text-slate-400">Sin coordenadas</span>
                  )}
                </div>
              </div>
            </div>

            {selectedWarehouse && (
              <div className="mt-3 px-4 py-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-sm text-blue-700 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span><strong>{selectedWarehouse.name}</strong> &mdash; {selectedWarehouse.address}</span>
              </div>
            )}
          </div>

          {/* Ventas pendientes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Ventas Pendientes</h2>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                  {selectedSales.length} seleccionadas
                </span>
              </div>
            </div>

            {sales.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-1">Sin ventas pendientes</h3>
                <p className="text-slate-500 text-sm">No hay ventas pendientes para planificar rutas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((sale) => {
                  const isSelected = selectedSales.includes(sale.id_sale)
                  return (
                    <div
                      key={sale.id_sale}
                      className={`border rounded-xl p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-400 bg-blue-50/50 shadow-sm shadow-blue-500/10'
                          : 'border-slate-200/60 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div onClick={() => handleSaleToggle(sale.id_sale)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-800">
                                Venta {sale.sale_number || `#${sale.id_sale}`}
                              </h3>
                              {isSelected && <CheckCircle2 className="w-4.5 h-4.5 text-blue-600" />}
                              <span className="ml-auto text-sm font-bold text-slate-800">
                                {formatCurrency(Number(sale.total) || 0)}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600">
                              <p><span className="text-slate-400">Cliente:</span> {sale.client_name || sale.client?.name || 'N/A'}</p>
                              <p><span className="text-slate-400">Telefono:</span> {sale.client?.phone || 'N/A'}</p>
                              <p><span className="text-slate-400">Direccion:</span> {sale.destination_address || sale.client?.address || 'Sin direccion'}</p>
                            </div>
                            {sale.details && sale.details.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {sale.details.map((detail, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200/60">
                                    {detail.product_name || `Producto ${detail.id_product}`} x{detail.quantity}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Direccion de destino editable si esta seleccionada */}
                      {isSelected && (
                        <div className="mt-4 pt-4 border-t border-blue-200/60" onClick={(e) => e.stopPropagation()}>
                          <AddressAutocomplete
                            value={sale.destination_address || sale.client?.address || ''}
                            onChange={(address, lat, lng) => {
                              setSales(prev => prev.map(s =>
                                s.id_sale === sale.id_sale
                                  ? { ...s, destination_address: address, destination_latitude: lat, destination_longitude: lng }
                                  : s
                              ))
                            }}
                            placeholder="Buscar direccion de destino..."
                            label="Direccion de Destino"
                            required
                          />
                          {sale.destination_latitude && sale.destination_longitude && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {sale.destination_latitude.toFixed(6)}, {sale.destination_longitude.toFixed(6)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Resumen de carga */}
          {selectedSales.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Resumen de Carga
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Ventas</p>
                  <p className="text-lg font-bold text-slate-800">{selectedSales.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Valor Total</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedSalesTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Peso Estimado</p>
                  <p className="text-lg font-bold text-slate-800">{calculateTotalWeight().toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Volumen Estimado</p>
                  <p className="text-lg font-bold text-slate-800">{calculateTotalVolume().toFixed(1)} L</p>
                </div>
              </div>
            </div>
          )}

          {/* Boton siguiente */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (selectedSales.length === 0) { toast.error('Selecciona al menos una venta'); return }
                if (!selectedWarehouseId) { toast.error('Selecciona una bodega de origen'); return }
                if (!originLat || !originLng) { toast.error('La bodega no tiene coordenadas validas'); return }
                const selectedSalesData = sales.filter(s => selectedSales.includes(s.id_sale))
                const salesWithoutAddress = selectedSalesData.filter(s => !s.destination_address)
                if (salesWithoutAddress.length > 0) {
                  toast.error(`${salesWithoutAddress.length} venta(s) sin direccion de destino.`)
                  return
                }
                setStep('vehicles')
              }}
              disabled={selectedSales.length === 0 || !selectedWarehouseId}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente: Vehiculos
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================== PASO 2: VEHICULOS ===================== */}
      {step === 'vehicles' && (
        <div className="space-y-6">
          {/* Info de carga */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ventas</p>
              <p className="text-xl font-bold text-slate-800">{selectedSales.length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Valor Total</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(selectedSalesTotal)}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Peso</p>
              <p className="text-xl font-bold text-slate-800">{calculateTotalWeight().toFixed(1)} kg</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Origen</p>
              <p className="text-sm font-semibold text-blue-600 truncate">{selectedWarehouse?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Seleccion de vehiculos */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Truck className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Seleccionar Vehiculos</h2>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full border border-purple-100">
                {selectedVehicles.length} seleccionados
              </span>
            </div>

            {vehicles.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-1">Sin vehiculos</h3>
                <p className="text-slate-500 text-sm">No hay vehiculos disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((vehicle) => {
                  const isSelected = selectedVehicles.includes(vehicle.id_vehicle)
                  const canCarry = vehicle.weight_capacity >= calculateTotalWeight()
                  return (
                    <div
                      key={vehicle.id_vehicle}
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-400 bg-blue-50/50 shadow-sm shadow-blue-500/10'
                          : canCarry
                          ? 'border-slate-200/60 hover:border-slate-300 hover:bg-slate-50/50'
                          : 'border-slate-200/60 opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => canCarry && handleVehicleToggle(vehicle.id_vehicle)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-800">{vehicle.license_plate}</h3>
                          <p className="text-sm text-slate-500">{vehicle.brand} {vehicle.model}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Weight className="w-3.5 h-3.5" />
                          <span>Capacidad: <strong className="text-slate-700">{vehicle.weight_capacity} kg</strong></span>
                        </div>
                        {vehicle.volume_capacity && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Box className="w-3.5 h-3.5" />
                            <span>Volumen: <strong className="text-slate-700">{vehicle.volume_capacity} L</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Tipo: <strong className="text-slate-700">{vehicle.vehicle_type}</strong></span>
                        </div>
                        {!canCarry && (
                          <p className="text-xs text-red-500 font-medium mt-1">Capacidad insuficiente</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep('sales')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={handleOptimize}
              disabled={selectedVehicles.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Navigation className="w-4 h-4" />
              Optimizar Rutas
            </button>
          </div>
        </div>
      )}

      {/* ===================== PASO 3: OPTIMIZANDO ===================== */}
      {step === 'optimize' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Optimizando Rutas</h2>
            <p className="text-slate-500 text-sm">Calculando las mejores rutas con OSRM...</p>
            <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Geocodificando direcciones y calculando distancias</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================== PASO 4: RESULTADOS ===================== */}
      {step === 'results' && (
        <div className="space-y-6">
          {/* Resumen de rutas */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Route className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Rutas Optimizadas</h2>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-100">
                {optimizedRoutes.length} rutas
              </span>
            </div>

            <div className="space-y-4">
              {optimizedRoutes.map((route) => {
                const routeSalesValue = route.assignments.reduce((sum, a) => {
                  const sale = sales.find(s => s.id_sale === a.cargo.id_cargo)
                  return sum + (sale ? Number(sale.total) || 0 : 0)
                }, 0)
                const distance = typeof route.total_distance === 'number' && !isNaN(route.total_distance) ? route.total_distance : 0
                const duration = typeof route.total_duration === 'number' && !isNaN(route.total_duration) ? route.total_duration : 0

                return (
                  <div key={route.route_code} className="border border-slate-200/60 rounded-xl p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-800">{route.route_code}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">
                          Vehiculo: <strong>{route.assignments[0]?.vehicle.license_plate}</strong>
                          {' | '}
                          Conductor: <strong>
                            {route.id_driver === 0 || !route.id_driver
                              ? 'Sin asignar'
                              : `${route.assignments[0]?.driver.first_name} ${route.assignments[0]?.driver.last_name}`}
                          </strong>
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200">
                        {route.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                          <MapPin className="w-3 h-3" />
                          Paradas
                        </div>
                        <p className="font-bold text-slate-800">{route.assignments.length}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                          <Navigation className="w-3 h-3" />
                          Distancia
                        </div>
                        <p className="font-bold text-slate-800">{distance.toFixed(2)} km</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                          <Clock className="w-3 h-3" />
                          Duracion
                        </div>
                        <p className="font-bold text-slate-800">{duration.toFixed(0)} min</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                          <Weight className="w-3 h-3" />
                          Peso
                        </div>
                        <p className="font-bold text-slate-800">{route.total_weight.toFixed(1)} kg</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                          <DollarSign className="w-3 h-3" />
                          Valor Ventas
                        </div>
                        <p className="font-bold text-emerald-600">{formatCurrency(routeSalesValue)}</p>
                      </div>
                    </div>

                    {/* Paradas */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Paradas</p>
                      <div className="space-y-1.5">
                        {route.assignments.map((assignment, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="w-5 h-5 bg-blue-100 text-blue-700 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-slate-600 truncate">{assignment.cargo.destination_address}</span>
                            <span className="text-xs text-slate-400 flex-shrink-0">({assignment.cargo.weight} kg)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep('vehicles')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Volver
              </button>
              <button
                onClick={handleSaveRoutes}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Rutas
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mapa */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Visualizacion de Rutas
            </h2>
            {optimizedRoutes.length > 0 ? (
              <OptimizedRouteMap routes={optimizedRoutes} />
            ) : (
              <div className="w-full h-[600px] rounded-2xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-1">No hay rutas para mostrar</h3>
                <p className="text-slate-500 text-sm">Verifica ventas, direcciones y vehiculos</p>
                <button
                  onClick={() => setStep('vehicles')}
                  className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Volver a Optimizar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
