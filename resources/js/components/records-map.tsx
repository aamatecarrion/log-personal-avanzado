import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { useRecordsStore } from "@/store/recordsStore";
import { Record } from "@/types";
import { router } from "@inertiajs/react";


export function RecordsMap() {

  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const fetchRecords = useRecordsStore((state) => state.fetchRecords);
  const fetchedRecords = useRecordsStore((state) => state.records);

  // Cargar los registros cuando el componente se monta
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Filtramos solo los registros que tienen latitud y longitud
  useEffect(() => {
    if (fetchedRecords) {
      const filteredRecords = fetchedRecords.filter(
        (record) => record.latitude && record.longitude
      );
      setFilteredRecords(filteredRecords);
    }
  }, [fetchedRecords]);

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
            <Marker key={record.id} position={position}>
              <Popup>
                <div className="cursor-pointer" onClick={() => router.visit(`/records/${record.id}`)}>
                  <h3>{record.title}</h3>
                  <p>{record.description}</p>
                  <small>{record.date_diff}</small>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}