import { getMakerModels, addMakerModel } from "@/app/actions";
import MobileLayout from "@/components/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Box, Plus, Download, Tag, Cpu, Link as LinkIcon, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const SUGGESTED_MODELS = [
    {
        title: "Estaca de Bancal QR",
        description: "Estaca robusta para insertar en tierra. Incluye área plana para pegar el código QR laminado.",
        category: "Tags",
        difficulty: "Fácil",
        url: "https://www.printables.com/search/models?q=garden+tag"
    },
    {
        title: "Caja de Sensor LoRa",
        description: "Caja estanca para proteger electrónica de sensores de suelo.",
        category: "Sensors",
        difficulty: "Media",
        url: "https://www.thingiverse.com/search?q=sensor+box"
    },
    {
        title: "Soporte de Riego Goteo",
        description: "Clip para guiar la tubería de 16mm en los bordes del bancal.",
        category: "GardenTools",
        difficulty: "Fácil",
        url: "https://www.printables.com/search/models?q=drip+irrigation"
    }
];

export default async function MakerHubPage() {
    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 page-animate">
                <header>
                    <h1 className="text-2xl font-black text-white tracking-tighter">MAKER HUB</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Fabricación para la Finca</p>
                </header>

                <div className="bg-gradient-to-br from-slate-900 to-emerald-900/20 border border-emerald-500/10 p-5 rounded-[2rem] space-y-2">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">¿Por qué imprimir?</p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        Crea herramientas personalizadas, gestiona tus QR y protege tus sensores con piezas adaptadas al clima de Asturias. Usa filamentos como PETG para máxima durabilidad al sol.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Modelos Recomendados</h3>
                        <Box className="h-4 w-4 text-emerald-500" />
                    </div>

                    <div className="grid gap-4">
                        {SUGGESTED_MODELS.map((model, idx) => (
                            <Card key={idx} className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden group">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-black uppercase">{model.category}</span>
                                                <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase">{model.difficulty}</span>
                                            </div>
                                            <h4 className="text-lg font-black text-white tracking-tight">{model.title}</h4>
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-black border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:border-emerald-500/50 transition-all">
                                            <Download className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">{model.description}</p>
                                    <a
                                        href={model.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest p-1"
                                    >
                                        Buscar Archivos
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="p-8 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-3 opacity-60">
                    <Cpu className="h-10 w-10 text-slate-700" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Próximamente</p>
                    <p className="text-xs text-slate-600 font-medium max-w-[200px]">Generador de soportes paramétricos y gestión de archivos STL propios.</p>
                </div>
            </div>
        </MobileLayout>
    );
}
