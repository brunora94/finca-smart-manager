import MobileLayout from "@/components/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Database, Wifi, HardDrive, Cpu, CheckCircle2 } from "lucide-react"

export default function SystemPage() {
    return (
        <MobileLayout>
            <div className="space-y-6 pb-24">
                <header>
                    <h1 className="text-2xl font-black text-white tracking-tighter">SISTEMA</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estado y configuración técnica</p>
                </header>

                <Card className="bg-slate-900 border-slate-800 rounded-[2rem]">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <Database className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-black text-white">Base de Datos</p>
                                    <p className="text-[10px] text-slate-500 uppercase">SQLite Local</p>
                                </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <Cpu className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-black text-white">Google Gemini AI</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Análisis de cultivos</p>
                                </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <Wifi className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-black text-white">Perenual API</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Búsqueda de especies</p>
                                </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <HardDrive className="h-5 w-5 text-amber-500" />
                                <div>
                                    <p className="text-sm font-black text-white">Open-Meteo</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Datos meteorológicos</p>
                                </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-900/10 border-emerald-900/20 rounded-[2rem]">
                    <CardContent className="p-6">
                        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Versión del Sistema</h3>
                        <div className="space-y-2 text-xs text-slate-400">
                            <div className="flex justify-between">
                                <span>Finca Smart Manager</span>
                                <span className="font-black text-white">v1.9.1</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Next.js</span>
                                <span className="font-black text-white">16.1.1</span>
                            </div>
                            <div className="flex justify-between">
                                <span>React</span>
                                <span className="font-black text-white">19</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MobileLayout>
    )
}
