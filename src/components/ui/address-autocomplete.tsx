'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useJsApiLoader } from '@react-google-maps/api'
import { Input } from './input'
import { MapPin, Move, X } from 'lucide-react'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
const LIBRARIES: ('places')[] = ['places']

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, lat?: number, lng?: number) => void
  placeholder?: string
  label?: string
  required?: boolean
  /** Country restriction for Google Places (default: "co" for Colombia) */
  countryRestriction?: string
  /** Show a mini-map with draggable marker when coordinates are available. Default true. */
  showMap?: boolean
  /** Current latitude (for external control of map) */
  latitude?: number
  /** Current longitude (for external control of map) */
  longitude?: number
  // Legacy props kept for backward compatibility
  searchContext?: string
  viewbox?: string
  bounded?: boolean
}

// Dynamically import the mini-map to avoid SSR issues with Leaflet
const AddressMapPicker = dynamic(() => import('./address-map-picker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[180px] bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
      <MapPin className="w-5 h-5 text-slate-300" />
    </div>
  ),
})

export const AddressAutocomplete = ({
  value,
  onChange,
  placeholder = 'Buscar dirección...',
  label,
  required = false,
  countryRestriction = 'co',
  showMap = true,
  latitude,
  longitude,
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mapExpanded, setMapExpanded] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const placesNodeRef = useRef<HTMLDivElement>(null)
  const isSelectingRef = useRef(false)

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  })

  const hasCoordinates = (latitude && longitude && latitude !== 0 && longitude !== 0) || false

  // Initialize Google Places services
  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
      if (placesNodeRef.current) {
        placesServiceRef.current = new google.maps.places.PlacesService(placesNodeRef.current)
      }
    }
  }, [isLoaded])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-expand map when coordinates arrive
  useEffect(() => {
    if (hasCoordinates && showMap) {
      setMapExpanded(true)
    }
  }, [hasCoordinates, showMap])

  const searchAddresses = useCallback(async (query: string) => {
    if (query.length < 3 || !autocompleteServiceRef.current) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const request: google.maps.places.AutocompletionRequest = {
        input: query,
        componentRestrictions: { country: countryRestriction },
        types: ['address'],
      }

      autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
        }
        setIsLoading(false)
      })
    } catch (error) {
      console.error('Error al buscar direcciones:', error)
      setSuggestions([])
      setIsLoading(false)
    }
  }, [countryRestriction])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = undefined
    }

    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue)
    }, 300)
  }

  const handleSelectSuggestion = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesServiceRef.current) return

    isSelectingRef.current = true

    placesServiceRef.current.getDetails(
      { placeId: prediction.place_id, fields: ['geometry', 'formatted_address'] },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const address = prediction.structured_formatting.main_text
            + (prediction.structured_formatting.secondary_text
              ? `, ${prediction.structured_formatting.secondary_text}`
              : '')
          onChange(address, lat, lng)
        } else {
          onChange(prediction.description)
        }
        setShowSuggestions(false)
        setSuggestions([])
        setTimeout(() => { isSelectingRef.current = false }, 300)
      }
    )
  }

  const handleMarkerDrag = useCallback((lat: number, lng: number) => {
    onChange(value, lat, lng)
  }, [value, onChange])

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Hidden node for PlacesService */}
      <div ref={placesNodeRef} style={{ display: 'none' }} />

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
            setTimeout(() => {
              setShowSuggestions(false)
            }, 200)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && suggestions.length > 0) {
              e.preventDefault()
              handleSelectSuggestion(suggestions[0])
            }
          }}
          placeholder={isLoaded ? placeholder : 'Cargando...'}
          className="pl-10"
          required={required}
          disabled={!isLoaded}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelectSuggestion(prediction)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm font-medium text-gray-800 block truncate">
                    {prediction.structured_formatting.main_text}
                  </span>
                  <span className="text-xs text-gray-400 block truncate">
                    {prediction.structured_formatting.secondary_text}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mini-map for coordinate refinement */}
      {showMap && hasCoordinates && (
        <div className="mt-2">
          {mapExpanded ? (
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  Arrastra el marcador para ajustar la ubicación exacta
                </p>
                <button
                  type="button"
                  onClick={() => setMapExpanded(false)}
                  className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <AddressMapPicker
                latitude={latitude!}
                longitude={longitude!}
                onPositionChange={handleMarkerDrag}
              />
              <p className="text-[10px] text-slate-400 mt-1 text-right">
                {latitude!.toFixed(6)}, {longitude!.toFixed(6)}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setMapExpanded(true)}
              className="w-full text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Move className="w-3 h-3" />
              Ajustar ubicación en el mapa
            </button>
          )}
        </div>
      )}
    </div>
  )
}
