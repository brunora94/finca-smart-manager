"use client";

import { useState } from "react";
import { logCropProgress } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import ImageUpload from "./image-upload";
import { Card, CardContent } from "./ui/card";

export default function GrowthTracker({ cropId }: { cropId: number }) {
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [note, setNote] = useState("");

    const handlePhotoCaptured = async (url: string) => {
        setIsUploading(true);
        try {
            const res = await logCropProgress(cropId, url, note);
            if (res.success) {
                setResult(res.analysis);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    if (result) {
        return (
            <Card className="border-emerald-200 bg-emerald-50/50 animate-in zoom-in-95">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-700">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold">Análisis Completado</h3>
                            <p className="text-xs opacity-70">La IA ha registrado el progreso</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-500 uppercase tracking-widest">Salud Detectada</span>
                            <span className="px-2 py-0.5 rounded-lg bg-white border border-emerald-100 font-black text-emerald-600">
                                {result.health}
                            </span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed italic">"{result.advice}"</p>
                        <div className="pt-2">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-2">Tareas Sugeridas:</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.suggestedTasks?.map((t: string) => (
                                    <span key={t} className="text-[10px] bg-white px-2 py-1 rounded-lg border border-slate-100 text-slate-600 font-medium">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => { setResult(null); setNote(""); }}
                        className="w-full rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    >
                        Registrar otra toma
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Nota de campo (Opcional)</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="¿Observas algo raro hoy?"
                    className="w-full p-4 bg-white border-none rounded-2xl text-sm font-medium shadow-sm focus:ring-2 focus:ring-emerald-500 resize-none h-20 transition-all"
                />
            </div>

            <div className="relative group">
                {isUploading ? (
                    <div className="w-full bg-slate-900 text-white py-12 rounded-3xl flex flex-col items-center justify-center gap-4 animate-pulse">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                        <p className="text-sm font-bold">La IA está analizando el crecimiento...</p>
                    </div>
                ) : (
                    <div className="relative">
                        <ImageUpload
                            onUpload={handlePhotoCaptured}
                            label="Hacer Foto de Seguimiento"
                        />
                        <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg pointer-events-none group-active:scale-90 transition-transform">
                            <Camera className="h-5 w-5" />
                        </div>
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-400 text-center px-4 italic leading-tight">
                Haz una foto actual del cultivo. La IA comparará el estado y te dirá si el crecimiento es óptimo o si hay plagas.
            </p>
        </div>
    );
}
