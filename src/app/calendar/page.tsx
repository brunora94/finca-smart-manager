import MobileLayout from "@/components/mobile-layout"
import { getHarvestCalendarData } from "./actions"
import { Calendar as CalendarIcon, Leaf, Clock, Camera } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to group by month
function groupByMonth(events: any[]) {
    const groups: { [key: string]: any[] } = {};
    events.forEach(event => {
        const key = event.monthName; // Already formatted or 'Pendiente'
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
    });
    return groups;
}

export default async function CalendarPage() {
    const events = await getHarvestCalendarData();
    // Re-sort groups based on the first event's date in each group
    const groups = groupByMonth(events);
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
        if (a === 'Pendiente') return 1; // Pending last
        if (b === 'Pendiente') return -1;
        const dateA = groups[a][0].sortDate;
        const dateB = groups[b][0].sortDate;
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <MobileLayout>
            <div className="space-y-8 pb-24">
                <header>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <CalendarIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tighter">CALENDARIO</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Previsión de Cosechas IA</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-8 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-4 top-4 bottom-0 w-0.5 bg-slate-800/50"></div>

                    {events.length === 0 ? (
                        <div className="text-center py-12 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed ml-8">
                            <Leaf className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 font-bold">No hay cultivos activos analizados.</p>
                            <Link href="/journal/new" className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20">
                                Realizar Seguimiento IA
                            </Link>
                        </div>
                    ) : (
                        sortedGroupKeys.map((monthKey) => (
                            <div key={monthKey} className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-3 w-3 rounded-full bg-slate-900 border-2 border-emerald-500 ring-4 ring-black ml-[4.5px]"></div>
                                    <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                        {monthKey}
                                    </h2>
                                </div>

                                <div className="space-y-3 ml-8">
                                    {groups[monthKey].map((event: any, idx: number) => (
                                        <Link href={`/crops/${event.crop.id}`} key={idx} className="block group">
                                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex gap-4">
                                                {/* Image */}
                                                <div className="h-16 w-16 rounded-xl bg-black overflow-hidden border border-white/10 shrink-0">
                                                    {event.crop.imageUrl ? (
                                                        <img src={event.crop.imageUrl} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={event.crop.name} />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-slate-800 text-slate-600">
                                                            <Leaf className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-base font-black text-white truncate leading-tight group-hover:text-emerald-400 transition-colors">
                                                            {event.crop.name}
                                                        </h3>
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                                                            {event.crop.bed ? `Bancal ${event.crop.bed}` : 'Huerto'}
                                                        </span>
                                                    </div>

                                                    {event.crop.variety && (
                                                        <p className="text-xs text-slate-500 font-medium mb-2">{event.crop.variety}</p>
                                                    )}

                                                    <div className="flex items-start gap-2 mt-1">
                                                        <Clock className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                                        <p className="text-xs font-bold text-amber-400/90 leading-tight">
                                                            "{event.prediction}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </MobileLayout>
    )
}
