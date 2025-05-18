import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { useRecordsStore } from "@/store/recordsStore";
import { Record } from "@/types";
import { router } from "@inertiajs/react";


export function MapShow({record}: { record: Record }) {
  

  return (
    <div className="h-[50vh]" >
      <MapContainer
        center={[record.latitude ?? 37.62, record.longitude ?? -0.99]}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
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
            }
          }}>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}