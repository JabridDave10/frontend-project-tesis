'use client'

import { useState, useCallback, useMemo } from 'react'
import { DeliveryPoint, VRPConfig, VehicleDriverPair, VRPResult } from '@/types/vrpTypes'
import { Warehouse, Stock, Product } from '@/types/productTypes'
import { ProductsService } from '@/services/productsService'
import { VRPSolverService } from '@/services/vrpSolverService'
import { StepWarehouse } from '@/components/vrp/StepWarehouse'
import { StepDeliveryPoints } from '@/components/vrp/StepDeliveryPoints'
import { StepOptimize } from '@/components/vrp/StepOptimize'
import { StepResults } from '@/components/vrp/StepResults'
import {
  Warehouse as WarehouseIcon, MapPin, Cpu, CheckCircle2, Route
} from 'lucide-react'
import { toast } from 'react-toastify'

type WizardStep = 'warehouse' | 'delivery' | 'optimize' | 'results'

const STEPS: { key: WizardStep; label: string; icon: typeof Cpu }[] = [
  { key: 'warehouse', label: 'Bodega', icon: WarehouseIcon },
  { key: 'delivery', label: 'Puntos de Entrega', icon: MapPin },
  { key: 'optimize', label: 'Optimizar', icon: Cpu },
  { key: 'results', label: 'Resultados', icon: CheckCircle2 },
]

/**
 * Build a Nominatim viewbox and search context string from warehouse coordinates.
 * Expands ~0.2 deg (~20km) around the warehouse to cover the city area.
 */
function buildSearchArea(coords: { lat: number; lng: number } | null) {
  if (!coords) {
    return { searchContext: 'Bogota, Colombia', viewbox: '-74.3,4.4,-73.9,4.9' }
  }
  const delta = 0.2
  const viewbox = `${(coords.lng - delta).toFixed(4)},${(coords.lat - delta).toFixed(4)},${(coords.lng + delta).toFixed(4)},${(coords.lat + delta).toFixed(4)}`
  return { viewbox, searchContext: 'Colombia' }
}

export const PlanRoutesView = () => {
  const [step, setStep] = useState<WizardStep>('warehouse')

  // Step 1
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [warehouseCoords, setWarehouseCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [warehouseStock, setWarehouseStock] = useState<Stock[]>([])

  // Step 2
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoaded, setProductsLoaded] = useState(false)

  // Step 3
  const [config, setConfig] = useState<VRPConfig>({
    algorithm: 'clarke-wright',
    apply2Opt: true,
    respectVolumeCapacity: true,
    maxStopsPerRoute: 15,
  })
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [progressMessage, setProgressMessage] = useState('')

  // Step 4
  const [result, setResult] = useState<VRPResult | null>(null)

  // Derived: search context for address autocomplete
  const { searchContext, viewbox } = useMemo(
    () => buildSearchArea(warehouseCoords),
    [warehouseCoords]
  )

  const handleWarehouseSelect = useCallback(
    async (warehouse: Warehouse, coords: { lat: number; lng: number }, stock: Stock[]) => {
      setSelectedWarehouse(warehouse)
      setWarehouseCoords(coords)
      setWarehouseStock(stock)

      if (!productsLoaded) {
        try {
          const productsService = new ProductsService()
          const prods = await productsService.getAllProducts()
          setProducts(prods)
          setProductsLoaded(true)
        } catch {
          toast.error('Error al cargar productos')
        }
      }
    },
    [productsLoaded]
  )

  const handleOptimize = useCallback(
    async (pairs: VehicleDriverPair[]) => {
      if (!warehouseCoords || !selectedWarehouse) return

      setIsOptimizing(true)
      setProgressMessage('Iniciando optimizacion...')

      try {
        const solver = new VRPSolverService()
        const vrpResult = await solver.solve(
          { lat: warehouseCoords.lat, lng: warehouseCoords.lng, address: selectedWarehouse.address },
          deliveryPoints,
          pairs,
          config,
          setProgressMessage
        )

        setResult(vrpResult)
        setStep('results')

        if (vrpResult.routes.length > 0) {
          toast.success(`${vrpResult.routes.length} ruta(s) optimizadas en ${vrpResult.computation_time_ms}ms`)
        } else {
          toast.warning('No se pudieron generar rutas. Verifica la flota y los puntos de entrega.')
        }
      } catch (err) {
        console.error('VRP solver error:', err)
        toast.error('Error al optimizar rutas')
      } finally {
        setIsOptimizing(false)
        setProgressMessage('')
      }
    },
    [warehouseCoords, selectedWarehouse, deliveryPoints, config]
  )

  const handleReset = () => {
    setStep('warehouse')
    setSelectedWarehouse(null)
    setWarehouseCoords(null)
    setWarehouseStock([])
    setDeliveryPoints([])
    setResult(null)
    setConfig({
      algorithm: 'clarke-wright',
      apply2Opt: true,
      respectVolumeCapacity: true,
      maxStopsPerRoute: 15,
    })
  }

  const currentStepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0A1628] to-[#001F3F] p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(6,182,212,0.15)_1px,_transparent_0)] bg-[length:40px_40px] opacity-20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen blur-[80px] opacity-20" />
        <div className="relative">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Route className="w-5 h-5 text-cyan-400" />
            </div>
            Planificador de Rutas VRP
          </h1>
          <p className="text-blue-100/70 text-sm mt-2 ml-[52px]">
            Optimizacion de rutas con multiples vehiculos, capacidades y algoritmos avanzados.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm px-6 py-4">
        <div className="flex items-center">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            const isCurrent = idx === currentStepIndex
            const isPast = idx < currentStepIndex

            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                        : isPast
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${
                      isCurrent ? 'text-slate-900' : isPast ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-px flex-1 mx-4 transition-colors ${
                      idx < currentStepIndex ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          {step === 'warehouse' && (
            <StepWarehouse
              selectedWarehouse={selectedWarehouse}
              warehouseCoords={warehouseCoords}
              warehouseStock={warehouseStock}
              onSelect={handleWarehouseSelect}
              onNext={() => setStep('delivery')}
            />
          )}

          {step === 'delivery' && (
            <StepDeliveryPoints
              deliveryPoints={deliveryPoints}
              products={products}
              warehouseStock={warehouseStock}
              searchContext={searchContext}
              viewbox={viewbox}
              onChange={setDeliveryPoints}
              onBack={() => setStep('warehouse')}
              onNext={() => setStep('optimize')}
            />
          )}

          {step === 'optimize' && (
            <StepOptimize
              deliveryPoints={deliveryPoints}
              config={config}
              onConfigChange={setConfig}
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
              progressMessage={progressMessage}
              onBack={() => setStep('delivery')}
            />
          )}

          {step === 'results' && result && selectedWarehouse && warehouseCoords && (
            <StepResults
              result={result}
              origin={{
                address: selectedWarehouse.address,
                lat: warehouseCoords.lat,
                lng: warehouseCoords.lng,
              }}
              warehouseId={selectedWarehouse.id_warehouse}
              onBack={() => setStep('optimize')}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  )
}
