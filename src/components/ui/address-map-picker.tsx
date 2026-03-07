'use client'

import { useRef, useMemo, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface AddressMapPickerProps {
  latitude: number
  longitude: number
  onPositionChange: (lat: number, lng: number) => void
}

function MapClickHandler({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  const map = useMap()
  useEffect(() => {
    map.on('click', onClick)
    return () => { map.off('click', onClick) }
  }, [map, onClick])
  return null
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true })
  }, [lat, lng, map])
  return null
}

function DraggableMarker({
  latitude,
  longitude,
  onPositionChange,
}: AddressMapPickerProps) {
  const markerRef = useRef<L.Marker>(null)

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker) {
          const pos = marker.getLatLng()
          onPositionChange(pos.lat, pos.lng)
        }
      },
    }),
    [onPositionChange]
  )

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={[latitude, longitude]}
      ref={markerRef}
    />
  )
}

export default function AddressMapPicker({
  latitude,
  longitude,
  onPositionChange,
}: AddressMapPickerProps) {
  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      onPositionChange(e.latlng.lat, e.latlng.lng)
    },
    [onPositionChange]
  )

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={17}
      style={{ height: '180px', width: '100%' }}
      className="rounded-lg border border-slate-200 z-0"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onClick={handleMapClick} />
      <RecenterMap lat={latitude} lng={longitude} />
      <DraggableMarker
        latitude={latitude}
        longitude={longitude}
        onPositionChange={onPositionChange}
      />
    </MapContainer>
  )
}
