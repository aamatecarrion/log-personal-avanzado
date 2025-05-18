import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression, Marker as LeafletMarker } from "leaflet";
import { useRecordsStore } from "@/store/recordsStore";
import { Record } from "@/types";
import { router } from "@inertiajs/react";
import { spanishTimestampConvert } from "@/lib/utils";
import { LocateIcon, LocateOffIcon } from "lucide-react";

export function RecordsMap({ records, selectedRecord }: { records: Record[], selectedRecord: Record | null }) {
  
  const [selectedMarker, setSelectectMarker] = useState<Record | null>(selectedRecord);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<{ [key: string]: LeafletMarker }>({});

  useEffect(() => {
    if (records) {
      const filtered = records.filter(
        (record) => record.latitude && record.longitude
      );
      setFilteredRecords(filtered);
    }
  }, [records]);
  const centerMap = useCallback((marker: LeafletMarker) => {
    let { lat, lng } = marker.getLatLng();
      lat = lat + 0.0012;
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lng] , 18, {
          animate: true,
          duration: 3
        });
      }
    }, []);

  useEffect(() => {
    if (selectedMarker && markerRefs.current[selectedMarker.id]) {
      const marker = markerRefs.current[selectedMarker.id];
      centerMap(marker);
      marker.openPopup();
    }
  }, [selectedMarker,filteredRecords, centerMap]);


  return (
    <div style={{ height: "100%", width: "100%", zIndex: 0 }}>
      <MapContainer
        ref={mapRef}
        center={[37.62, -0.99]}
        zoom={selectedRecord ? 19 : 13}
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
              riseOnHover={true}
              position={position}
              ref={(ref) => {
                if (ref) {
                  markerRefs.current[record.id] = ref;
                }
              }}
              eventHandlers={{
                click: () => {
                  setSelectectMarker(record);
                },
              }}
            >
              <Popup
                closeButton={false}
                className="custom-popup"
                autoClose={true}
                closeOnClick={true}
                
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => router.visit(`/records/${record.id}`)}
                >
                  <h3 className="font-semibold mb-2 text-lg">{record.title}</h3>
                  
                  {/* Contenedor de la imagen */}
                  {record.image?.id && (
                    <>
                    <div className="mb-2 rounded-lg">
                      <img
                        src={route('api.images.show', record.image?.id)}
                        alt={`Imagen de ${record.title}`}
                        className="max-h-60 object-cover rounded-lg shadow"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="text-sm space-y-1">
                        <p><strong>Nombre original:</strong> {record.image.original_filename}</p>
                        {record.image.file_date && (
                          <p><strong>Fecha del archivo:</strong> {spanishTimestampConvert(record.image.file_date)}</p>
                        )}
                      </div>
                    </div>
                    </>
                  )}
                  {
                    record.image?.file_date ? (
                      <p className="text-sm mb-2">{spanishTimestampConvert(record.image.file_date)}</p>
                    ) : (
                      <p className="text-sm mb-2">{spanishTimestampConvert(record.created_at)}</p>
                    )
                  }
                  <p className="text-sm line-clamp-2 mb-2">{record.description}</p>
                  <span>{record.image?.file_date_diff ?? record.date_diff}</span>
                  
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}