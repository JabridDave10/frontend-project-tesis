'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { VehiclePosition } from '@/services/gpsTrackingService'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LiveTrackingMapProps {
  drivers: VehiclePosition[]
  onDriverClick?: (driver: VehiclePosition) => void
  selectedDriverId?: number | null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'en_ruta': return '#06b6d4'
    case 'disponible': return '#22c55e'
    case 'detenido': return '#f59e0b'
    default: return '#64748b'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'en_ruta': return 'En Ruta'
    case 'disponible': return 'Disponible'
    case 'detenido': return 'Detenido'
    default: return status
  }
}

const createTruckIcon = (status: string) => {
  const color = getStatusColor(status)
  return L.divIcon({
    className: 'custom-truck-marker',
    html: `<div style="
      width: 36px; height: 36px;
      background: ${color};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 3px solid white;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H12"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  })
}

function createPopupContent(driver: VehiclePosition): string {
  const statusColor = getStatusColor(driver.status)
  const statusLabel = getStatusLabel(driver.status)
  const name = `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Conductor'

  return `
    <div style="min-width: 200px; font-family: system-ui, sans-serif;">
      <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #0f172a;">${name}</div>
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; display: inline-block;"></span>
        <span style="font-size: 12px; color: #475569;">${statusLabel}</span>
      </div>
      ${driver.license_plate ? `<div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Placa: <strong>${driver.license_plate}</strong></div>` : ''}
      ${driver.vehicle_type ? `<div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Tipo: ${driver.vehicle_type}</div>` : ''}
      ${driver.speed !== undefined ? `<div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Velocidad: ${Math.round(driver.speed)} km/h</div>` : ''}
      ${driver.route_code ? `<div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Ruta: ${driver.route_code}</div>` : ''}
    </div>
  `
}

export default function LiveTrackingMap({ drivers, onDriverClick, selectedDriverId }: LiveTrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [4.711, -74.072],
      zoom: 12,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentDriverIds = new Set(drivers.map((d) => d.id_driver))

    markersRef.current.forEach((marker, driverId) => {
      if (!currentDriverIds.has(driverId)) {
        map.removeLayer(marker)
        markersRef.current.delete(driverId)
      }
    })

    drivers.forEach((driver) => {
      const existingMarker = markersRef.current.get(driver.id_driver)
      const latlng: L.LatLngExpression = [driver.latitude, driver.longitude]

      if (existingMarker) {
        existingMarker.setLatLng(latlng)
        existingMarker.setIcon(createTruckIcon(driver.status))
        existingMarker.setPopupContent(createPopupContent(driver))
      } else {
        const marker = L.marker(latlng, {
          icon: createTruckIcon(driver.status),
        })
          .addTo(map)
          .bindPopup(createPopupContent(driver))

        marker.on('click', () => {
          onDriverClick?.(driver)
        })

        markersRef.current.set(driver.id_driver, marker)
      }
    })

    if (drivers.length > 0) {
      const bounds = L.latLngBounds(
        drivers.map((d) => [d.latitude, d.longitude] as L.LatLngExpression),
      )
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [drivers, onDriverClick])

  useEffect(() => {
    if (selectedDriverId && mapRef.current) {
      const driver = drivers.find((d) => d.id_driver === selectedDriverId)
      if (driver) {
        mapRef.current.setView([driver.latitude, driver.longitude], 15, { animate: true })
        const marker = markersRef.current.get(selectedDriverId)
        marker?.openPopup()
      }
    }
  }, [selectedDriverId, drivers])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '500px', borderRadius: '12px' }}
    />
  )
}
