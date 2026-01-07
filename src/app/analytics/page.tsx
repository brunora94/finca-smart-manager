import { getExpenseAnalytics } from "@/app/actions"
import MobileLayout from "@/components/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar, Search } from "lucide-react"
import ExportButtons from "@/components/export-buttons"
import Link from "next/link"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsPage() {
    const data = await getExpenseAnalytics();

    const trend = data.currentMonthTotal >= data.lastMonthTotal ? 'up' : 'down';
    const percentChange = data.lastMonthTotal > 0
        ? Math.round(((data.currentMonthTotal - data.lastMonthTotal) / data.lastMonthTotal) * 100)
        : 100;

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 page-animate">
                <header className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter">ANÁLISIS DE GASTOS</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Control de inversión en La Finquina</p>
                    </div>
                    <Link href="/search" className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 hover:text-emerald-500 transition-colors shadow-xl">
                        <Search className="h-5 w-5" />
                    </Link>
                </header>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-slate-900 border-slate-800 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6 space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Este Mes</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white">{data.currentMonthTotal.toFixed(2)}</span>
                                <span className="text-xs font-bold text-slate-500">€</span>
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${trend === 'up' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {percentChange}% vs mes ant.
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-6 space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inversión Total</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white">{data.totalInvoiced.toFixed(2)}</span>
                                <span className="text-xs font-bold text-slate-500">€</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-500">
                                <Calendar className="h-3 w-3" />
                                Histórico Finca
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Categorías */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <PieChart className="h-3 w-3 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Por Categoría</h3>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 space-y-6">
                        {data.byCategory.length > 0 ? data.byCategory.map((cat, idx) => {
                            const percent = Math.round((cat.value / data.totalInvoiced) * 100);
                            return (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-300">{cat.name}</span>
                                        <span className="font-black text-white">{cat.value.toFixed(2)}€</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                    <p className="text-[8px] font-black text-slate-500 uppercase text-right">{percent}% del total</p>
                                </div>
                            );
                        }) : (
                            <p className="text-center text-slate-500 text-xs py-4 uppercase font-black tracking-widest">Sin datos registrados</p>
                        )}
                    </div>
                </section>

                {/* Historial Mensual */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <BarChart3 className="h-3 w-3 text-emerald-500" />
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inversión Mensual</h3>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6">
                        <div className="flex items-end justify-between h-32 gap-2">
                            {data.byMonth.length > 0 ? data.byMonth.map((m, idx) => {
                                const max = Math.max(...data.byMonth.map(x => x.amount)) || 1;
                                const height = (m.amount / max) * 100;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full flex justify-end flex-col h-full">
                                            <div
                                                className="w-full max-w-[20px] bg-emerald-500/20 border border-emerald-500/10 rounded-t-lg transition-all duration-500 group-hover:bg-emerald-500/40 mx-auto"
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>
                                        <span className="text-[8px] font-black text-slate-600 uppercase transform -rotate-45">{m.month.split('-')[1]}</span>
                                    </div>
                                );
                            }) : (
                                <p className="text-center text-slate-500 text-xs w-full uppercase font-black tracking-widest">Sin historial</p>
                            )}
                        </div>
                    </div>
                </section>

                <ExportButtons />
            </div>
        </MobileLayout>
    );
}
