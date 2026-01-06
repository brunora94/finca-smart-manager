"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Leaf,
    Carrot,
    Flower2,
    Sprout,
    CloudRain,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    LayoutGrid,
    Trees
} from "lucide-react";

interface Crop {
    id: number;
    name: string;
    variety?: string | null;
    bed?: string | null;
    row?: string | null;
    status: string;
    plantedAt: Date | string;
}

interface GardenGridProps {
    crops: Crop[];
}

const CROP_ICONS: Record<string, any> = {
    "Tomate": Flower2,
    "Lechuga": Leaf,
    "Zanahoria": Carrot,
    "Patata": Sprout,
    "Cebolla": Sprout,
    "Default": Sprout
};

export default function GardenGrid({ crops }: GardenGridProps) {
    const [selectedBed, setSelectedBed] = useState<string | null>(null);

    // Group crops by bed
    const bedsMap = crops.reduce((acc, crop) => {
        const bedName = crop.bed || "Sin Bancal";
        if (!acc[bedName]) acc[bedName] = [];
        acc[bedName].push(crop);
        return acc;
    }, {} as Record<string, Crop[]>);

    const bedNames = Object.keys(bedsMap).sort();
    const activeBed = selectedBed || bedNames[0];
    const cropsInActiveBed = bedsMap[activeBed] || [];

    // Group crops within the active bed by row
    const rowsMap = cropsInActiveBed.reduce((acc, crop) => {
        const rowName = crop.row || "General";
        if (!acc[rowName]) acc[rowName] = [];
        acc[rowName].push(crop);
        return acc;
    }, {} as Record<string, Crop[]>);

    const rowNames = Object.keys(rowsMap).sort();

    const getIcon = (name: string) => {
        for (const key in CROP_ICONS) {
            if (name.toLowerCase().includes(key.toLowerCase())) return CROP_ICONS[key];
        }
        return CROP_ICONS.Default;
    };

    return (
        <div className="space-y-6">
            {/* Bed Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                {bedNames.map(name => (
                    <button
                        key={name}
                        onClick={() => setSelectedBed(name)}
                        className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeBed === name
                                ? 'bg-emerald-600 text-black border-emerald-500 shadow-lg shadow-emerald-900/20'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 gap-8">
                {rowNames.map(row => (
                    <div key={row} className="space-y-3">
                        <div className="flex items-center gap-2 px-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                                FILA: {row}
                            </label>
                            <div className="h-px bg-slate-800 flex-1 ml-2 opacity-50"></div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {rowsMap[row].map(crop => {
                                const Icon = getIcon(crop.name);
                                return (
                                    <Card
                                        key={crop.id}
                                        className="bg-slate-900/80 backdrop-blur-sm border-2 border-slate-800 rounded-[1.8rem] overflow-hidden group hover:border-emerald-500/50 transition-all active:scale-95 duration-200 shadow-xl"
                                    >
                                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                                <Icon className="h-6 w-6 text-emerald-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-white leading-tight uppercase tracking-tight">{crop.name}</h4>
                                                <p className="text-[9px] text-slate-500 font-bold uppercase truncate w-24">{crop.variety || "-"}</p>
                                            </div>

                                            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-full border border-slate-800/50">
                                                <div className={`h-1.5 w-1.5 rounded-full ${crop.status === 'Planted' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`}></div>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                                    {new Date(crop.plantedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                            {/* Visual "Empty" Placeholder to show it's a grid */}
                            <div className="border-2 border-dashed border-slate-800 rounded-[1.8rem] flex items-center justify-center p-6 opacity-30 hover:opacity-50 transition-opacity cursor-pointer">
                                <Leaf className="h-6 w-6 text-slate-600" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {bedNames.length === 0 && (
                <div className="p-12 text-center bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-800">
                    <LayoutGrid className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 italic">No hay cultivos registrados con bancal/fila.</p>
                </div>
            )}
        </div>
    );
}
