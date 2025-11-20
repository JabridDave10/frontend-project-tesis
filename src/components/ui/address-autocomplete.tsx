'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from './input'
import { MapPin } from 'lucide-react'

interface AddressSuggestion {
  display_name: string
  lat: string
  lon: string
  place_id: number
  address?: {
    city?: string
    town?: string
    state?: string
    country?: string
    [key: string]: any
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, lat?: number, lng?: number) => void
  placeholder?: string
  label?: string
  required?: boolean
}

export const AddressAutocomplete = ({
  value,
  onChange,
  placeholder = 'Buscar dirección...',
  label,
  required = false
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      // Agregar "Bogotá, Colombia" al query para limitar la búsqueda
      const searchQuery = `${query}, Bogotá, Colombia`
      
      // Viewbox de Bogotá (bounding box)
      // Formato: min_lon,min_lat,max_lon,max_lat
      // Bogotá: aproximadamente -74.2, 4.5, -74.0, 4.8
      const viewbox = '-74.2,4.5,-74.0,4.8'
      
      // URL con parámetros para limitar a Bogotá:
      // - viewbox: área geográfica de búsqueda
      // - bounded=1: solo resultados dentro del viewbox
      // - countrycodes=co: limitar a Colombia
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1&viewbox=${viewbox}&bounded=1&countrycodes=co`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RoutePlanningApp/1.0'
        }
      })
      const data: AddressSuggestion[] = await response.json()
      
      // Filtrar resultados para asegurar que sean de Bogotá
      const filteredData = (data || []).filter(item => {
        const address = item.address || {}
        const city = (address.city || address.town || '').toLowerCase()
        const state = (address.state || '').toLowerCase()
        const country = (address.country || '').toLowerCase()
        const displayName = (item.display_name || '').toLowerCase()
        
        // Verificar que sea de Bogotá
        const isBogota = 
          city.includes('bogotá') || 
          city.includes('bogota') ||
          state.includes('bogotá') ||
          state.includes('bogota') ||
          state.includes('cundinamarca') ||
          displayName.includes('bogotá') ||
          displayName.includes('bogota')
        
        // Verificar que sea de Colombia
        const isColombia = 
          country.includes('colombia') || 
          country.includes('co') ||
          displayName.includes('colombia')
        
        return isBogota && isColombia
      })
      
      // Limitar a 5 resultados y mostrar solo los de Bogotá
      setSuggestions(filteredData.slice(0, 5))
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error al buscar direcciones:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Debounce para evitar demasiadas peticiones
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = undefined
    }

    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue)
    }, 300)
  }

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display_name, parseFloat(suggestion.lat), parseFloat(suggestion.lon))
    setShowSuggestions(false)
    setSuggestions([])
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={placeholder}
          className="pl-10"
          required={required}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-800">{suggestion.display_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

