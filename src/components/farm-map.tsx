"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icons in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface MapProps {
    crops: any[];
    trees: any[];
    rainfallToday: number;
    history: any[];
}

export default function FarmMap({ crops, trees, rainfallToday, history }: MapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-[2rem]" />;

    // Default center: La Finquina (Asturias)
    const center: [number, number] = [43.43519, -5.68478];

    // Smart Irrigation Logic: Check sum of last 3 days
    const last3DaysRain = history.slice(0, 3).reduce((acc, current) => acc + (current.precipitation || 0), 0);
    const avgHumidity = history.length > 0
        ? history[0].humidity || 0
        : 0;

    return (
        <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-900 h-[500px] relative">
            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    background: #0f172a !important;
                    color: white !important;
                    border-radius: 1.5rem !important;
                    border: 1px solid #1e293b !important;
                    padding: 0 !important;
                    overflow: hidden;
                }
                .leaflet-popup-tip {
                    background: #0f172a !important;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    width: auto !important;
                }
            `}</style>

            <MapContainer
                center={center}
                zoom={18}
                scrollWheelZoom={false}
                className="h-full w-full grayscale-[0.2] contrast-[1.1]"
            >
                {/* Esri Satellite Layer */}
                <TileLayer
                    attribution='&copy; Edición Master Finquina'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />

                {crops.filter(c => c.latitude && c.longitude).map(crop => (
                    <Marker
                        key={`crop-${crop.id}`}
                        position={[crop.latitude, crop.longitude]}
                        icon={icon}
                    >
                        <Popup>
                            <div className="p-4 w-[180px] bg-slate-900">
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-1 block">Huerto Activo</span>
                                <h3 className="font-black text-white text-sm">{crop.name}</h3>
                                <p className="text-[10px] text-slate-400 font-bold">{crop.variety}</p>

                                <div className={`mt-3 py-2 px-3 rounded-xl text-[10px] font-black text-center border ${last3DaysRain > 5 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                    {last3DaysRain > 5 ? "💧 SUELO HÚMEDO" : "⚠️ REQUIERE RIEGO"}
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800">
                                    <span className="text-[8px] text-slate-500 font-bold uppercase">Cama/Línea</span>
                                    <span className="text-[8px] text-white font-black">{crop.bed || '-'}/{crop.row || '-'}</span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {trees.filter(t => t.latitude && t.longitude).map(tree => (
                    <Marker
                        key={`tree-${tree.id}`}
                        position={[tree.latitude, tree.longitude]}
                        icon={icon}
                    >
                        <Popup>
                            <div className="p-4 w-[180px] bg-slate-900 text-white">
                                <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 mb-1 block">Árbol Frutal</span>
                                <h3 className="font-black text-white text-sm">{tree.name}</h3>
                                <div className="mt-2 text-[10px] font-bold text-slate-400">Salud: <span className="text-emerald-400">{tree.health}</span></div>
                                <div className={`mt-3 py-2 px-3 rounded-xl text-[10px] font-black text-center border ${last3DaysRain > 3 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                    {last3DaysRain > 3 ? "💧 ESTADO OK" : "⚠️ REVISAR RIEGO"}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Premium Floating Info Overlay */}
            <div className="absolute top-6 right-6 z-[1000] bg-black/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-slate-800 text-xs w-44">
                <div className="space-y-4">
                    <div>
                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-500 mb-1">Precipitación Hoy</p>
                        <p className="text-blue-400 font-black text-2xl tracking-tighter">
                            {rainfallToday.toFixed(1)}
                            <span className="text-xs ml-1 opacity-50 font-bold uppercase tracking-tight">mm</span>
                        </p>
                    </div>
                    <div className="pt-3 border-t border-slate-800/50">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-[9px] uppercase tracking-widest font-black text-slate-500">Acumulado 72h</p>
                            <span className={`h-2 w-2 rounded-full ${last3DaysRain > 5 ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`}></span>
                        </div>
                        <p className="text-slate-100 font-black text-lg">{last3DaysRain.toFixed(1)} <span className="text-[10px] text-slate-500">mm</span></p>
                    </div>
                    <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center">
                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-500">Humedad</p>
                        <p className="text-slate-100 font-black">{avgHumidity}%</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
