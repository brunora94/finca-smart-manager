import MobileLayout from "@/components/mobile-layout";
import { getCrops, getTrees, updateCropStatus, deleteCrop, deleteTree } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, TreeDeciduous, MapPin, Calendar, Trash2, CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react";
import SmartCropForm from "@/components/smart-crop-form";
import TreeForm from "@/components/tree-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CropsPage() {
    const crops = await getCrops();
    const trees = await getTrees();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Planted': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'Harvested': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Failed': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 bg-black min-h-screen">
                <header className="flex justify-between items-center px-1">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight font-serif">Mis Cultivos</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Gestión de Vegetación</p>
                    </div>
                </header>

                {/* Section: Active Crops */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Sprout className="h-3 w-3" />
                            Huerto y Plantaciones
                        </h2>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500">
                            {crops.length} total
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {crops.length === 0 ? (
                            <p className="text-center py-8 text-slate-400 text-xs bg-white rounded-3xl border border-dashed border-slate-200">
                                No hay cultivos registrados.
                            </p>
                        ) : (
                            crops.map((crop) => (
                                <Link key={crop.id} href={`/crops/${crop.id}`}>
                                    <Card className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow group mb-3 bg-slate-900">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-4">
                                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${getStatusColor(crop.status)}`}>
                                                        {(crop as any).imageUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={(crop as any).imageUrl} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Sprout className="h-6 w-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-100">{crop.name}</h3>
                                                        <p className="text-[10px] text-slate-400 font-medium leading-tight">
                                                            {crop.variety ? `${crop.variety} · ` : ''}{crop.location || 'Sin ubicación'}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-100`}>
                                                                {crop.status === 'Planted' ? 'Plantado' : crop.status === 'Harvested' ? 'Cosechado' : 'Fallido'}
                                                            </span>
                                                            <span className="text-[9px] text-slate-500 flex items-center gap-1 font-bold">
                                                                <Calendar className="h-2.5 w-2.5" />
                                                                {new Date(crop.plantedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                        <SmartCropForm />
                    </div>
                </section>

                {/* Section: Fruit Trees */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <TreeDeciduous className="h-3 w-3" />
                            Árboles Frutales
                        </h2>
                        <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded-full font-bold text-amber-600 border border-amber-100">
                            {trees.length} ejemplares
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {trees.length === 0 ? (
                            <p className="text-center py-8 text-slate-400 text-xs bg-white rounded-3xl border border-dashed border-slate-200">
                                No hay árboles registrados.
                            </p>
                        ) : (
                            trees.map((tree) => (
                                <Card key={tree.id} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${tree.health === 'Sano' ? 'text-amber-600 bg-amber-50' : 'text-orange-600 bg-orange-50'}`}>
                                                    <TreeDeciduous className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800">{tree.name}</h3>
                                                    <p className="text-[10px] text-slate-400 font-medium">
                                                        {tree.location || 'Sin ubicación'} · {tree.plantedYear ? `Plantado en ${tree.plantedYear}` : 'Año desconocido'}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${tree.health === 'Sano' ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'}`}>
                                                            Salud: {tree.health}
                                                        </span>
                                                        {(tree as any).latitude && (
                                                            <span className="text-[9px] text-blue-500 flex items-center gap-1 font-bold">
                                                                <MapPin className="h-2.5 w-2.5" />
                                                                Localizado
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <form action={async () => {
                                                    'use server'
                                                    const { deleteTree } = await import("../actions");
                                                    await deleteTree(tree.id);
                                                }}>
                                                    <button className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Borrar">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                        <TreeForm />
                    </div>
                </section>

                <div className="bg-emerald-900 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                    <CheckCircle2 className="absolute -right-4 -top-4 h-24 w-24 text-white/5" />
                    <h3 className="font-serif text-xl mb-2">Estado de la Tierra</h3>
                    <p className="text-emerald-100 text-sm leading-relaxed">
                        Manten un registro detallado de cada pumar y bancal para recibir consejos personalizados de riego y compatibilidad.
                    </p>
                </div>
            </div>
        </MobileLayout>
    );
}
