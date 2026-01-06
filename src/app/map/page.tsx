import MobileLayout from "@/components/mobile-layout";
import prisma from "@/lib/prisma";
import { getRecentRainfall, syncWeatherHistory } from "@/lib/weather";
import GardenGrid from "@/components/garden-grid";
import WeatherHistory from "@/components/weather-history";
import { LayoutGrid, Map as MapIcon } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MapPage() {
    const crops = await prisma.crop.findMany({
        orderBy: { plantedAt: 'desc' }
    });
    const trees = await prisma.tree.findMany();

    await syncWeatherHistory();
    const history = await getRecentRainfall();

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 bg-black min-h-screen">
                <header className="px-1 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Plano Gráfico</h1>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">La Finquina · Visualización en Cuadrados</p>
                    </div>
                </header>

                <div className="px-1">
                    <GardenGrid crops={crops as any} />
                </div>

                {/* Satellite View (Hidden/Optional - as requested 'no maps') */}
                {/* 
                <div className="px-1 opacity-50">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Vista Satélite Alternativa</p>
                    <div className="h-[200px] grayscale rounded-3xl overflow-hidden border border-slate-800">
                        <MapClient crops={crops} trees={trees} ... />
                    </div>
                </div> 
                */}

                <div className="bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-800 mx-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        🌤️ Predicción e Historial
                    </h3>
                    <WeatherHistory history={history} />
                </div>

                <div className="bg-emerald-900/10 p-6 rounded-[2.5rem] border border-emerald-900/20 mx-1">
                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        🧩 Guía de Colores
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
                        Los cultivos se agrupan por Bancal.
                        El punto <span className="text-emerald-400">parpadeante</span> indica que la planta está activa en el suelo.
                    </p>
                </div>
            </div>
        </MobileLayout>
    );
}
