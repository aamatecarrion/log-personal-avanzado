import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Record, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression, Marker as LeafletMarker } from "leaflet";
import { router } from "@inertiajs/react";
import { spanishTimestampConvert } from "@/lib/utils";
import { LocateIcon, LocateOffIcon } from "lucide-react";
import { useAutoReload } from '@/hooks/useAutoReload';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Map',
        href: '/map',
    },
];
export default function Map({records, record}: { records: Record[], record: Record | null }) {

    const [selectedMarker, setSelectectMarker] = useState<Record | null>();
    
    useEffect(() => {
        if (record) setSelectectMarker(record)
    }, [record]);
    
    useEffect(() => {
        console.log(selectedMarker)
        if (selectedMarker && markerRefs.current[selectedMarker.id]) {
            const marker = markerRefs.current[selectedMarker.id];
            const map = mapRef.current;

            const latlng = marker.getLatLng();
            let targetZoom = map.getZoom();
            let offSet = 0.0005;
            if (targetZoom < 19) targetZoom = 19;
            if (targetZoom == 20) offSet = 0.00025;
            if (targetZoom == 21) offSet = 0.00014;
            if (targetZoom == 22) offSet = 0.00007;
            
            marker.openPopup();
            map.flyTo([latlng.lat + offSet, latlng.lng], targetZoom, { animate: true } );

        }
    }, [selectedMarker]);
 
    const mapRef = useRef<any>(null);
    const markerRefs = useRef<{ [key: string]: LeafletMarker }>({});
  
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Map" />
            <div style={{ height: "100%", width: "100%", zIndex: 0 }}>
                <MapContainer
                    ref={mapRef}
                    center={[37.62, -0.99]}
                    zoom={13}
                    maxBounds={ [[-90, -180], [90, 180]]}
                    maxBoundsViscosity={1}
                    minZoom={2}
                    maxZoom={22}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxNativeZoom={19}
                        maxZoom={22}  
                    />
                        {records.map((record) => {
                            const position: LatLngExpression = [record.latitude, record.longitude];
                        
                            return (
                                <Marker
                                    key={record.id}
                                    riseOnHover={true}
                                    position={position}
                                    ref={(ref) => {if (ref) {markerRefs.current[record.id] = ref;}}}
                                    eventHandlers={{click: () => {setSelectectMarker(record);}}}
                                >
                                <Popup
                                    closeButton={false}
                                    className="custom-popup position-relative bottom-1 "
                                >
                                    <div className="cursor-pointer" onClick={() => router.visit(`/records/${record.id}`)}>
                                        <h3 className="font-semibold mb-2 text-lg">{record.title}</h3>
                                        
                                        {/* Contenedor de la imagen */}
                                        {record.image?.id && (
                                            <>
                                            <div className="mb-2 rounded-lg">
                                                <img
                                                    src={route('images.show', record.image?.id)}
                                                    alt={`Imagen de ${record.title}`}
                                                    className="max-h-60 object-cover rounded-lg shadow"
                                                />
                                            </div>
                                            <div className="flex flex-col mb-2">
                                                <div className="text-sm"><strong>Nombre original:</strong> {record.image.original_filename}</div>
                                            </div>
                                            </>
                                        )}
                                        {record.image?.file_date ? (
                                            <div className="flex flex-col mb-2">
                                                <div className="text-sm"><strong>Fecha del archivo: </strong>{spanishTimestampConvert(record.image.file_date)}</div>
                                            </div>
                                            ) : (
                                            <div className="flex flex-col mb-2">
                                                <div className="text-sm">{spanishTimestampConvert(record.created_at)}</div>
                                            </div>
                                            )
                                        }
                                        {record.description && (
                                            <div className="flex flex-col mb-2">
                                                <strong>Descripción:</strong>
                                                <div className="text-sm">{record.description}</div>
                                            </div>
                                        )}
                                        <span>{(record.image?.file_date_diff ?? record.date_diff).charAt(0).toUpperCase() + (record.image?.file_date_diff ?? record.date_diff).slice(1)}</span>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
    
                </MapContainer>
            </div>
        </AppLayout>
    );
}