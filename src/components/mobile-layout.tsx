import Link from "next/link"
import { Home, Sprout, Map, Settings, ClipboardList, BookOpen, Package, Search, BarChart3, Plus, Calendar as CalendarIcon } from "lucide-react"
import NotificationCenter from "./notification-center"

export default function MobileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col bg-black pb-32 text-white">
            <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
                <Link href="/" className="font-black text-[10px] tracking-[0.2em] text-emerald-500 uppercase">La Finquina</Link>
                <div className="flex items-center gap-2">
                    <NotificationCenter />
                    <Link href="/calendar" className="p-2.5 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-slate-800 transition-all active:scale-90 relative group">
                        <div className="absolute top-2 right-2.5 h-1.5 w-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                        <CalendarIcon className="h-4 w-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    </Link>
                    <Link href="/search" className="p-2.5 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-slate-800 transition-all active:scale-90">
                        <Search className="h-4 w-4 text-slate-400" />
                    </Link>
                    <Link href="/settings" className="p-2.5 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-slate-800 transition-all active:scale-90">
                        <Settings className="h-4 w-4 text-slate-400" />
                    </Link>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 max-w-2xl page-animate">
                {children}
            </main>

            {/* Bottom Navigation - Fixed & Stable */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-stretch justify-around h-16 max-w-2xl mx-auto px-2">
                    <Link href="/" className="flex flex-col items-center justify-center flex-1 gap-1 text-slate-400 hover:text-emerald-400 transition-all active:scale-95">
                        <Home className="h-5 w-5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Inicio</span>
                    </Link>
                    <Link href="/crops" className="flex flex-col items-center justify-center flex-1 gap-1 text-slate-400 hover:text-emerald-400 transition-all active:scale-95">
                        <Sprout className="h-5 w-5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Huerto</span>
                    </Link>
                    <Link href="/tasks" className="flex flex-col items-center justify-center flex-1 gap-1 text-slate-400 hover:text-emerald-400 transition-all active:scale-95">
                        <ClipboardList className="h-5 w-5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Tareas</span>
                    </Link>

                    {/* Central Action Dial */}
                    <div className="flex items-center justify-center flex-1 px-1">
                        <Link href="/journal/new" className="h-11 w-11 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-90 transition-all text-black hover:bg-emerald-400">
                            <Plus className="h-6 w-6" />
                        </Link>
                    </div>

                    <Link href="/map" className="flex flex-col items-center justify-center flex-1 gap-1 text-slate-400 hover:text-emerald-400 transition-all active:scale-95">
                        <Map className="h-5 w-5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Mapa</span>
                    </Link>
                    <Link href="/inventory" className="flex flex-col items-center justify-center flex-1 gap-1 text-slate-400 hover:text-emerald-400 transition-all active:scale-95">
                        <Package className="h-5 w-5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Stock</span>
                    </Link>
                    <Link href="/analytics" className="flex flex-col items-center justify-center flex-1 gap-1 text-slate-400 hover:text-emerald-400 transition-all active:scale-95">
                        <BarChart3 className="h-5 w-5" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">IA Data</span>
                    </Link>
                </div>
            </nav>
        </div>
    )
}
