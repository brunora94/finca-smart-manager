import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CloudSun, Droplets, Thermometer, CheckCircle2, CloudRain, Sun, Cloud, Plus,
  ChevronRight, Sparkles, AlertTriangle, Moon, Package, Cpu, Box,
  CloudFog, CloudSnow, CloudLightning, Wind, Calendar
} from "lucide-react"
import { getDashboardStats, getUrgentTasks, getRecentLogs } from "./actions"
import { getCurrentWeather } from "@/lib/weather"
import Link from "next/link"

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Parallel fetching for performance and stability
  const [stats, urgentTasks, recentLogs, weather] = await Promise.all([
    getDashboardStats(),
    getUrgentTasks(),
    getRecentLogs(),
    getCurrentWeather()
  ]);

  const getWeatherTheme = (code?: number) => {
    // Default (Cloudy/Clear mix)
    let theme = {
      gradient: "from-emerald-600/90 to-green-900",
      icon: <CloudSun className="h-10 w-10 text-yellow-300" />,
      label: "Tiempo Variable",
      message: "Momento ideal para revisar el invernadero.",
      accent: "bg-yellow-400/20",
      border: "border-emerald-500/20"
    };

    if (code === undefined || code === null) return theme;

    // Clear sky
    if (code === 0) {
      theme = {
        gradient: "from-amber-400 to-orange-600",
        icon: <Sun className="h-12 w-12 text-yellow-200 animate-pulse" />,
        label: "Día Soleado",
        message: "¡Cuidado con la evaporación! Riego recomendado.",
        accent: "bg-white/20",
        border: "border-white/10"
      };
    }
    // Partly Cloudy
    else if (code >= 1 && code <= 3) {
      theme = {
        gradient: "from-sky-400 to-blue-600",
        icon: <CloudSun className="h-12 w-12 text-white" />,
        label: "Cielos Claros",
        message: "Buena luz para fotos de seguimiento.",
        accent: "bg-white/20",
        border: "border-white/10"
      };
    }
    // Fog
    else if (code === 45 || code === 48) {
      theme = {
        gradient: "from-slate-500 to-slate-800",
        icon: <CloudFog className="h-12 w-12 text-slate-300" />,
        label: "Niebla en la Finca",
        message: "Alta humedad ambiental. Atento a los hongos.",
        accent: "bg-white/10",
        border: "border-white/5"
      };
    }
    // Drizzle / Rain
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      theme = {
        gradient: "from-blue-600 to-indigo-900",
        icon: <CloudRain className="h-12 w-12 text-blue-200" />,
        label: "Lloviendo",
        message: "La tierra se hidrata. Buen día para tareas de interior.",
        accent: "bg-blue-400/20",
        border: "border-blue-400/20"
      };
    }
    // Snow
    else if (code >= 71 && code <= 77) {
      theme = {
        gradient: "from-blue-100 to-slate-300",
        icon: <CloudSnow className="h-12 w-12 text-blue-400" />,
        label: "Nevada",
        message: "Protege los cultivos sensibles al frío.",
        accent: "bg-blue-500/20",
        border: "border-blue-500/10"
      };
    }
    // Thunderstorm
    else if (code >= 95) {
      theme = {
        gradient: "from-purple-900 via-slate-900 to-black",
        icon: <CloudLightning className="h-12 w-12 text-yellow-400 animate-bounce" />,
        label: "Tormenta Eléctrica",
        message: "Riesgo extremo. Mantente a cubierto.",
        accent: "bg-yellow-500/10",
        border: "border-yellow-500/20"
      };
    }

    return theme;
  };

  const weatherTheme = getWeatherTheme(weather?.code);

  return (
    <div className="space-y-6 pb-20 bg-black min-h-screen">
      {/* Header / Dynamic Weather Theme */}
      <section className={`bg-gradient-to-br ${weatherTheme.gradient} border ${weatherTheme.border} rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-700`}>
        <div className={`absolute top-[-10%] right-[-5%] w-48 h-48 ${weatherTheme.accent} rounded-full blur-[80px]`} />

        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-md">La Finquina</h1>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-inner">
            {weatherTheme.icon}
          </div>
        </div>

        <div className="mt-8 relative z-10 space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
              <Thermometer className="h-5 w-5 text-red-200" />
              <div>
                <p className="text-[8px] font-black uppercase opacity-60">Temperatura</p>
                <p className="text-xl font-black leading-none">{weather?.temp ?? "--"}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
              <Droplets className="h-5 w-5 text-blue-200" />
              <div>
                <p className="text-[8px] font-black uppercase opacity-60">Humedad</p>
                <p className="text-xl font-black leading-none">{weather?.humidity ?? "--"}%</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Estado Actual</span>
            </div>
            <h2 className="text-2xl font-black text-white">{weatherTheme.label}</h2>
            <p className="text-xs font-bold text-white/80 mt-1 italic">{weatherTheme.message}</p>
          </div>
        </div>
      </section>

      {/* Weather Alerts Pro */}
      {weather?.alerts && weather.alerts.length > 0 && (
        <section className="px-1 space-y-3">
          {weather.alerts.map((alert: any, idx: number) => (
            <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${alert.type === 'Frost' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'} animate-pulse`}>
              <div className="h-10 w-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Alerta: {alert.type === 'Frost' ? 'Helada' : 'Lluvia'}</h4>
                <p className="text-sm font-bold">{alert.message}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Resource Alerts */}
      {stats.resourceAlerts && stats.resourceAlerts.length > 0 && (
        <section className="px-1 pt-2">
          <div className="flex items-center gap-2 px-1 mb-2">
            <Package className="h-3 w-3 text-amber-500" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Avisos de Almacén</h4>
          </div>
          <div className="space-y-2">
            {stats.resourceAlerts.map((res: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-black/40 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-xs font-bold text-amber-200">{res.name}</span>
                </div>
                <span className="text-[10px] font-black text-amber-500 uppercase">{res.quantity} {res.unit}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Agronomic AI Tech Alerts (v1.8) */}
      {(stats as any).agronomicAlerts && (stats as any).agronomicAlerts.length > 0 && (
        <section className="px-1 pt-4">
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-3 w-3 text-emerald-400" />
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Alertas Técnicas IA</h4>
            </div>
            <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase">Agro-Expert</span>
          </div>
          <div className="space-y-3">
            {(stats as any).agronomicAlerts.map((alert: any, idx: number) => (
              <Link key={idx} href={`/crops/${alert.cropId}`} className="block group">
                <div className="p-4 bg-gradient-to-r from-slate-900 to-black border border-emerald-500/20 rounded-[2rem] group-hover:border-emerald-500/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <Sparkles className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      {alert.tips.map((tip: string, i: number) => (
                        <p key={i} className="text-xs font-bold text-slate-200 leading-tight">
                          • {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* IA Consejera Sparkles Section */}
      {stats.aiAdvice && (
        <section className="px-1">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/20 border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="h-24 w-24 text-emerald-400" />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">IA Consejera Pro</h2>
            </div>
            <p className="text-sm font-medium text-slate-300 leading-relaxed italic">
              "{stats.aiAdvice}"
            </p>
          </div>
        </section>
      )}

      {/* Calendar Promo */}
      <section className="px-1">
        <Link href="/calendar">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-lg flex items-center justify-between group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white leading-tight mb-0.5">Calendario de Cosecha</h2>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider group-hover:text-emerald-400 transition-colors">Ver previsión inteligente</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-white transition-colors" />
          </div>
        </Link>
      </section>

      {/* Lunar Biodynamics - Cyber Feature */}
      {stats.lunarInfo && (
        <section className="px-1">
          <div className="bg-gradient-to-br from-slate-900 via-black to-indigo-950/30 border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Moon className="h-24 w-24 text-indigo-400" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Moon className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Bio-Lunar</h2>
                  <p className="text-xs font-bold text-white uppercase">{stats.lunarInfo.phase} ({stats.lunarInfo.illumination}%)</p>
                </div>
              </div>
              <div className="bg-black/50 px-3 py-1 rounded-full border border-indigo-500/20">
                <span className="text-[10px] font-black text-indigo-300 uppercase italic">Día de {stats.lunarInfo.dayType}</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-300 leading-snug">
              {stats.lunarInfo.recommendation}
            </p>
          </div>
        </section>
      )}

      {/* Farm Health Ring - Premium Feature */}
      {stats.farmHealthScore !== undefined && (
        <section className="px-1">
          <Card className="bg-slate-900 border border-slate-800 shadow-xl rounded-[2rem] overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <CardContent className="p-8 flex items-center justify-between gap-8">
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Estado General</p>
                <h3 className="text-2xl font-black text-white leading-tight">Salud de la Finca</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Tu puntuación se basa en la puntualidad de tareas y salud de cultivos.
                </p>
              </div>
              <div className="relative h-28 w-28 flex-shrink-0">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle className="text-slate-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                  <circle
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - stats.farmHealthScore / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50" cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-black text-white">{stats.farmHealthScore}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-900 border border-slate-800 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cultivos Activos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 flex items-end justify-between">
            <div className="text-3xl font-black text-white">{stats.activeCrops}</div>
            <div className="h-6 w-6 rounded-full bg-emerald-900/40 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border border-slate-800 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tareas Pend.</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className={`text-3xl font-black ${stats.urgentTasks > 0 ? 'text-amber-500' : 'text-white'}`}>
              {stats.pendingTasks}
            </div>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">{stats.urgentTasks} Urgentes</p>
          </CardContent>
        </Card>

        {/* Monthly Investment - Full Width */}
        <Card className="col-span-2 bg-gradient-to-br from-slate-900 to-black border border-slate-800 shadow-lg rounded-2xl overflow-hidden relative">
          <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Inversión este Mes</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-1 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{stats.monthlySpending.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
            <span className="text-sm font-black text-emerald-500">EUR</span>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tasks */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Atención Requerida</h2>
        <div className="space-y-3">
          {urgentTasks.length === 0 ? (
            <div className="py-8 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 mb-2 text-slate-700" />
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Todo bajo control</p>
            </div>
          ) : (
            urgentTasks.map((task) => (
              <Card key={task.id} className={`bg-slate-900 border border-slate-800 border-l-4 ${task.priority === 'High' ? 'border-l-amber-500' : 'border-l-blue-500'} rounded-xl overflow-hidden`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-sm">{task.title}</span>
                    <span className="text-[8px] bg-black text-white/50 px-2 py-1 rounded-full font-black uppercase tracking-tighter">
                      {new Date(task.dueDate!).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Actividad Reciente</h2>
          <Link href="/journal" className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">Ver Historial</Link>
        </div>
        <div className="space-y-3">
          {recentLogs.length === 0 ? (
            <div className="py-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-center">
              <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Sin registros recientes</p>
            </div>
          ) : (
            recentLogs.map((log: any) => (
              <Card key={log.id} className="bg-slate-900 border border-slate-800 shadow-sm rounded-2xl overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex">
                    {log.imageUrl && (
                      <div className="w-24 h-24 relative overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={log.imageUrl} alt="Log" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900 w-1/4 right-0 ml-auto" />
                      </div>
                    )}
                    <div className="p-4 flex flex-col justify-center flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] mb-1">
                          {new Date(log.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </p>
                        <span className="text-[8px] text-slate-600 font-black">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {log.aiAnalysis ? log.aiAnalysis.split('.')[0] : (log.note || "Nueva entrada")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Quick Action Button */}
      <Link href="/journal/new" className="block pt-2">
        <button className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black text-sm shadow-xl hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-3">
          <Plus className="h-5 w-5" />
          REGISTRAR OBSERVACIÓN
        </button>
      </Link>
    </div>
  )
}
