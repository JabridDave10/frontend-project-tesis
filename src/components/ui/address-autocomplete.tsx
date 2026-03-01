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
  /** City/region context appended to search queries (default: "Bogotá, Colombia") */
  searchContext?: string
  /** Nominatim viewbox "min_lon,min_lat,max_lon,max_lat" (default: Bogotá area) */
  viewbox?: string
  /** If true, strictly bounds results to viewbox (bounded=1). Default false. */
  bounded?: boolean
}

export const AddressAutocomplete = ({
  value,
  onChange,
  placeholder = 'Buscar dirección...',
  label,
  required = false,
  searchContext = 'Bogotá, Colombia',
  viewbox = '-74.3,4.4,-73.9,4.9',
  bounded = false,
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isSelectingRef = useRef(false)

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
      const searchQuery = `${query}, ${searchContext}`
      const boundedParam = bounded ? '1' : '0'
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1&viewbox=${viewbox}&bounded=${boundedParam}&countrycodes=co`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RoutePlanningApp/1.0'
        }
      })
      const data: AddressSuggestion[] = await response.json()
      
      // Filtrar resultados de forma más flexible
      // Verificar que sean de Colombia (requisito mínimo)
      const colombiaResults = (data || []).filter(item => {
        const address = item.address || {}
        const country = (address.country || '').toLowerCase()
        const displayName = (item.display_name || '').toLowerCase()
        
        return country.includes('colombia') || 
               country.includes('co') ||
               displayName.includes('colombia')
      })
      
      // Extract city keywords from searchContext for prioritization
      const contextKeywords = searchContext
        .toLowerCase()
        .replace(/,/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && w !== 'colombia')

      const priorityResults: AddressSuggestion[] = []
      const otherResults: AddressSuggestion[] = []

      colombiaResults.forEach(item => {
        const address = item.address || {}
        const city = (address.city || address.town || '').toLowerCase()
        const state = (address.state || '').toLowerCase()
        const displayName = (item.display_name || '').toLowerCase()
        const combined = `${city} ${state} ${displayName}`

        const matchesContext = contextKeywords.some(kw => combined.includes(kw))

        if (matchesContext) {
          priorityResults.push(item)
        } else {
          otherResults.push(item)
        }
      })

      let finalResults: AddressSuggestion[] = []
      if (priorityResults.length >= 3) {
        finalResults = priorityResults
      } else {
        finalResults = [...priorityResults, ...otherResults]
      }
      
      // Limitar a 5 resultados
      setSuggestions(finalResults.slice(0, 5))
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
    isSelectingRef.current = true
    onChange(suggestion.display_name, parseFloat(suggestion.lat), parseFloat(suggestion.lon))
    setShowSuggestions(false)
    setSuggestions([])
    // Resetear el flag después de un breve delay
    setTimeout(() => {
      isSelectingRef.current = false
    }, 300)
  }

  // Función para buscar coordenadas de una dirección cuando el usuario no selecciona una sugerencia
  const geocodeAddress = async (address: string) => {
    if (!address || address.length < 3) return

    try {
      const geoQuery = `${address}, ${searchContext}`
      const boundedParam = bounded ? '1' : '0'
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geoQuery)}&limit=1&addressdetails=1&viewbox=${viewbox}&bounded=${boundedParam}&countrycodes=co`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RoutePlanningApp/1.0'
        }
      })
      const data: AddressSuggestion[] = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        // Actualizar con las coordenadas encontradas
        onChange(address, parseFloat(result.lat), parseFloat(result.lon))
      }
    } catch (error) {
      console.error('Error al geocodificar dirección:', error)
    }
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
          onBlur={() => {
            // Pequeño delay para permitir que se ejecute el onClick de las sugerencias
            setTimeout(() => {
              setShowSuggestions(false)
              // Si hay una dirección pero no se seleccionó una sugerencia, intentar geocodificar
              if (!isSelectingRef.current && value && value.length >= 3) {
                geocodeAddress(value)
              }
            }, 200)
          }}
          onKeyDown={(e) => {
            // Si presiona Enter y hay sugerencias, seleccionar la primera
            if (e.key === 'Enter' && suggestions.length > 0) {
              e.preventDefault()
              handleSelectSuggestion(suggestions[0])
            }
            // Si presiona Enter sin sugerencias, intentar geocodificar
            else if (e.key === 'Enter' && value && value.length >= 3) {
              e.preventDefault()
              geocodeAddress(value)
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

