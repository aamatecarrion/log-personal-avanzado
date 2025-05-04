import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { useRecordsStore } from "@/store/recordsStore";
import { Record } from "@/types";
import { router } from "@inertiajs/react";


export function MapShow() {
  
  const selectedRecord = useRecordsStore((state) => state.selectedRecord);

  return (
    <div className="h-full w-full" >
      <MapContainer
        center={[selectedRecord?.latitude ?? 37.62, selectedRecord?.longitude ?? -0.99]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {selectedRecord && (
          <Marker position={[selectedRecord.latitude, selectedRecord.longitude]}>
            <Popup>
              <div>
                <h3>{selectedRecord.title}</h3>
                <p>{selectedRecord.description}</p>
                <small>{selectedRecord.date_diff}</small>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}