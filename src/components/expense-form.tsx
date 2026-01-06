"use client";

import { useState } from "react";
import { addExpense } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Euro, ShoppingCart, Tag, Calendar as CalendarIcon, Loader2 } from "lucide-react";

export default function ExpenseForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const categories = [
        "Semillas/Plantas",
        "Herramientas",
        "Fertilizantes",
        "Maquinaria",
        "Infraestructura",
        "Otros"
    ];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        await addExpense(formData);
        setLoading(false);
        setIsOpen(false);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/20 transition-all active:scale-95 mx-1"
            >
                <Plus className="h-5 w-5" />
                REGISTRAR GASTO
            </button>
        );
    }

    return (
        <Card className="border-none shadow-2xl bg-slate-900 mx-1 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <h3 className="font-black text-white text-lg tracking-tight font-serif italic">Nuevo Gasto</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Artículo / Concepto</label>
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                name="item"
                                required
                                placeholder="Ej: Abono orgánico, Semillas..."
                                className="w-full pl-12 pr-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white placeholder:text-slate-600 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Importe (€)</label>
                            <div className="relative">
                                <Euro className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white placeholder:text-slate-600 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Fecha</label>
                            <input
                                name="date"
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white transition-all color-scheme-dark"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Categoría</label>
                        <select
                            name="category"
                            className="w-full px-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white transition-all appearance-none"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Comercio / Tienda</label>
                        <div className="relative">
                            <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                name="shop"
                                placeholder="Ej: Cooperativa Llanes"
                                className="w-full pl-12 pr-4 py-4 bg-black border border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-white placeholder:text-slate-600 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl transition-all mt-2"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Plus className="h-5 w-5" />
                                GUARDAR GASTO
                            </>
                        )}
                    </button>
                </form>
            </CardContent>
        </Card>
    );
}
