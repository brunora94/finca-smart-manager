'use client'

import { Bell, X, AlertTriangle, AlertCircle, Info, CloudRain, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { getNotifications } from "@/app/actions"

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const data = await getNotifications()
            setNotifications(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const getIcon = (type: string, category: string) => {
        if (category === 'Weather') return <CloudRain className="h-4 w-4 text-sky-400" />
        if (category === 'Agronomy') return <Sparkles className="h-4 w-4 text-emerald-400" />
        if (type === 'alert') return <AlertCircle className="h-4 w-4 text-red-400" />
        if (type === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-400" />
        return <Info className="h-4 w-4 text-emerald-400" />
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-slate-800 transition-all active:scale-90"
            >
                <Bell className="h-4 w-4 text-slate-400" />
                {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-black" />
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className="absolute right-0 top-14 w-80 z-[60] bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                    >
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Notificaciones</h3>
                            <button onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
                            {loading ? (
                                <div className="py-8 text-center text-[10px] font-black uppercase text-slate-600 animate-pulse tracking-widest">
                                    Sincronizando...
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Todo en orden</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-start gap-3">
                                        <div className="mt-0.5">{getIcon(n.type, n.category)}</div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{n.title}</p>
                                            <p className="text-xs font-bold text-slate-200">{n.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 bg-black/20 border-t border-slate-800">
                            <button
                                onClick={() => {
                                    setNotifications([]);
                                    setIsOpen(false);
                                }}
                                className="w-full py-2 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors"
                            >
                                Marcar todo como leído
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
