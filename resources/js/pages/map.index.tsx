import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { NullableLocation, Record, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from "react-leaflet";
import { LatLngExpression, Marker as LeafletMarker } from "leaflet";
import { router } from "@inertiajs/react";
import { spanishTimestampConvert } from "@/lib/utils";
import { LocateIcon, LocateOffIcon } from "lucide-react";
import L from "leaflet";
import { useAutoReload } from '@/hooks/useAutoReload';
import { Slider } from "@/components/ui/slider"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mapa',
        href: '/map',
    },
];
export default function Map({records, record}: { records: Record[], record: Record | null }) {

    const [selectedMarker, setSelectectMarker] = useState<Record | null>();
    const [error, setError] = useState<boolean>(false);
    const [location, setLocation] = useState<NullableLocation>(null);
    const [locationFixed, setLocationFixed] = useState<boolean>(false);
    const [satelliteOpacity, setSatelliteOpacity] = useState(1); // entre 0 y 1

    
    const user = usePage<any>().props.auth.user;

    useEffect(() => {
        window.Echo
        .private(`user.${user.id}`)
        .listen('.records.update', (e: any) => {
            router.reload({ showProgress: false });
        });

        return () => {
            window.Echo.leaveChannel(`private-user.${user.id}`);
        };
    }, []);
    
    useEffect(() => {
        if (record) setSelectectMarker(record)
    }, [record]);

    useEffect(() => {
        console.log("Location:", location)
        console.log("Location fixed:", locationFixed)
        if (location && locationFixed === true) flyToLocation(location);
    }, [location, locationFixed]);

    const LocateFixedCustomIcon = ({ className = '' }) => (
        <svg
            className={className}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
    );

    function flyToLocation(pos: NullableLocation) {
        if (!pos) return;
        const map = mapRef.current;
        const center= map.getCenter()
        const trucatedDigits = 5
        const truncatedCenter = {
            lat: Number(center.lat.toFixed(trucatedDigits)),
            lng: Number(center.lng.toFixed(trucatedDigits)),
        };
        const truncatedPos = {
            latitude: Number(pos.latitude.toFixed(trucatedDigits)),
            longitude: Number(pos.longitude.toFixed(trucatedDigits)),
        };
        if (truncatedCenter.lat === truncatedPos.latitude && truncatedCenter.lng === truncatedPos.longitude) return;
        
        const currentZoom = map.getZoom();
        const targetZoom = currentZoom < 17 ? 17 : currentZoom;
        const zoomChanged = currentZoom !== targetZoom;

        map.flyTo(
            [pos.latitude, pos.longitude],
            targetZoom,
            {
                animate: zoomChanged,
                duration: zoomChanged ? 2 : 0
            }
        );

    }

    function CreateLabelPane() {
        const map = useMap();

        useEffect(() => {
            if (!map.getPane("labels")) {
            const pane = map.createPane("labels");
            }
        }, [map]);

        return null;
    }
    function MapEvents({ onDragStart }: { onDragStart: () => void }) {
        useMapEvents({
            dragstart() {
                onDragStart();
            },
        });
        return null;
    }

    useEffect(() => {

        if ("geolocation" in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    console.log(position)
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    console.log("New location:", newLocation)
                    setLocation(newLocation);
                    setError(false);
                    if (locationFixed) {
                        flyToLocation(newLocation);
                    }
                },
                (error) => {
                    console.error("Error obteniendo ubicación:", error);
                    setError(true);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000
                }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            window.alert("You are going to Brazil!")
            setLocation({latitude: -22.931285, longitude: -43.171638, accuracy: 10});
        }
    }, []);

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
            <Head title="Mapa" />
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
                    <MapEvents onDragStart={() => setLocationFixed(false)} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxNativeZoom={19}
                        maxZoom={22}  
                    />  
                    <TileLayer
                        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, etc."
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        maxNativeZoom={19}
                        maxZoom={22}
                        opacity={satelliteOpacity}
                        errorTileUrl='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                        <CreateLabelPane />
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                        attribution="© Esri"
                        opacity={satelliteOpacity}
                        pane="labels"
                    />

                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                        attribution="© Esri"
                        opacity={satelliteOpacity}
                        pane="labels"
                    />
                    <div className="absolute bottom-10 right-5 z-1000">
                        <button onClick={() => setLocationFixed(!locationFixed)} className="bg-white text-gray-500 p-2  rounded-[50%] shadow-md cursor-pointer">
                            {   
                                location === null 
                                ? <LocateOffIcon className='w-10 h-10 text-red-500'/> 
                                : locationFixed 
                                ? <LocateFixedCustomIcon className="w-10 h-10 text-blue-500" />
                                :  <LocateIcon className='w-10 h-10'/>
                            }
                        </button>
                    </div>
                     {/* Slider de opacidad */}
                    <div className="absolute top-5 right-5 w-[200px] z-[1000] bg-white/70 rounded-xl shadow px-2">
                        <Slider 
                        className="cursor-pointer w-full h-5"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[satelliteOpacity]}
                        onValueChange={(value) => setSatelliteOpacity(value[0])}
                        />
                    </div>
                    
                    {location && (() => {
                        const center: LatLngExpression = [location.latitude, location.longitude];

                        return (
                            <>
                                <Marker
                                    position={center}
                                    icon={L.icon({ iconUrl: 'location_dot.png', iconSize: [20, 20], iconAnchor: [9.5, 11.5] })}
                                />
                                <Circle
                                    center={center}
                                    radius={location.accuracy}
                                    pathOptions={{ fillColor: '#0084ff2f', color: "#0084ff6c" }}
                                />
                            </>
                        );
                    })()}
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