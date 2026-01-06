"use client";

import { useState } from "react";
import { updateCrop } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Settings2, Save, Calendar, MapPin, Tag, Info, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export default function EditCropModal({ crop }: { crop: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await updateCrop(crop.id, formData);
        setLoading(false);
        if (result.success) {
            setIsOpen(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-300 active:scale-95 transition-transform shadow-sm border border-slate-800"
                title="Editar propiedades"
            >
                <Settings2 className="h-5 w-5" />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-lg border border-slate-800 shadow-2xl bg-black rounded-[2rem] overflow-hidden animate-in slide-in-from-bottom-4 duration-300 text-white">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4 bg-slate-900/50">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-emerald-500" />
                        Editar Cultivo
                    </CardTitle>
                    <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </CardHeader>
                <CardContent className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-black">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nombre Común</label>
                            <input
                                name="name"
                                defaultValue={crop.name}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-white shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Variedad</label>
                                <input
                                    name="variety"
                                    defaultValue={crop.variety || ""}
                                    placeholder="Ej: Cherry"
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-white placeholder:text-slate-700"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Ubicación</label>
                                <input
                                    name="location"
                                    defaultValue={crop.location || ""}
                                    placeholder="La Finquina"
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-white placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cama/Bancal</label>
                                <input
                                    name="bed"
                                    defaultValue={(crop as any).bed || ""}
                                    placeholder="Bancal 1"
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-white placeholder:text-slate-700"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Línea/Fila</label>
                                <input
                                    name="row"
                                    defaultValue={(crop as any).row || ""}
                                    placeholder="Fila 4"
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-white placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Fecha de Plantación
                            </label>
                            <input
                                name="plantedAt"
                                type="date"
                                defaultValue={new Date(crop.plantedAt).toISOString().split('T')[0]}
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-white"
                            />
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                Geo-Posicionamiento
                            </p>
                            <div className="grid grid-cols-2 gap-3 opacity-60">
                                <input
                                    name="latitude"
                                    type="number"
                                    step="0.000001"
                                    defaultValue={crop.latitude || ""}
                                    placeholder="Latitud"
                                    className="w-full px-3 py-2 bg-black border border-slate-800 rounded-lg text-xs text-white"
                                />
                                <input
                                    name="longitude"
                                    type="number"
                                    step="0.000001"
                                    defaultValue={crop.longitude || ""}
                                    placeholder="Longitud"
                                    className="w-full px-3 py-2 bg-black border border-slate-800 rounded-lg text-xs text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Notas Adicionales</label>
                            <textarea
                                name="notes"
                                defaultValue={crop.notes || ""}
                                className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm font-medium h-24 resize-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-slate-700 shadow-inner"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
