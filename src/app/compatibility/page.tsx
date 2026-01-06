"use client";

import { useState } from "react";
import MobileLayout from "@/components/mobile-layout";
import { FRUIT_TREES, getCompatibility, PlantInfo, CompatibilityType } from "@/lib/compatibility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, Info, ArrowRight, Search, Sparkles } from "lucide-react";

export default function CompatibilityPage() {
    const [plant1, setPlant1] = useState<string>(FRUIT_TREES[0].id);
    const [plant2, setPlant2] = useState<string>(FRUIT_TREES[1].id);

    const result = getCompatibility(plant1, plant2);
    const info1 = FRUIT_TREES.find(p => p.id === plant1)!;
    const info2 = FRUIT_TREES.find(p => p.id === plant2);

    const getStatusStyles = (type: CompatibilityType) => {
        switch (type) {
            case 'Excellent': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 };
            case 'Good': return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: CheckCircle2 };
            case 'Bad': return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertTriangle };
            case 'Antagonistic': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle };
            default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Info };
        }
    };

    const status = result ? getStatusStyles(result.type) : getStatusStyles('Neutral');
    const StatusIcon = status.icon;

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 bg-black min-h-screen">
                <header className="px-1">
                    <h1 className="text-3xl font-black text-white tracking-tight font-serif">Alianzas Botánicas</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Simulador de Compatibilidad</p>
                </header>

                <Card className="border-none shadow-2xl overflow-hidden bg-slate-900 mx-1 rounded-[2.5rem]">
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">Planta Principal</label>
                                    <select
                                        value={plant1}
                                        onChange={(e) => setPlant1(e.target.value)}
                                        className="w-full p-5 bg-black border border-slate-800 rounded-2xl text-white font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    >
                                        {FRUIT_TREES.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-center -my-4 relative z-10">
                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-500 border-4 border-slate-900 shadow-xl">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 px-1">Compañero / Vecino</label>
                                    <select
                                        value={plant2}
                                        onChange={(e) => setPlant2(e.target.value)}
                                        className="w-full p-5 bg-black border border-slate-800 rounded-2xl text-white font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    >
                                        {FRUIT_TREES.map(t => (
                                            <option key={t.id} value={t.id} disabled={t.id === plant1}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Result */}
                <Card className={`border ${status.border} ${status.bg} shadow-2xl overflow-hidden mx-1 rounded-[2rem] transition-all duration-500`}>
                    <CardContent className="p-8">
                        <div className="flex items-start gap-6">
                            <div className={`h-16 w-16 rounded-[1.5rem] bg-black border ${status.border} flex items-center justify-center ${status.color} shadow-2xl shrink-0`}>
                                <StatusIcon className="h-8 w-8" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-black text-xl leading-none ${status.color}`}>
                                        {result?.type === 'Excellent' || result?.type === 'Good' ? '¡Sinergia Positiva!' :
                                            result?.type === 'Neutral' ? 'Convivencia Pacífica' : 'Conflicto Detectado'}
                                    </h3>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${status.border} ${status.color}`}>
                                        {result?.type}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-100 leading-relaxed pr-2">
                                    {result?.reason}
                                </p>
                            </div>
                        </div>

                        {info1.pollination && plant1 !== plant2 && (
                            <div className="mt-6 p-4 bg-black/40 rounded-2xl border border-white/5 flex gap-4">
                                <Info className="h-5 w-5 text-blue-400 shrink-0" />
                                <p className="text-[11px] text-slate-400 font-bold leading-snug">
                                    <span className="text-blue-300 uppercase tracking-widest text-[9px] block mb-1">Nota de Polinización</span>
                                    {info1.pollination}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Plant details */}
                <div className="px-1">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl group">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Ficha Técnica: {info1.name}</h4>
                        <p className="text-sm text-slate-300 mb-6 leading-relaxed font-medium">
                            {info1.description}
                        </p>
                        {info1.benefits && (
                            <div className="flex flex-wrap gap-2">
                                {info1.benefits.map(b => (
                                    <span key={b} className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-xl font-black border border-emerald-500/20 uppercase tracking-tighter shadow-sm">
                                        ✓ {b}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden mx-1 border border-slate-800/50">
                    <Sparkles className="absolute -right-8 -top-8 h-32 w-32 text-white/5" />
                    <h3 className="font-serif italic text-2xl mb-3 text-emerald-100">Consejo del Abuelo</h3>
                    <p className="text-slate-400 text-sm italic leading-relaxed font-medium">
                        "En Asturias, la sombra del pumar es buena, pero la del nogal agria el alma de la tierra. No junteis perales con nogales o no tendréis ni nueces ni peras."
                    </p>
                </div>
            </div>
        </MobileLayout>
    );
}
