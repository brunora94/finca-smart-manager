import MobileLayout from "@/components/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, BellOff, AlertTriangle, Droplets, TrendingUp } from "lucide-react"

export default function NotificationsPage() {
    return (
        <MobileLayout>
            <div className="space-y-6 pb-24">
                <header>
                    <h1 className="text-2xl font-black text-white tracking-tighter">NOTIFICACIONES</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Alertas y avisos del sistema</p>
                </header>

                <Card className="bg-slate-900 border-slate-800 rounded-[2rem]">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-black text-white">Alertas de Stock Bajo</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Inventario crítico</p>
                                </div>
                            </div>
                            <div className="h-6 w-11 bg-emerald-500 rounded-full flex items-center justify-end px-1">
                                <div className="h-4 w-4 bg-white rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <Droplets className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-black text-white">Avisos de Riego</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Basado en lluvia</p>
                                </div>
                            </div>
                            <div className="h-6 w-11 bg-emerald-500 rounded-full flex items-center justify-end px-1">
                                <div className="h-4 w-4 bg-white rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                <div>
                                    <p className="text-sm font-black text-white">Alertas Agronómicas IA</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Consejos técnicos</p>
                                </div>
                            </div>
                            <div className="h-6 w-11 bg-emerald-500 rounded-full flex items-center justify-end px-1">
                                <div className="h-4 w-4 bg-white rounded-full"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="text-sm font-black text-white">Resumen Mensual</p>
                                    <p className="text-[10px] text-slate-500 uppercase">Estadísticas de gastos</p>
                                </div>
                            </div>
                            <div className="h-6 w-11 bg-slate-700 rounded-full flex items-center px-1">
                                <div className="h-4 w-4 bg-slate-500 rounded-full"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-900/10 border-blue-900/20 rounded-[2rem]">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <Bell className="h-5 w-5 text-blue-400 mt-0.5" />
                            <div>
                                <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Nota</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Las notificaciones se muestran automáticamente en el panel superior.
                                    Los toggles son visuales y representan el estado actual del sistema.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MobileLayout>
    )
}
