"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
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

interface RouteResponse {
  code: string;
  routes: Array<{
    geometry: {
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
  }>;
}

export default function Map() {
  // Punto 1: Bogotá (Origen)
  const position1: [number, number] = [4.711, -74.072];
  
  // Punto 2: Medellín (Destino) - ejemplo
  const position2: [number, number] = [6.2476, -75.5658];
  
  // Centro del mapa (punto medio entre los dos)
  const center: [number, number] = [
    (position1[0] + position2[0]) / 2,
    (position1[1] + position2[1]) / 2
  ];
  
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([position1, position2]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  useEffect(() => {
    // Obtener la ruta real usando OSRM (Open Source Routing Machine)
    const fetchRoute = async () => {
      try {
        // Formato: lon,lat (OSRM usa longitud primero)
        const coordinates = `${position1[1]},${position1[0]};${position2[1]},${position2[0]}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data: RouteResponse = await response.json();
        
        if (data.code === "Ok" && data.routes.length > 0) {
          const route = data.routes[0];
          // Convertir coordenadas de [lon, lat] a [lat, lon] para Leaflet
          const coordinates = route.geometry.coordinates.map(
            ([lon, lat]) => [lat, lon] as [number, number]
          );
          setRouteCoordinates(coordinates);
          setRouteInfo({
            distance: route.distance / 1000, // Convertir a km
            duration: route.duration / 60, // Convertir a minutos
          });
        }
      } catch (error) {
        console.error("Error al obtener la ruta:", error);
        // Si falla, usar línea recta como fallback
        setRouteCoordinates([position1, position2]);
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoute();
  }, []);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg relative">
      {isLoadingRoute && (
        <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">Calculando ruta...</p>
        </div>
      )}
      
      {routeInfo && (
        <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-md">
          <p className="text-sm font-semibold text-gray-800">Información de la ruta</p>
          <p className="text-xs text-gray-600">Distancia: {routeInfo.distance.toFixed(2)} km</p>
          <p className="text-xs text-gray-600">Duración: {routeInfo.duration.toFixed(0)} min</p>
        </div>
      )}
      
      <MapContainer 
        center={center} 
        zoom={7} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Ruta que sigue las carreteras */}
        <Polyline
          positions={routeCoordinates}
          color="blue"
          weight={5}
          opacity={0.8}
          dashArray=""
        />
        
        {/* Marcador 1 - Origen */}
        <Marker position={position1}>
          <Popup>
            <div>
              <strong>Origen</strong>
              <br />
              Bogotá
              <br />
              Vehículo activo
            </div>
          </Popup>
        </Marker>
        
        {/* Marcador 2 - Destino */}
        <Marker position={position2}>
          <Popup>
            <div>
              <strong>Destino</strong>
              <br />
              Medellín
              <br />
              Punto de entrega
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

