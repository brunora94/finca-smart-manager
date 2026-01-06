"use client";

import { useState, useEffect, useCallback } from "react";
import { addCrop, searchPlantSpecies } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Sprout, MapPin, Tag, Search, Loader2, Info, ChevronRight, Sparkles } from "lucide-react";
import { PerenualPlant } from "@/lib/perenual";
import { ALL_PLANTS } from "@/lib/compatibility";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./location-picker"), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center text-slate-500 text-[8px] font-black uppercase tracking-widest">Cargando Mapa Satélite...</div>
});

export default function SmartCropForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<PerenualPlant[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState<PerenualPlant | null>(null);
    const [lat, setLat] = useState(43.43519);
    const [lng, setLng] = useState(-5.68478);

    // Debounced search
    useEffect(() => {
        if (selectedPlant && searchQuery === selectedPlant.common_name) return;

        const timer = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                try {
                    const results = await searchPlantSpecies(searchQuery);
                    setSearchResults(Array.isArray(results) ? results.slice(0, 5) : []);
                } catch (e) {
                    console.error("Search failed:", e);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedPlant]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await addCrop(formData);
        setLoading(false);
        if (result.success) {
            setIsOpen(false);
            setSelectedPlant(null);
            setSearchQuery("");
            if (onSuccess) onSuccess();
        }
    }

    const selectPlant = (plant: PerenualPlant) => {
        setSelectedPlant(plant);
        setSearchQuery(plant.common_name);
        setSearchResults([]);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
                <Plus className="h-5 w-5" />
                Nueva Plantación Inteligente
            </button>
        );
    }

    return (
        <Card className="border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 bg-slate-900 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
                <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Search className="h-5 w-5 text-emerald-500" />
                    Buscador de Especies
                </CardTitle>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300">
                    <X className="h-5 w-5" />
                </button>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                {/* Search Area */}
                <div className="relative z-40">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">¿Qué quieres plantar?</label>
                    <div className="relative group">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? 'text-emerald-500' : 'text-slate-500'}`} />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Ej: Tomate, Lavanda, Manzano..."
                            className="w-full pl-12 pr-12 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white placeholder:text-slate-600 shadow-xl transition-all"
                            autoComplete="off"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {isSearching && <Loader2 className="h-4 w-4 text-emerald-500 animate-spin" />}
                            {!isSearching && searchQuery.length > 0 && (
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSearchResults([]);
                                        setSelectedPlant(null);
                                    }}
                                    className="p-1 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results dropdown */}
                    {searchQuery.length > 2 && !selectedPlant && (
                        <div className="absolute z-[100] w-full mt-2 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {isSearching ? (
                                <div className="p-8 text-center space-y-2">
                                    <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mx-auto" />
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Consultando Perenual API...</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="divide-y divide-slate-800/50">
                                    {searchResults.map(plant => (
                                        <button
                                            key={plant.id}
                                            type="button"
                                            onClick={() => selectPlant(plant)}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-emerald-900/40 transition-all text-left group"
                                        >
                                            {plant.default_image?.thumbnail ? (
                                                <img src={plant.default_image.thumbnail} alt="" className="h-12 w-12 rounded-xl object-cover bg-black border border-slate-800 group-hover:border-emerald-500/50 transition-colors" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-900/60 group-hover:text-emerald-400 transition-all">
                                                    <Sprout className="h-6 w-6" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">{plant.common_name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium italic truncate max-w-[200px]">{plant.scientific_name[0]}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-slate-900/80 space-y-3">
                                    <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-500">
                                        <Info className="h-6 w-6" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                                        No lo encuentro como especie oficial,<br />
                                        <span className="text-emerald-500">pero puedes registrar "{searchQuery}" igualmente.</span>
                                    </p>
                                    <div className="pt-2">
                                        <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full font-black uppercase tracking-tighter border border-emerald-500/20">
                                            ✨ Registro Manual Permitido
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {selectedPlant && (
                    <div className="space-y-4">
                        <div className="bg-emerald-900/20 p-4 rounded-2xl border border-emerald-900/30 flex gap-4 animate-in slide-in-from-top-2">
                            {selectedPlant.default_image?.thumbnail && (
                                <img src={selectedPlant.default_image.thumbnail} alt="" className="h-16 w-16 rounded-xl object-cover shadow-sm bg-black" />
                            )}
                            <div className="space-y-1">
                                <h4 className="font-black text-emerald-400 text-[10px] uppercase tracking-tighter">Ficha Botánica Detectada</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-lg border border-emerald-900/40 text-emerald-300 font-bold">Riego: {selectedPlant.watering}</span>
                                    <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-lg border border-emerald-900/40 text-emerald-300 font-bold">Ciclo: {selectedPlant.cycle}</span>
                                </div>
                            </div>
                        </div>

                        {/* Companion Advice */}
                        {(() => {
                            const plantInfo = ALL_PLANTS.find(p =>
                                selectedPlant.common_name.toLowerCase().includes(p.name.toLowerCase()) ||
                                p.name.toLowerCase().includes(selectedPlant.common_name.toLowerCase())
                            );
                            if (!plantInfo) return null;

                            return (
                                <div className="bg-blue-900/10 p-4 rounded-2xl border border-blue-900/20 space-y-2 animate-in fade-in duration-500">
                                    <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="h-3 w-3" />
                                        Compañeros Recomendados
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {plantInfo.compatibilities.filter(c => c.type === 'Excellent' || c.type === 'Good').map(c => (
                                            <span key={c.target} className="text-[9px] bg-blue-500/10 text-blue-300 px-2 py-1 rounded-lg font-bold border border-blue-500/10">
                                                + {c.target}
                                            </span>
                                        ))}
                                        {plantInfo.compatibilities.filter(c => c.type === 'Antagonistic' || c.type === 'Bad').map(c => (
                                            <span key={c.target} className="text-[9px] bg-red-500/10 text-red-400 px-2 py-1 rounded-lg font-bold border border-red-500/10">
                                                ❌ {c.target}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-500 italic mt-1 font-medium">
                                        {plantInfo.description}
                                    </p>
                                </div>
                            );
                        })()}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-800">
                    <input type="hidden" name="name" value={selectedPlant?.common_name || searchQuery} />
                    <input type="hidden" name="imageUrl" value={selectedPlant?.default_image?.original_url || ""} />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block px-1">Variedad Específica</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                    name="variety"
                                    placeholder="Ej: Corazón de buey"
                                    className="w-full pl-10 pr-4 py-3 bg-black border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-white placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block px-1">Cama/Bancal</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                    name="bed"
                                    placeholder="Ej: Bancal 1"
                                    className="w-full pl-10 pr-4 py-3 bg-black border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-white placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block px-1">Línea/Fila</label>
                            <div className="relative">
                                <Info className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                    name="row"
                                    placeholder="Ej: Fila 4"
                                    className="w-full pl-10 pr-4 py-3 bg-black border border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-white placeholder:text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-emerald-500" />
                                Ubicación Exacta
                            </p>
                            <span className="text-[8px] bg-black px-2 py-0.5 rounded-lg border border-slate-800 text-slate-500 font-bold">
                                {lat.toFixed(5)}, {lng.toFixed(5)}
                            </span>
                        </div>

                        <LocationPicker
                            initialLat={lat}
                            initialLng={lng}
                            onLocationChange={(newLat, newLng) => {
                                setLat(newLat);
                                setLng(newLng);
                            }}
                        />

                        {/* Hidden inputs for form submission */}
                        <input name="latitude" type="hidden" value={lat} />
                        <input name="longitude" type="hidden" value={lng} />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || (!selectedPlant && searchQuery.length < 2)}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sprout className="h-5 w-5" />}
                        {loading ? "Guardando..." : "Registrar Plantación"}
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}
