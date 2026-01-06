"use client";

import { useState } from "react";
import { addTree } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, TreeDeciduous, MapPin, Calendar, Heart, Navigation } from "lucide-react";

export default function TreeForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const result = await addTree(formData);
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
                className="w-full bg-slate-900 text-emerald-400 py-4 rounded-2xl font-black border-2 border-dashed border-slate-800 hover:bg-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
            >
                <Plus className="h-5 w-5" />
                Añadir Árbol Frutal
            </button>
        );
    }

    return (
        <Card className="bg-slate-900 border-slate-800 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-800">
                <CardTitle className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
                    <TreeDeciduous className="h-5 w-5 text-amber-500" />
                    Nuevo Frutal
                </CardTitle>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Nombre del Árbol</label>
                            <input
                                name="name"
                                required
                                placeholder="Ej: Manzano Reineta, Peral..."
                                className="w-full px-4 py-3 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-medium text-white placeholder:text-slate-600"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Año de Plantación</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                    name="plantedYear"
                                    type="number"
                                    placeholder="Ej: 2022"
                                    className="w-full pl-10 pr-4 py-3 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-medium text-white placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Estado de Salud</label>
                            <div className="relative">
                                <Heart className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                                <select
                                    name="health"
                                    className="w-full pl-10 pr-4 py-3 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-medium appearance-none text-white"
                                >
                                    <option value="Sano">Sano</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Enfermo">Enfermo</option>
                                    <option value="Pulgón">Pulgón / Plaga</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-2xl space-y-3 border border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Navigation className="h-3 w-3" />
                            Ubicación Exacta (Coordenadas)
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <input name="latitude" type="number" step="0.000001" placeholder="Latitud" className="w-full px-3 py-2 bg-black border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600" />
                            <input name="longitude" type="number" step="0.000001" placeholder="Longitud" className="w-full px-3 py-2 bg-black border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600" />
                        </div>
                    </div>

                    <textarea
                        name="notes"
                        placeholder="Notas sobre el injerto, poda o cuidados..."
                        className="w-full px-4 py-3 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500 text-sm font-medium resize-none text-white placeholder:text-slate-600"
                        rows={3}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 text-black py-4 rounded-2xl font-black shadow-xl hover:bg-amber-500 disabled:opacity-50 transition-all uppercase text-xs tracking-widest active:scale-95"
                    >
                        {loading ? "Guardando..." : "Registrar Árbol"}
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}
