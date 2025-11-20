"use client";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { OptimizedRoute } from '@/types/cargoTypes';
import { VehiclePosition } from '@/services/gpsTrackingService';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet en Next.js
if (typeof window !== "undefined") {
  const L = require("leaflet");
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Componente para ajustar el mapa a las rutas
function MapBounds({ routes }: { routes: OptimizedRoute[] }) {
  const map = useMap();

  useEffect(() => {
    if (routes.length === 0) return;

    const bounds: [number, number][] = [];

    routes.forEach(route => {
      // Agregar origen
      if (route.origin_latitude && route.origin_longitude) {
        bounds.push([route.origin_latitude, route.origin_longitude]);
      }

      // Agregar coordenadas de la ruta
      route.route_coordinates.forEach((coord) => {
        const [lat, lng] = coord;
        if (lat && lng) {
          bounds.push([lat, lng]);
        }
      });

      // Agregar destinos
      route.assignments.forEach(assignment => {
        if (assignment.cargo.destination_latitude && assignment.cargo.destination_longitude) {
          bounds.push([
            assignment.cargo.destination_latitude,
            assignment.cargo.destination_longitude
          ]);
        }
      });
    });

    if (bounds.length > 0) {
      // @ts-ignore - Leaflet types
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routes, map]);

  return null;
}

interface OptimizedRouteMapProps {
  routes: OptimizedRoute[];
  vehiclePositions?: Map<number, VehiclePosition>; // Mapa de id_vehicle -> posición
  showVehicleTracking?: boolean;
}

export default function OptimizedRouteMap({
  routes,
  vehiclePositions = new Map(),
  showVehicleTracking = false
}: OptimizedRouteMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<OptimizedRoute | null>(null);

  // Colores para diferentes rutas
  const routeColors = [
    '#3b82f6', // azul
    '#10b981', // verde
    '#f59e0b', // amarillo
    '#ef4444', // rojo
    '#8b5cf6', // morado
    '#ec4899'  // rosa
  ];

  // Centro por defecto (Bogotá)
  const defaultCenter: [number, number] = [4.711, -74.072];

  if (routes.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No hay rutas para mostrar</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg relative">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapBounds routes={routes} />

        {/* Renderizar cada ruta */}
        {routes.map((route, routeIndex) => {
          const routeColor = routeColors[routeIndex % routeColors.length];
          const vehiclePosition = vehiclePositions.get(route.id_vehicle);

          return (
            <div key={route.route_code}>
              {/* Línea de ruta */}
              {route.route_coordinates && route.route_coordinates.length > 0 ? (
                <Polyline
                  positions={route.route_coordinates}
                  color={routeColor}
                  weight={5}
                  opacity={0.7}
                  dashArray=""
                />
              ) : (
                // Si no hay coordenadas de ruta, dibujar línea recta entre origen y destinos
                route.assignments.length > 0 && route.origin_latitude && route.origin_longitude && (
                  <>
                    {route.assignments.map((assignment, idx) => {
                      if (!assignment.cargo.destination_latitude || !assignment.cargo.destination_longitude) {
                        return null
                      }
                      return (
                        <Polyline
                          key={`fallback-${route.route_code}-${idx}`}
                          positions={[
                            [route.origin_latitude, route.origin_longitude],
                            [assignment.cargo.destination_latitude, assignment.cargo.destination_longitude]
                          ]}
                          color={routeColor}
                          weight={3}
                          opacity={0.5}
                          dashArray="10, 5"
                        />
                      )
                    })}
                  </>
                )
              )}

              {/* Marcador de origen */}
              {route.origin_latitude && route.origin_longitude && (
                <Marker
                  position={[route.origin_latitude, route.origin_longitude]}
                  key={`origin-${route.route_code}`}
                >
                  <Popup>
                    <div>
                      <strong>Origen - {route.route_code}</strong>
                      <br />
                      {route.origin_address}
                      <br />
                      <span className="text-xs text-gray-500">
                        Vehículo: {route.assignments[0]?.vehicle.license_plate}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Marcadores de destino (paradas) */}
              {route.assignments.map((assignment, index) => {
                if (!assignment.cargo.destination_latitude || !assignment.cargo.destination_longitude) {
                  return null;
                }

                return (
                  <Marker
                    key={`stop-${route.route_code}-${assignment.cargo.id_cargo}`}
                    position={[
                      assignment.cargo.destination_latitude,
                      assignment.cargo.destination_longitude
                    ]}
                  >
                    <Popup>
                      <div>
                        <strong>Parada {assignment.route_order}</strong>
                        <br />
                        {assignment.cargo.destination_address}
                        <br />
                        <span className="text-xs">
                          Carga: {assignment.cargo.description}
                        </span>
                        <br />
                        <span className="text-xs">
                          Peso: {assignment.cargo.weight} kg
                        </span>
                        {assignment.cargo.recipient_name && (
                          <>
                            <br />
                            <span className="text-xs">
                              Destinatario: {assignment.cargo.recipient_name}
                            </span>
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Marcador de vehículo en tiempo real */}
              {showVehicleTracking && vehiclePosition && (
                <Marker
                  key={`vehicle-${route.id_vehicle}`}
                  position={[vehiclePosition.latitude, vehiclePosition.longitude]}
                >
                  <Popup>
                    <div>
                      <strong>Vehículo en Ruta</strong>
                      <br />
                      Placa: {route.assignments[0]?.vehicle.license_plate}
                      <br />
                      Estado: {vehiclePosition.status}
                      {vehiclePosition.speed && (
                        <>
                          <br />
                          Velocidad: {vehiclePosition.speed.toFixed(0)} km/h
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )}
            </div>
          );
        })}
      </MapContainer>

      {/* Panel de información de rutas */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm max-h-64 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-2">Rutas Optimizadas</h3>
        <div className="space-y-2">
          {routes.map((route, index) => {
            const routeColor = routeColors[index % routeColors.length];
            return (
              <div
                key={route.route_code}
                className="border-l-4 p-2 rounded"
                style={{ borderColor: routeColor }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{route.route_code}</span>
                  <span className="text-xs text-gray-500">{route.status}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  <p>Vehículo: {route.assignments[0]?.vehicle.license_plate}</p>
                  <p>Conductor: {route.assignments[0]?.driver.first_name} {route.assignments[0]?.driver.last_name}</p>
                  <p>Paradas: {route.assignments.length}</p>
                  <p>Distancia: {route.total_distance.toFixed(2)} km</p>
                  <p>Duración: {route.total_duration.toFixed(0)} min</p>
                  <p>Peso total: {route.total_weight.toFixed(2)} kg</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

