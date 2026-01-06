"use client";

import { useState } from "react";
import { addCrop } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Sprout, MapPin, Tag, FileText, Navigation } from "lucide-react";

export default function CropForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await addCrop(formData);
        setLoading(false);
        if (result.success) {
            setIsOpen(false);
            if (onSuccess) onSuccess();
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
                <Plus className="h-5 w-5" />
                Nueva Plantación
            </button>
        );
    }

    return (
        <Card className="border-emerald-100 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Sprout className="h-5 w-5 text-emerald-600" />
                    Registrar Cultivo
                </CardTitle>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                </button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nombre del Cultivo</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    name="name"
                                    required
                                    placeholder="Ej: Tomate, Patata..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Variedad</label>
                            <input
                                name="variety"
                                placeholder="Ej: Corazón de buey"
                                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Ubicación</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    name="location"
                                    placeholder="Ej: Bancal 2"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Navigation className="h-3 w-3" />
                            Coordenadas (Opcional)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                name="latitude"
                                type="number"
                                step="0.000001"
                                placeholder="Latitud"
                                className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs"
                            />
                            <input
                                name="longitude"
                                type="number"
                                step="0.000001"
                                placeholder="Longitud"
                                className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg text-xs"
                            />
                        </div>
                        <p className="text-[9px] text-slate-400 italic">Usado para centrar el sensor de clima en el mapa.</p>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Notas Iniciales</label>
                        <textarea
                            name="notes"
                            rows={2}
                            placeholder="Ej: Semillas propias de la temporada anterior..."
                            className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? "Registrando..." : "Guardar Cultivo"}
                        {!loading && <Sprout className="h-4 w-4" />}
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}
