import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { useRecordsStore } from "@/store/recordsStore";
import { Record } from "@/types";
import { router } from "@inertiajs/react";

export function RecordsMap({ records }: { records: Record[] }) {
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);

  useEffect(() => {
    if (records) {
      const filtered = records.filter(
        (record) => record.latitude && record.longitude
      );
      setFilteredRecords(filtered);
    }
  }, [records]);

  return (
    <div style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <MapContainer
        center={[37.62, -0.99]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredRecords.map((record) => {
          const position: LatLngExpression = [record.latitude, record.longitude];
          
          return (
            <Marker
              key={record.id}
              position={position}
              eventHandlers={{
                click: (e) => {
                  e.target.openPopup();
                },
                mouseover: (e) => {
                  e.target.openPopup();
                },
                mouseout: (e) => {
                  e.target.closePopup();
                }
              }}
            >
              <Popup
                closeButton={false}
                className="custom-popup"
                autoClose={false}
                closeOnClick={false}
              >
                <div 
                  className="cursor-pointer" 
                  onClick={() => router.visit(`/records/${record.id}`)}
                >
                  <h3 className="font-semibold mb-1">{record.title}</h3>
                  <p className="text-sm line-clamp-2">{record.description}</p>
                  {record.image && (
                    
                      <img
                        src={route('api.images.show', record.image.id)}
                        alt={`Imagen ${record.image.id}`}
                        className="rounded-lg shadow max-h-full object-contain"
                      />
                  
                )}
                  <small className="text-gray-500">{record.date_diff}</small>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}