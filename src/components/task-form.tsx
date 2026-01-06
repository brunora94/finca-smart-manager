"use client";

import { useState } from "react";
import { addTask } from "@/app/actions";
import {
    Plus,
    X,
    Calendar,
    Tag,
    AlertTriangle,
    TextQuote,
    Hammer,
    Sprout,
    Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TaskFormProps {
    crops: any[];
}

export default function TaskForm({ crops }: TaskFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 mx-1"
            >
                <Plus className="h-5 w-5" />
                NUEVA TAREA
            </button>
        );
    }

    return (
        <Card className="border-none shadow-2xl bg-slate-900 mx-1 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-black text-white text-lg tracking-tight font-serif italic">Planificar Tarea</h3>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form
                    action={async (formData) => {
                        setIsLoading(true);
                        await addTask(formData);
                        setIsLoading(false);
                        setIsOpen(false);
                    }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Título de la Tarea</label>
                        <div className="relative">
                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                name="title"
                                required
                                placeholder="Ej: Podar manzanos, Compostar bancal 2..."
                                className="w-full pl-12 pr-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white placeholder:text-slate-600 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Categoría</label>
                            <select
                                name="category"
                                className="w-full px-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white transition-all appearance-none"
                            >
                                <option value="Garden">Huerto/Jardín</option>
                                <option value="Infrastructure">Infraestructura</option>
                                <option value="Maintenance">Mantenimiento</option>
                                <option value="Other">Otros</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Prioridad</label>
                            <select
                                name="priority"
                                className="w-full px-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white transition-all appearance-none"
                            >
                                <option value="Normal">Normal</option>
                                <option value="High">Alta</option>
                                <option value="Low">Baja</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Vincular a Cultivo (Opcional)</label>
                        <select
                            name="cropId"
                            className="w-full px-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white transition-all appearance-none"
                        >
                            <option value="">Ninguno</option>
                            {crops.map(crop => (
                                <option key={crop.id} value={crop.id}>{crop.name} {crop.variety ? `(${crop.variety})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Fecha Límite</label>
                        <input
                            name="dueDate"
                            type="date"
                            className="w-full px-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white transition-all color-scheme-dark"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl transition-all"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Plus className="h-5 w-5" />
                                GUARDAR TAREA
                            </>
                        )}
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}
