import Link from "next/link";
import { getAllLogs, deleteLog } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import MobileLayout from "@/components/mobile-layout";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
    const logs = await getAllLogs();

    return (
        <MobileLayout>
            <div className="p-4 space-y-6 pb-24">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 font-serif">Diario</h1>
                        <p className="text-slate-500 text-sm">Registro histórico de la finca</p>
                    </div>
                    <Link href="/journal/new">
                        <Button size="icon" className="rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-md">
                            <Plus className="w-6 h-6" />
                        </Button>
                    </Link>
                </header>

                <div className="space-y-4">
                    {logs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500">No hay entradas en el diario todavía.</p>
                            <Link href="/journal/new" className="text-emerald-600 font-medium mt-2 inline-block">
                                Crear la primera entrada
                            </Link>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <Card key={log.id} className="overflow-hidden border-slate-100 shadow-sm">
                                <CardContent className="p-0">
                                    <div className="flex gap-4 p-4">
                                        {log.imageUrl && (
                                            <div className="w-24 h-24 relative rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={log.imageUrl}
                                                    alt="Log"
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                                                    {log.crop?.name || "General"}
                                                </p>
                                                <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                                                    {log.note || "Sin nota"}
                                                </p>
                                                {log.aiAnalysis && (
                                                    <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                        <p className="text-xs text-slate-600 italic leading-snug">
                                                            {log.aiAnalysis}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-3">
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(log.createdAt).toLocaleDateString()} - {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>

                                                <form action={async () => {
                                                    "use server"
                                                    await deleteLog(log.id)
                                                }}>
                                                    <button type="submit" className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
