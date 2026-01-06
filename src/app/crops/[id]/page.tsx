import { getCropById, updateCropStatus, getRotationAdvice } from "@/app/actions";
import MobileLayout from "@/components/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, Calendar, MapPin, Tag, ChevronLeft, Trash2, CheckCircle2, FlaskConical, TrendingUp, Sparkles, Info, QrCode, Mic, RefreshCw } from "lucide-react";
import Link from "next/link";
import GrowthTracker from "@/components/growth-tracker";
import EditCropModal from "@/components/edit-crop-modal";
import VoiceRecorder from "@/components/voice-recorder";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CropDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cropIdInt = parseInt(id);
    const crop = await getCropById(cropIdInt);

    if (!crop) notFound();

    const rotationAdvice = await getRotationAdvice(cropIdInt);

    // Sort logs descending for consistent access
    const sortedLogs = [...(crop.logs || [])].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestLog = sortedLogs[0];

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 bg-black min-h-screen">
                <header className="flex items-center justify-between">
                    <Link href="/crops" className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-center text-slate-300 active:scale-95 transition-transform">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-bold text-white font-serif">Seguimiento</h1>
                    <EditCropModal crop={crop} />
                </header>

                {/* Hero Section */}
                <Card className="border border-slate-800 shadow-xl overflow-hidden bg-slate-900 rounded-[2.5rem]">
                    <div className="relative h-64 bg-slate-800 italic flex items-center justify-center text-slate-500">
                        {(crop as any).imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={(crop as any).imageUrl} alt={crop.name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <Sprout className="h-16 w-16" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/40 to-transparent">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest px-2 py-0.5 rounded-full bg-emerald-400/20 backdrop-blur-md">
                                            {crop.status === 'Planted' ? 'Creciendo' : 'Finalizado'}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">{crop.name}</h2>
                                    <p className="text-white/70 text-sm font-medium">{crop.variety || 'Variedad común'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CardContent className="p-6 bg-slate-900">
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-emerald-900/40 text-emerald-400 flex items-center justify-center border border-emerald-900/30">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Plantado</p>
                                    <p className="text-xs font-bold text-white">{new Date(crop.plantedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-blue-900/40 text-blue-400 flex items-center justify-center border border-blue-900/30">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Cama/Bancal</p>
                                    <p className="text-xs font-bold text-white">{(crop as any).bed || 'Sin asignar'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-purple-900/40 text-purple-400 flex items-center justify-center border border-purple-900/30">
                                    <Info className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Línea/Fila</p>
                                    <p className="text-xs font-bold text-white">{(crop as any).row || 'Línea única'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-amber-900/40 text-amber-400 flex items-center justify-center border border-amber-900/30">
                                    <Tag className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Estado</p>
                                    <p className="text-xs font-bold text-white">{crop.status === 'Planted' ? 'Activo' : 'Cosechado'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Growth Tracker Component */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Seguimiento con IA</h3>
                    </div>
                    <GrowthTracker cropId={crop.id} />
                </section>

                {/* Rotation Intelligence */}
                {rotationAdvice && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <RefreshCw className="h-4 w-4 text-emerald-500" />
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Inteligencia de Rotación</h3>
                        </div>
                        <Card className="bg-slate-900 border-emerald-500/20 rounded-[2.5rem] overflow-hidden">
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">Próximo Ideal:</span>
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-tighter border border-emerald-500/10">
                                            {rotationAdvice.recommendedCategory}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed italic">
                                        "{rotationAdvice.justification}"
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-slate-800">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Variedades Sugeridas (Asturias):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {rotationAdvice.suggestedVarieties.map((v: string, i: number) => (
                                            <span key={i} className="text-[9px] font-black text-slate-300 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 uppercase tracking-tighter">
                                                {v}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                )}

                {/* AI Agronomy & Harvest Prediction (v1.8) */}
                {latestLog && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Agronomía & Cosecha</h3>
                        </div>
                        <Card className="bg-gradient-to-br from-slate-900 to-black border-amber-500/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Calendar className="h-20 w-20 text-amber-500" />
                            </div>
                            <CardContent className="p-6 space-y-6 relative z-10">
                                {latestLog.aiAnalysis?.includes('📆') ? (
                                    <div className="space-y-6">
                                        {/* Harvest Estimation */}
                                        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-3xl">
                                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <Calendar className="h-3 w-3" /> Fecha de Recolección
                                            </p>
                                            <p className="text-lg font-black text-white">
                                                {latestLog.aiAnalysis?.split('📆 Cosecha estimada: ')[1]?.split('\n')[0] || 'Estimando...'}
                                            </p>
                                        </div>

                                        {/* Technical Agronomy Tips */}
                                        {latestLog.aiAnalysis?.includes('💡') && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Acciones Técnicas IA</p>
                                                <div className="grid gap-2">
                                                    {latestLog.aiAnalysis?.split('💡 Consejos Agronómicos: ')[1]?.split('\n')[0].split('. ').map((tip: string, i: number) => tip.trim() && (
                                                        <div key={i} className="flex items-start gap-3 p-3 bg-black/40 rounded-2xl border border-white/5">
                                                            <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                                            <p className="text-xs font-bold text-slate-300 leading-tight">{tip}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center">
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest italic">
                                            Realiza un seguimiento con foto para obtener predicciones de cosecha.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>
                )}

                {/* History Timeline */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Historial de Crecimiento</h3>
                    <div className="space-y-4">
                        {sortedLogs.length === 0 ? (
                            <div className="py-12 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 text-center">
                                <p className="text-xs text-slate-500 italic">No hay fotos de progreso todavía.</p>
                            </div>
                        ) : (
                            sortedLogs.map((log) => (
                                <div key={log.id} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-800">
                                    <div className="absolute left-[-4px] top-0 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    <Card className="border-none shadow-sm overflow-hidden bg-slate-900">
                                        <CardContent className="p-0 flex flex-col sm:flex-row">
                                            {log.imageUrl && (
                                                <div className="w-full sm:w-32 h-32 shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={log.imageUrl} alt="Progress" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="p-4 space-y-2">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {new Date(log.date).toLocaleDateString()} · {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <p className="text-sm font-medium text-slate-200 leading-snug">{log.note || 'Sin nota de campo'}</p>
                                                {log.aiAnalysis && (
                                                    <div className="p-2 bg-slate-800 rounded-xl border border-slate-700">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <Sparkles className="h-3 w-3 text-emerald-400" />
                                                            <span className="text-[9px] font-black uppercase text-emerald-300">Informe IA</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 italic leading-snug">{log.aiAnalysis}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href={`/crops/${crop.id}/qr`} className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <QrCode className="h-4 w-4 text-emerald-500" />
                        Imprimir QR
                    </Link>
                    <VoiceRecorder cropId={crop.id} />
                    <form action={async () => {
                        'use server'
                        const { updateCropStatus } = await import("@/app/actions");
                        await updateCropStatus(crop.id, 'Harvested');
                    }} className="col-span-1">
                        <button className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Cosechado
                        </button>
                    </form>
                    <form action={async () => {
                        'use server'
                        const { deleteCrop } = await import("@/app/actions");
                        await deleteCrop(crop.id);
                    }} className="col-span-1">
                        <button className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                            <Trash2 className="h-4 w-4 text-red-500" />
                            Eliminar
                        </button>
                    </form>
                </div>
            </div>
        </MobileLayout>
    );
}
