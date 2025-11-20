'use client'

import { useState, useEffect } from 'react'
import { RouteOptimizationService } from '@/services/routeOptimizationService'
import { VehiclesService } from '@/services/vehiclesService'
import { DriversService } from '@/services/driversService'
import { ProductsService } from '@/services/productsService'
import { CargoService } from '@/services/cargoService'
import { RoutesService } from '@/services/routesService'
import { OptimizedRoute } from '@/types/cargoTypes'
import { Vehicle } from '@/types/vehicleTypes'
import { Driver } from '@/types/driverTypes'
import { Product } from '@/types/productTypes'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import dynamic from 'next/dynamic'
import { MapPin, Package, Truck, Route, Plus, X, Loader2 } from 'lucide-react'
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

interface Destination {
  id: string
  address: string
  latitude?: number
  longitude?: number
  recipient_name?: string
  recipient_phone?: string
}

interface SelectedProduct {
  product: Product
  quantity: number
}

export const PlanRoutesView = () => {
  const [step, setStep] = useState<'destinations' | 'products' | 'vehicles' | 'optimize' | 'results'>('destinations')
  const [isLoading, setIsLoading] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Datos del formulario
  const [originAddress, setOriginAddress] = useState('')
  const [originLat, setOriginLat] = useState<number>(4.711) // Bogotá por defecto
  const [originLng, setOriginLng] = useState<number>(-74.072)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([])

  // Datos cargados
  const [products, setProducts] = useState<Product[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  // Resultados
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>([])

  const routeOptimizationService = new RouteOptimizationService()
  const vehiclesService = new VehiclesService()
  const driversService = new DriversService()
  const productsService = new ProductsService()
  const cargoService = new CargoService()
  const routesService = new RoutesService()

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      const [productsData, vehiclesData, driversData] = await Promise.all([
        productsService.getAllProducts(),
        vehiclesService.getAvailableVehicles(),
        driversService.getAvailableDrivers()
      ])
      setProducts(productsData)
      setVehicles(vehiclesData)
      setDrivers(driversData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar los datos iniciales')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDestination = () => {
    setDestinations([
      ...destinations,
      {
        id: Date.now().toString(),
        address: '',
        recipient_name: '',
        recipient_phone: ''
      }
    ])
  }

  const handleRemoveDestination = (id: string) => {
    setDestinations(destinations.filter(d => d.id !== id))
  }

  const handleAddProduct = (product: Product) => {
    const existing = selectedProducts.find(sp => sp.product.id_product === product.id_product)
    if (existing) {
      setSelectedProducts(
        selectedProducts.map(sp =>
          sp.product.id_product === product.id_product
            ? { ...sp, quantity: sp.quantity + 1 }
            : sp
        )
      )
    } else {
      setSelectedProducts([...selectedProducts, { product, quantity: 1 }])
    }
  }

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(sp => sp.product.id_product !== productId))
  }

  const handleProductQuantityChange = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productId)
      return
    }
    setSelectedProducts(
      selectedProducts.map(sp =>
        sp.product.id_product === productId ? { ...sp, quantity } : sp
      )
    )
  }

  const handleVehicleToggle = (vehicleId: number) => {
    if (selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId))
    } else {
      setSelectedVehicles([...selectedVehicles, vehicleId])
    }
  }

  const calculateTotalWeight = (): number => {
    return selectedProducts.reduce((total, sp) => {
      const weightPerUnit = sp.product.weight_per_unit || 0
      return total + weightPerUnit * sp.quantity
    }, 0)
  }

  const calculateTotalVolume = (): number => {
    return selectedProducts.reduce((total, sp) => {
      const volumePerUnit = sp.product.volume_per_unit || 0
      return total + volumePerUnit * sp.quantity
    }, 0)
  }

  const handleOptimize = async () => {
    if (destinations.length === 0) {
      toast.error('Debes agregar al menos una ubicación de destino')
      return
    }

    if (selectedProducts.length === 0) {
      toast.error('Debes seleccionar al menos un producto')
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
        return
      }

      // Crear cargas para cada destino
      const now = new Date().toISOString()
      const cargos = destinations.map((dest, index) => {
        // Distribuir productos entre destinos (simplificado - en producción sería más complejo)
        const productsForDestination = selectedProducts.map(sp => ({
          product: sp.product,
          quantity: Math.ceil(sp.quantity / destinations.length)
        }))

        const totalWeight = productsForDestination.reduce((sum, p) => {
          return sum + (p.product.weight_per_unit || 0) * p.quantity
        }, 0)

        const totalVolume = productsForDestination.reduce((sum, p) => {
          return sum + (p.product.volume_per_unit || 0) * p.quantity
        }, 0)

        return {
          id_cargo: index + 1, // Temporal
          id_company: 1, // TODO: Obtener del contexto de usuario
          description: productsForDestination.map(p => `${p.product.name} (${p.quantity})`).join(', '),
          weight: totalWeight,
          volume: totalVolume,
          destination_address: dest.address,
          destination_latitude: dest.latitude,
          destination_longitude: dest.longitude,
          recipient_name: dest.recipient_name,
          recipient_phone: dest.recipient_phone,
          priority: 'media' as const,
          status: 'pendiente' as const,
          created_at: now,
          modified_at: now
        }
      })

      // Filtrar vehículos seleccionados
      const selectedVehiclesData = vehicles.filter(v => selectedVehicles.includes(v.id_vehicle))
      
      console.log('Datos para optimización:')
      console.log('- Cargos:', cargos.length)
      console.log('- Vehículos seleccionados:', selectedVehiclesData.length)
      console.log('- Conductores:', drivers.length)

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

      setOptimizedRoutes(optimized)
      setStep('results')
      toast.success(`Se optimizaron ${optimized.length} rutas`)
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
        // Crear la ruta en el backend
        await routesService.createRoute({
          route_code: route.route_code,
          id_driver: route.id_driver === 0 ? undefined : route.id_driver, // undefined si no hay conductor
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
      // Resetear formulario
      setDestinations([])
      setSelectedProducts([])
      setSelectedVehicles([])
      setOptimizedRoutes([])
      setStep('destinations')
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
          {['destinations', 'products', 'vehicles', 'optimize', 'results'].map((s, index) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === s
                    ? 'bg-blue-600 text-white'
                    : ['destinations', 'products', 'vehicles', 'optimize', 'results'].indexOf(step) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              {index < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    ['destinations', 'products', 'vehicles', 'optimize', 'results'].indexOf(step) > index
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Paso 1: Ubicaciones */}
      {step === 'destinations' && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Ubicaciones de Destino</h2>
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
                <Label>Destinos</Label>
                <Button type="button" onClick={handleAddDestination} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Destino
                </Button>
              </div>

              {destinations.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay destinos agregados</p>
              ) : (
                <div className="space-y-4">
                  {destinations.map((dest) => (
                    <div key={dest.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-800">Destino {destinations.indexOf(dest) + 1}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDestination(dest.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <AddressAutocomplete
                          value={dest.address}
                          onChange={(address, lat, lng) => {
                            const updated = destinations.map(d => {
                              if (d.id === dest.id) {
                                return { ...d, address, latitude: lat, longitude: lng }
                              }
                              return d
                            })
                            setDestinations(updated)
                          }}
                          placeholder="Buscar dirección de destino..."
                          label="Dirección"
                          required
                        />
                        {(dest.latitude && dest.longitude) && (
                          <p className="text-xs text-gray-500 mt-1">
                            Coordenadas: {dest.latitude.toFixed(6)}, {dest.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nombre del Destinatario</Label>
                          <Input
                            value={dest.recipient_name || ''}
                            onChange={(e) => {
                              const updated = destinations.map(d => {
                                if (d.id === dest.id) {
                                  return { ...d, recipient_name: e.target.value }
                                }
                                return d
                              })
                              setDestinations(updated)
                            }}
                            placeholder="Nombre"
                          />
                        </div>
                        <div>
                          <Label>Teléfono</Label>
                          <Input
                            value={dest.recipient_phone || ''}
                            onChange={(e) => {
                              const updated = destinations.map(d => {
                                if (d.id === dest.id) {
                                  return { ...d, recipient_phone: e.target.value }
                                }
                                return d
                              })
                              setDestinations(updated)
                            }}
                            placeholder="Teléfono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (destinations.length > 0 && originAddress) {
                  setStep('products')
                } else {
                  toast.error('Completa todos los campos requeridos')
                }
              }}
            >
              Siguiente: Productos
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 2: Productos */}
      {step === 'products' && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Productos a Transportar</h2>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id_product}
                  className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.sku}</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    {product.weight_per_unit && (
                      <p>Peso: {product.weight_per_unit} kg/unidad</p>
                    )}
                    {product.volume_per_unit && (
                      <p>Volumen: {product.volume_per_unit} L/unidad</p>
                    )}
                  </div>
                  {selectedProducts.find(sp => sp.product.id_product === product.id_product) ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleProductQuantityChange(
                            product.id_product,
                            selectedProducts.find(sp => sp.product.id_product === product.id_product)!.quantity - 1
                          )
                        }
                      >
                        -
                      </Button>
                      <span className="flex-1 text-center font-medium">
                        {selectedProducts.find(sp => sp.product.id_product === product.id_product)!.quantity}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddProduct(product)}
                      >
                        +
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleAddProduct(product)}
                    >
                      Agregar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Resumen de Carga</h3>
              <div className="space-y-2">
                {selectedProducts.map((sp) => (
                  <div key={sp.product.id_product} className="flex justify-between text-sm">
                    <span>{sp.product.name} x {sp.quantity}</span>
                    <span className="font-medium">
                      {(sp.product.weight_per_unit || 0) * sp.quantity} kg
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{calculateTotalWeight().toFixed(2)} kg</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('destinations')}>
              Anterior
            </Button>
            <Button
              onClick={() => {
                if (selectedProducts.length > 0) {
                  setStep('vehicles')
                } else {
                  toast.error('Selecciona al menos un producto')
                }
              }}
            >
              Siguiente: Vehículos
            </Button>
          </div>
        </Card>
      )}

      {/* Paso 3: Vehículos */}
      {step === 'vehicles' && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Seleccionar Vehículos</h2>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Carga total: {calculateTotalWeight().toFixed(2)} kg
              {calculateTotalVolume() > 0 && ` / ${calculateTotalVolume().toFixed(2)} L`}
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
            <Button variant="outline" onClick={() => setStep('products')}>
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
                      <p className="font-semibold">{route.total_distance.toFixed(2)} km</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duración</p>
                      <p className="font-semibold">{route.total_duration.toFixed(0)} min</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Peso Total</p>
                      <p className="font-semibold">{route.total_weight.toFixed(2)} kg</p>
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
              <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No hay rutas para mostrar</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

