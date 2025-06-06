import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Record } from "@/types";
import { router } from "@inertiajs/react";

// Solucionar rutas de iconos predeterminados
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

export function MapShow({record}: { record: Record }) {
  

  return (
    <div className="h-[50vh]" >
      <MapContainer
        center={[record.latitude ?? 37.62, record.longitude ?? -0.99]}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoom={19}
        >
        <TileLayer
          maxNativeZoom={19}
          maxZoom={20}
          minZoom={1}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {record && (
          <Marker  position={[record.latitude, record.longitude]} eventHandlers={{
            click: () => {
              router.visit(`/map`, {
                method: 'get',
                data: {
                  record_id: record.id,
                },
              }
              );
            },
          }}>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}