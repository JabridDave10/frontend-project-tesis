'use client'

import { useState, useEffect } from 'react'
import { RouteOptimizationService } from '@/services/routeOptimizationService'
import { VehiclesService } from '@/services/vehiclesService'
import { DriversService } from '@/services/driversService'
import { ProductsService } from '@/services/productsService'
import { CargoService } from '@/services/cargoService'
import { RoutesService } from '@/services/routesService'
import { AxiosClients } from '@/services/axiosClients'
import { AxiosSales } from '@/services/axiosSales'
import { OptimizedRoute } from '@/types/cargoTypes'
import { Vehicle } from '@/types/vehicleTypes'
import { Driver } from '@/types/driverTypes'
import { Product } from '@/types/productTypes'
import { Client } from '@/types/clientTypes'
import { Sale } from '@/types/saleTypes'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import dynamic from 'next/dynamic'
import { MapPin, Package, Truck, Route, Plus, X, Loader2, ShoppingCart, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'

// Importar el mapa de forma dinámica
const OptimizedRouteMap = dynamic(() => import('@/components/map/OptimizedRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  )
})

interface SaleWithClient extends Sale {
  client?: Client
  destination_address?: string
  destination_latitude?: number
  destination_longitude?: number
}

export const PlanRoutesView = () => {
  const [step, setStep] = useState<'sales' | 'vehicles' | 'optimize' | 'results'>('sales')
  const [isLoading, setIsLoading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Datos del formulario
  const [originAddress, setOriginAddress] = useState('')
  const [originLat, setOriginLat] = useState<number>(4.711) // Bogotá por defecto
  const [originLng, setOriginLng] = useState<number>(-74.072)
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
  const cargoService = new CargoService()
  const routesService = new RoutesService()
  const clientsService = new AxiosClients()
  const salesService = new AxiosSales()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      const [salesData, vehiclesData, driversData, clientsData, productsData] = await Promise.all([
        salesService.getAllSales(),
        vehiclesService.getAvailableVehicles(),
        driversService.getAvailableDrivers(),
        clientsService.getAllClients(),
        productsService.getAllProducts()
      ])
      
      // Filtrar ventas pendientes (sin ruta asignada o con status pendiente)
      const pendingSales = salesData.filter(sale => !sale.id_route && (sale.status === 'pendiente' || !sale.status))
      
      // Enriquecer ventas con información del cliente
      const salesWithClients: SaleWithClient[] = pendingSales.map(sale => {
        const client = clientsData.find(c => c.id_client === sale.id_client)
        return {
          ...sale,
          client,
          destination_address: client?.address,
          destination_latitude: undefined, // Se obtendrá con geocodificación
          destination_longitude: undefined
        }
      })
      
      setSales(salesWithClients)
      setProducts(productsData)
      
      // Si no hay vehículos disponibles, intentar obtener todos los vehículos
      let finalVehicles = vehiclesData
      if (vehiclesData.length === 0) {
        console.warn('No hay vehículos disponibles, obteniendo todos los vehículos')
        finalVehicles = await vehiclesService.getAllVehicles()
        if (finalVehicles.length === 0) {
          toast.warning('No hay vehículos registrados. Por favor, agrega vehículos primero.')
        } else {
          console.log(`Se encontraron ${finalVehicles.length} vehículos (no todos están disponibles)`)
        }
      }
      setVehicles(finalVehicles)
      
      setDrivers(driversData)
      setClients(clientsData)
      
      console.log('Datos cargados:', {
        sales: salesWithClients.length,
        vehicles: finalVehicles.length,
        drivers: driversData.length,
        clients: clientsData.length,
        products: productsData.length
      })
      
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

  const handleSaleToggle = (saleId: number) => {
    if (selectedSales.includes(saleId)) {
      setSelectedSales(selectedSales.filter(id => id !== saleId))
    } else {
      setSelectedSales([...selectedSales, saleId])
    }
  }

  const handleVehicleToggle = (vehicleId: number) => {
    if (selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId))
    } else {
      setSelectedVehicles([...selectedVehicles, vehicleId])
    }
  }

  // Calcular peso total de las ventas seleccionadas
  const calculateTotalWeight = (): number => {
    const selectedSalesData = sales.filter(s => selectedSales.includes(s.id_sale))
    let totalWeight = 0
    
    selectedSalesData.forEach(sale => {
      if (sale.details) {
        sale.details.forEach(detail => {
          const product = products.find(p => p.id_product === detail.id_product)
          if (product && product.weight_per_unit) {
            totalWeight += product.weight_per_unit * detail.quantity
          }
        })
      }
    })
    
    return totalWeight
  }

  // Calcular volumen total de las ventas seleccionadas
  const calculateTotalVolume = (): number => {
    const selectedSalesData = sales.filter(s => selectedSales.includes(s.id_sale))
    let totalVolume = 0
    
    selectedSalesData.forEach(sale => {
      if (sale.details) {
        sale.details.forEach(detail => {
          const product = products.find(p => p.id_product === detail.id_product)
          if (product && product.volume_per_unit) {
            totalVolume += product.volume_per_unit * detail.quantity
          }
        })
      }
    })
    
    return totalVolume
  }

  // Función auxiliar para geocodificar una dirección
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const searchQuery = `${address}, Bogotá, Colombia`
      const viewbox = '-74.3,4.4,-73.9,4.9'
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1&viewbox=${viewbox}&bounded=0&countrycodes=co`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RoutePlanningApp/1.0'
        }
      })
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (error) {
      console.error('Error al geocodificar dirección:', error)
      return null
    }
  }

  const handleOptimize = async () => {
    if (selectedSales.length === 0) {
      toast.error('Debes seleccionar al menos una venta')
      return
    }

    if (selectedVehicles.length === 0) {
      toast.error('Debes seleccionar al menos un vehículo')
      return
    }

    if (!originAddress) {
      toast.error('Debes especificar la dirección de origen')
      return
    }

    setIsOptimizing(true)
    setStep('optimize')

    try {
      // Verificar que el origen tenga coordenadas
      let originLatFinal = originLat
      let originLngFinal = originLng
      if (!originLat || !originLng) {
        toast.error('La dirección de origen debe tener coordenadas válidas. Por favor, selecciona una dirección de la lista de sugerencias.')
        setIsOptimizing(false)
        setStep('vehicles')
        return
      }

      // Obtener las ventas seleccionadas
      const selectedSalesData = sales.filter(s => selectedSales.includes(s.id_sale))
      
      // Geocodificar direcciones de las ventas seleccionadas
      toast.info('Obteniendo coordenadas de las direcciones...')
      const salesWithCoords = await Promise.all(
        selectedSalesData.map(async (sale) => {
          if (!sale.destination_address) {
            toast.warning(`La venta ${sale.sale_number || sale.id_sale} no tiene dirección de cliente`)
            return null
          }
          
          // Si ya tiene coordenadas, usarlas
          if (sale.destination_latitude && sale.destination_longitude) {
            return sale
          }
          
          // Si no, geocodificar
          const coords = await geocodeAddress(sale.destination_address)
          if (coords) {
            return {
              ...sale,
              destination_latitude: coords.lat,
              destination_longitude: coords.lng
            }
          }
          
          toast.warning(`No se pudieron obtener coordenadas para la dirección: ${sale.destination_address}`)
          return null
        })
      )

      // Filtrar ventas con coordenadas válidas
      const validSales = salesWithCoords.filter((s): s is SaleWithClient => s !== null && s.destination_latitude !== undefined && s.destination_longitude !== undefined)

      if (validSales.length === 0) {
        toast.error('No se pudieron obtener coordenadas válidas para ninguna venta. Verifica que los clientes tengan direcciones válidas.')
        setIsOptimizing(false)
        setStep('sales')
        return
      }

      // Crear cargas para cada venta
      const now = new Date().toISOString()
      const cargos = validSales.map((sale, index) => {
        // Calcular peso y volumen de los productos de la venta
        let totalWeight = 0
        let totalVolume = 0
        const productDescriptions: string[] = []

        if (sale.details) {
          sale.details.forEach(detail => {
            const product = products.find(p => p.id_product === detail.id_product)
            if (product) {
              const weight = (product.weight_per_unit || 0) * detail.quantity
              const volume = (product.volume_per_unit || 0) * detail.quantity
              totalWeight += weight
              totalVolume += volume
              productDescriptions.push(`${product.name} (${detail.quantity})`)
            }
          })
        }

        return {
          id_cargo: sale.id_sale, // Usar el ID de la venta como ID de cargo
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

      // Filtrar vehículos seleccionados
      const selectedVehiclesData = vehicles.filter(v => selectedVehicles.includes(v.id_vehicle))
      
      console.log('=== DATOS PARA OPTIMIZACIÓN ===')
      console.log('- Cargos:', cargos.length)
      cargos.forEach((cargo, idx) => {
        console.log(`  Cargo ${idx + 1}: peso=${cargo.weight}kg, volumen=${cargo.volume}L, destino=(${cargo.destination_latitude}, ${cargo.destination_longitude})`)
      })
      console.log('- Vehículos seleccionados:', selectedVehiclesData.length)
      selectedVehiclesData.forEach((v, idx) => {
        console.log(`  Vehículo ${idx + 1}: ${v.license_plate}, tipo=${v.vehicle_type}, capacidad=${v.weight_capacity}kg, status=${v.status}`)
      })
      console.log('- Conductores:', drivers.length)
      console.log('- Origen:', { lat: originLatFinal, lng: originLngFinal, address: originAddress })

      // Validar que haya cargos válidos
      if (cargos.length === 0) {
        toast.error('No hay cargos válidos para optimizar. Verifica que las ventas tengan direcciones válidas.')
        setIsOptimizing(false)
        setStep('sales')
        return
      }

      // Validar que haya vehículos seleccionados
      if (selectedVehiclesData.length === 0) {
        toast.error('No hay vehículos seleccionados disponibles.')
        setIsOptimizing(false)
        setStep('vehicles')
        return
      }

      // Optimizar rutas
      const optimized = await routeOptimizationService.assignCargosToVehicles(
        cargos,
        selectedVehiclesData,
        drivers,
        {
          lat: originLatFinal,
          lng: originLngFinal,
          address: originAddress
        }
      )

      if (optimized.length === 0) {
        console.error('❌ No se generaron rutas optimizadas')
        const totalWeight = cargos.reduce((sum, c) => sum + c.weight, 0)
        const maxCapacity = selectedVehiclesData.reduce((max, v) => Math.max(max, v.weight_capacity), 0)
        toast.error(
          `No se pudieron generar rutas. Verifica:
          - Los vehículos tienen capacidad suficiente (capacidad máxima: ${maxCapacity}kg)
          - Las ventas tienen direcciones válidas con coordenadas
          - Los vehículos están disponibles`,
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
      // Crear un mapa de id_cargo (que es id_sale) a id_route
      const saleToRouteMap = new Map<number, number>()
      
      for (const route of optimizedRoutes) {
        // Crear la ruta en el backend
        const createdRoute = await routesService.createRoute({
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
        
        // Mapear cada venta (cargo) a la ruta creada
        if (createdRoute && createdRoute.id_route) {
          route.assignments.forEach(assignment => {
            // El id_cargo es el id_sale
            saleToRouteMap.set(assignment.cargo.id_cargo, createdRoute.id_route!)
          })
        }
      }
      
      // TODO: Actualizar las ventas con el id_route asignado
      // Esto requeriría un método en el servicio de ventas para actualizar el id_route
      // Por ahora solo guardamos las rutas
      
      toast.success('Rutas guardadas exitosamente')
      // Resetear formulario
      setSelectedSales([])
      setSelectedVehicles([])
      setOptimizedRoutes([])
      setStep('sales')
      // Recargar datos para actualizar la lista de ventas
      await loadInitialData()
    } catch (error) {
      console.error('Error al guardar rutas:', error)
      toast.error('Error al guardar las rutas')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Planificar Rutas</h1>
        <p className="text-gray-600">Optimiza la distribución de carga entre vehículos</p>
      </div>

      {/* Pasos */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          {['sales', 'vehicles', 'optimize', 'results'].map((s, index) => {
            const stepLabels = ['Ventas', 'Vehículos', 'Optimizando', 'Resultados']
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step === s
                        ? 'bg-blue-600 text-white'
                        : ['sales', 'vehicles', 'optimize', 'results'].indexOf(step) > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs text-gray-600 mt-1">{stepLabels[index]}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      ['sales', 'vehicles', 'optimize', 'results'].indexOf(step) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Paso 1: Seleccionar Ventas */}
      {step === 'sales' && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Seleccionar Ventas para Planificar</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <AddressAutocomplete
                value={originAddress}
                onChange={(address, lat, lng) => {
                  setOriginAddress(address)
                  if (lat && lng) {
                    setOriginLat(lat)
                    setOriginLng(lng)
                  }
                }}
                placeholder="Buscar dirección de origen..."
                label="Dirección de Origen"
                required
              />
              {(originLat && originLng) && (
                <p className="text-xs text-gray-500 mt-1">
                  Coordenadas: {originLat.toFixed(6)}, {originLng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label>Ventas Pendientes ({selectedSales.length} seleccionadas)</Label>
              </div>

              {sales.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">
                  No hay ventas pendientes para planificar rutas
                </p>
              ) : (
                <div className="space-y-3">
                  {sales.map((sale) => {
                    const isSelected = selectedSales.includes(sale.id_sale)
                    const formatCurrency = (amount: number) => {
                      return new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0
                      }).format(amount)
                    }
                    
                    return (
                      <div
                        key={sale.id_sale}
                        className={`border rounded-lg p-4 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-400'
                        }`}
                      >
                        <div 
                          className="cursor-pointer"
                          onClick={() => handleSaleToggle(sale.id_sale)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-800">
                                  Venta {sale.sale_number || `#${sale.id_sale}`}
                                </h3>
                                {isSelected && (
                                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Cliente:</strong> {sale.client_name || sale.client?.name || 'N/A'}</p>
                                <p><strong>Teléfono:</strong> {sale.client?.phone || 'N/A'}</p>
                                <p><strong>Total:</strong> {formatCurrency(sale.total)}</p>
                                {sale.details && sale.details.length > 0 && (
                                  <div className="mt-2">
                                    <p className="font-medium text-gray-700">Productos:</p>
                                    <ul className="list-disc list-inside text-xs text-gray-600 ml-2">
                                      {sale.details.map((detail, idx) => (
                                        <li key={idx}>
                                          {detail.product_name || `Producto ${detail.id_product}`} - 
                                          Cantidad: {detail.quantity} - 
                                          {formatCurrency(detail.subtotal)}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Dirección de destino - solo se muestra si la venta está seleccionada */}
                        {isSelected && (
                          <div className="mt-4 pt-4 border-t border-blue-200" onClick={(e) => e.stopPropagation()}>
                            <AddressAutocomplete
                              value={sale.destination_address || sale.client?.address || ''}
                              onChange={(address, lat, lng) => {
                                const updated = sales.map(s => {
                                  if (s.id_sale === sale.id_sale) {
                                    return {
                                      ...s,
                                      destination_address: address,
                                      destination_latitude: lat,
                                      destination_longitude: lng
                                    }
                                  }
                                  return s
                                })
                                setSales(updated)
                              }}
                              placeholder="Buscar dirección de destino..."
                              label="Dirección de Destino"
                              required
                            />
                            {(sale.destination_latitude && sale.destination_longitude) && (
                              <p className="text-xs text-gray-500 mt-1">
                                Coordenadas: {sale.destination_latitude.toFixed(6)}, {sale.destination_longitude.toFixed(6)}
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

            {selectedSales.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Resumen de Carga Seleccionada</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Ventas seleccionadas:</strong> {selectedSales.length}</p>
                  <p><strong>Valor total de ventas:</strong> {
                    new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0
                    }).format(
                      sales
                        .filter(s => selectedSales.includes(s.id_sale))
                        .reduce((sum, sale) => sum + sale.total, 0)
                    )
                  }</p>
                  {calculateTotalVolume() > 0 && (
                    <p><strong>Volumen total estimado:</strong> {calculateTotalVolume().toFixed(2)} L</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (selectedSales.length === 0) {
                  toast.error('Selecciona al menos una venta')
                  return
                }
                if (!originAddress) {
                  toast.error('Especifica la dirección de origen')
                  return
                }
                
                // Validar que todas las ventas seleccionadas tengan dirección de destino
                const selectedSalesData = sales.filter(s => selectedSales.includes(s.id_sale))
                const salesWithoutAddress = selectedSalesData.filter(s => !s.destination_address)
                
                if (salesWithoutAddress.length > 0) {
                  toast.error(`${salesWithoutAddress.length} venta(s) no tienen dirección de destino. Por favor, completa las direcciones.`)
                  return
                }
                
                setStep('vehicles')
              }}
              disabled={selectedSales.length === 0 || !originAddress}
            >
              Siguiente: Vehículos
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 2: Vehículos */}
      {step === 'vehicles' && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Seleccionar Vehículos</h2>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Valor total de ventas: {
                new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(
                  sales
                    .filter(s => selectedSales.includes(s.id_sale))
                    .reduce((sum, sale) => sum + sale.total, 0)
                )
              }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => {
                const isSelected = selectedVehicles.includes(vehicle.id_vehicle)
                const canCarry = vehicle.weight_capacity >= calculateTotalWeight()
                return (
                  <div
                    key={vehicle.id_vehicle}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : canCarry
                        ? 'hover:border-gray-400'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canCarry && handleVehicleToggle(vehicle.id_vehicle)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-800">{vehicle.license_plate}</h3>
                        <p className="text-sm text-gray-600">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Tipo: {vehicle.vehicle_type}</p>
                      <p>Capacidad: {vehicle.weight_capacity} kg</p>
                      {vehicle.volume_capacity && (
                        <p>Volumen: {vehicle.volume_capacity} L</p>
                      )}
                      {!canCarry && (
                        <p className="text-red-500 font-medium">Capacidad insuficiente</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('sales')}>
              Anterior
            </Button>
            <Button onClick={handleOptimize} disabled={selectedVehicles.length === 0}>
              Optimizar Rutas
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 4: Optimizando */}
      {step === 'optimize' && (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Optimizando Rutas</h2>
            <p className="text-gray-600">Esto puede tomar unos momentos...</p>
          </div>
        </Card>
      )}

      {/* Paso 5: Resultados */}
      {step === 'results' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Rutas Optimizadas</h2>
            </div>

            <div className="space-y-4 mb-6">
              {optimizedRoutes.map((route, index) => (
                <div key={route.route_code} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{route.route_code}</h3>
                      <p className="text-sm text-gray-600">
                        Vehículo: {route.assignments[0]?.vehicle.license_plate} | 
                        Conductor: {route.id_driver === 0 || !route.id_driver 
                          ? 'Sin asignar' 
                          : `${route.assignments[0]?.driver.first_name} ${route.assignments[0]?.driver.last_name}`}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {route.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Paradas</p>
                      <p className="font-semibold">{route.assignments.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Distancia</p>
                      <p className="font-semibold">
                        {typeof route.total_distance === 'number' && !isNaN(route.total_distance)
                          ? `${route.total_distance.toFixed(2)} km`
                          : '0.00 km'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duración</p>
                      <p className="font-semibold">
                        {typeof route.total_duration === 'number' && !isNaN(route.total_duration)
                          ? `${route.total_duration.toFixed(0)} min`
                          : '0 min'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valor Total</p>
                      <p className="font-semibold">
                        {(() => {
                          // Calcular valor de ventas en esta ruta
                          let salesInRoute = 0
                          
                          route.assignments.forEach(assignment => {
                            const sale = sales.find(s => s.id_sale === assignment.cargo.id_cargo)
                            if (sale && sale.total != null) {
                              const saleTotal = Number(sale.total)
                              if (!isNaN(saleTotal) && isFinite(saleTotal)) {
                                salesInRoute += saleTotal
                              }
                            }
                          })
                          
                          // Sumar 1000 por cada km
                          const distance = typeof route.total_distance === 'number' && !isNaN(route.total_distance) && isFinite(route.total_distance)
                            ? route.total_distance 
                            : 0
                          const distanceCost = distance * 1000
                          const totalValue = salesInRoute + distanceCost
                          
                          // Validar que el valor total sea un número válido
                          if (isNaN(totalValue) || !isFinite(totalValue)) {
                            return '$0'
                          }
                          
                          return new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            minimumFractionDigits: 0
                          }).format(totalValue)
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-gray-700 mb-2">Paradas:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                      {route.assignments.map((assignment, idx) => (
                        <li key={idx}>
                          {assignment.cargo.destination_address} ({assignment.cargo.weight} kg)
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('vehicles')}>
                Volver
              </Button>
              <Button onClick={handleSaveRoutes} disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Rutas'}
              </Button>
            </div>
          </Card>

          {/* Mapa con rutas optimizadas */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Visualización de Rutas</h2>
            {optimizedRoutes.length > 0 ? (
              <OptimizedRouteMap routes={optimizedRoutes} />
            ) : (
              <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg bg-gray-100 flex flex-col items-center justify-center">
                <p className="text-gray-500 text-lg mb-2">No hay rutas para mostrar</p>
                <p className="text-gray-400 text-sm">No se generaron rutas optimizadas. Verifica que:</p>
                <ul className="text-gray-400 text-sm mt-2 list-disc list-inside">
                  <li>Las ventas tengan direcciones válidas con coordenadas</li>
                  <li>Los vehículos seleccionados tengan capacidad suficiente</li>
                  <li>Haya ventas seleccionadas</li>
                </ul>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setStep('vehicles')}
                >
                  Volver a Optimizar
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

