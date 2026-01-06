'use client'

import { useState, useEffect } from "react"
import { globalSearch } from "@/app/actions"
import MobileLayout from "@/components/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Search as SearchIcon, Sprout, Trees, Package, ClipboardList, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SearchPage() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true)
                try {
                    const res = await globalSearch(query)
                    setResults(res)
                } catch (e) {
                    console.error("Search failed:", e)
                } finally {
                    setLoading(false)
                }
            } else {
                setResults(null)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [query])

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 page-animate">
                <header>
                    <h1 className="text-2xl font-black text-white tracking-tighter">BUSCADOR MAESTRO</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Explora toda La Finquina</p>
                </header>

                <div className="relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Busca cultivos, árboles, semillas o tareas..."
                        className="w-full pl-12 pr-4 bg-slate-900 border border-slate-800 rounded-2xl h-14 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500 animate-spin" />}
                </div>

                {!results && !loading && query.length < 2 && (
                    <div className="py-20 text-center space-y-4 opacity-40">
                        <SearchIcon className="h-12 w-12 mx-auto text-slate-600" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Escribe para empezar a buscar</p>
                    </div>
                )}

                {results && (
                    <div className="space-y-8">
                        {/* Crops Section */}
                        {results.crops.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <Sprout className="h-3 w-3 text-emerald-500" />
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cultivos</h3>
                                </div>
                                <div className="grid gap-2">
                                    {results.crops.map((crop: any) => (
                                        <Link key={crop.id} href={`/crops/${crop.id}`}>
                                            <Card className="bg-slate-900 border-slate-800 hover:border-emerald-500/30 active:scale-95 transition-all rounded-2xl">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                                            <Sprout className="h-5 w-5 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{crop.name}</p>
                                                            <p className="text-[10px] text-slate-500">{crop.variety || 'Sin variedad'}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-700" />
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Trees Section */}
                        {results.trees.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <Trees className="h-3 w-3 text-blue-500" />
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Árboles</h3>
                                </div>
                                <div className="grid gap-2">
                                    {results.trees.map((tree: any) => (
                                        <Link key={tree.id} href={`/map?treeId=${tree.id}`}>
                                            <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/30 active:scale-95 transition-all rounded-2xl">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                            <Trees className="h-5 w-5 text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{tree.name}</p>
                                                            <p className="text-[10px] text-slate-500">{tree.location || 'Asturias'}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-700" />
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Resources Section */}
                        {results.resources.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <Package className="h-3 w-3 text-amber-500" />
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Almacén</h3>
                                </div>
                                <div className="grid gap-2">
                                    {results.resources.map((res: any) => (
                                        <Link key={res.id} href="/inventory">
                                            <Card className="bg-slate-900 border-slate-800 hover:border-amber-500/30 active:scale-95 transition-all rounded-2xl">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                                            <Package className="h-5 w-5 text-amber-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{res.name}</p>
                                                            <p className="text-[10px] text-slate-500">{res.quantity} {res.unit} • {res.category}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-700" />
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Tasks Section */}
                        {results.tasks.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 px-1">
                                    <ClipboardList className="h-3 w-3 text-rose-500" />
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tareas</h3>
                                </div>
                                <div className="grid gap-2">
                                    {results.tasks.map((task: any) => (
                                        <Link key={task.id} href="/tasks">
                                            <Card className="bg-slate-900 border-slate-800 hover:border-rose-500/30 active:scale-95 transition-all rounded-2xl">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                                            <ClipboardList className="h-5 w-5 text-rose-500" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white line-clamp-1">{task.title}</p>
                                                            <p className="text-[10px] text-slate-500">{task.crop?.name || 'General'}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-700" />
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {results.crops.length === 0 && results.trees.length === 0 && results.resources.length === 0 && results.tasks.length === 0 && (
                            <div className="py-20 text-center space-y-4 opacity-40">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No se encontraron resultados para "{query}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MobileLayout>
    )
}
