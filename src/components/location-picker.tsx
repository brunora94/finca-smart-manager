"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix icon issue
const icon = L.icon({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function LocationPicker({
    initialLat,
    initialLng,
    onLocationChange
}: {
    initialLat: number,
    initialLng: number,
    onLocationChange: (lat: number, lng: number) => void
}) {
    const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);

    const handleSelect = (lat: number, lng: number) => {
        setPosition([lat, lng]);
        onLocationChange(lat, lng);
    };

    return (
        <div className="h-[200px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner group relative">
            <MapContainer
                center={position}
                zoom={18}
                style={{ height: '100%', width: '100%' }}
                className="grayscale-[0.5] contrast-[1.2] hover:grayscale-0 transition-all duration-700"
            >
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; ESRI Satellite'
                />
                <Marker position={position} icon={icon} />
                <MapEvents onLocationSelect={handleSelect} />
            </MapContainer>
            <div className="absolute top-3 right-3 z-[1000] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 pointer-events-none">
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Pinchar para reubicar</p>
            </div>
        </div>
    );
}
