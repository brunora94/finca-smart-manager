import MobileLayout from "@/components/mobile-layout"
import Link from "next/link"
import { CreditCard, Settings as SettingsIcon, ChevronRight, User, Bell, Shield, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
    const sections = [
        {
            title: "Herramientas Agrícolas",
            items: [
                { id: 'compatibility', label: "Compatibilidad de Árboles", icon: Sparkles, color: "bg-emerald-500/10 text-emerald-400", href: "/compatibility" },
                { id: 'expenses', label: "Gastos y Compras", icon: CreditCard, color: "bg-blue-500/10 text-blue-400", href: "/expenses" },
            ]
        },
        {
            title: "Preferencias",
            items: [
                { id: 'profile', label: "Perfil de Finca", icon: User, color: "bg-slate-800 text-slate-400", href: "/settings/profile" },
                { id: 'notifs', label: "Notificaciones", icon: Bell, color: "bg-orange-500/10 text-orange-400", href: "/settings/notifications" },
                { id: 'system', label: "Ajustes del Sistema", icon: SettingsIcon, color: "bg-purple-500/10 text-purple-400", href: "/settings/system" },
            ]
        }
    ]

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 bg-black min-h-screen">
                <header className="px-1">
                    <h1 className="text-3xl font-black text-white tracking-tight font-serif">Gestión</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configuración y administración global</p>
                </header>

                <div className="space-y-10 mt-8">
                    {sections.map((section) => (
                        <div key={section.title} className="px-1">
                            <h2 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-4 px-1">{section.title}</h2>
                            <div className="space-y-3">
                                {section.items.map((item) => (
                                    <Link key={item.id} href={item.href}>
                                        <Card className="bg-slate-900 border border-slate-800/50 shadow-xl hover:bg-slate-800 transition-all cursor-pointer rounded-2xl group active:scale-95">
                                            <CardContent className="p-5 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-12 w-12 rounded-xl ${item.color} flex items-center justify-center border border-white/5 shadow-inner`}>
                                                        <item.icon className="h-6 w-6" />
                                                    </div>
                                                    <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{item.label}</span>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-emerald-500 transition-colors" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center pb-8 border-t border-slate-900 pt-8">
                    <p className="text-[9px] text-slate-700 uppercase font-black tracking-[0.3em]">Finca Smart Manager v1.0 • Edición Master</p>
                </div>
            </div>
        </MobileLayout>
    )
}
