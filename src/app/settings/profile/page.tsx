import MobileLayout from "@/components/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { User, MapPin, Calendar, Sprout } from "lucide-react"

export default function ProfilePage() {
    return (
        <MobileLayout>
            <div className="space-y-6 pb-24">
                <header>
                    <h1 className="text-2xl font-black text-white tracking-tighter">PERFIL DE FINCA</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Información de La Finquina</p>
                </header>

                <Card className="bg-slate-900 border-slate-800 rounded-[2rem]">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Sprout className="h-8 w-8 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white">La Finquina</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase">Finca Ecológica</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-emerald-500 mt-0.5" />
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ubicación</p>
                                    <p className="text-sm text-white font-bold">Asturias, España</p>
                                    <p className="text-xs text-slate-400 mt-1">43.43519°N, -5.68478°W</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Inicio de Operaciones</p>
                                    <p className="text-sm text-white font-bold">2024</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-purple-500 mt-0.5" />
                                <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Gestor</p>
                                    <p className="text-sm text-white font-bold">Bruno</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-900/10 border-emerald-900/20 rounded-[2rem]">
                    <CardContent className="p-6">
                        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Características</h3>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Gestión ecológica certificada
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Análisis AI de cultivos
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                Monitoreo meteorológico integrado
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </MobileLayout>
    )
}
