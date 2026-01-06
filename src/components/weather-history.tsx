import { Droplets, CloudRain, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WeatherHistoryProps {
    history: any[];
}

export default function WeatherHistory({ history }: WeatherHistoryProps) {
    if (history.length === 0) return null;

    return (
        <Card className="border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-emerald-600" />
                    Historial de Lluvias
                </h3>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Últimos 7 días</span>
            </div>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                    {history.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-700">
                                        {new Date(log.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-[10px] text-slate-400">Humedad Máx: {log.humidity ?? "--"}%</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-800">{log.precipitation.toFixed(1)} mm</p>
                                <div className={`h-1.5 w-16 bg-slate-100 rounded-full mt-1 overflow-hidden`}>
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${Math.min(log.precipitation * 10, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
