import { getResources, addResource, updateResourceQuantity, deleteResource } from "@/app/actions";
import MobileLayout from "@/components/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Plus, Minus, Trash2, AlertCircle, ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
    const resources = await getResources();

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 page-animate">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter">ALMACÉN</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gestión de Insumos</p>
                    </div>
                </header>

                {/* Add Resource Form (Simplified) */}
                <Card className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                    <CardContent className="p-6">
                        <form action={addResource} className="space-y-4">
                            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Nuevo Recurso
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <input name="name" placeholder="Nombre (ej: Urea)" className="col-span-2 w-full px-4 py-3 bg-black border border-slate-800 rounded-2xl text-sm text-white" required />
                                <select name="category" className="w-full px-4 py-3 bg-black border border-slate-800 rounded-2xl text-sm text-white">
                                    <option value="Seeds">Semillas</option>
                                    <option value="Fertilizer">Abono/Fertilizante</option>
                                    <option value="Tools">Herramientas</option>
                                    <option value="Other">Otros</option>
                                </select>
                                <input name="unit" placeholder="Unidad (kg, l, ud)" className="w-full px-4 py-3 bg-black border border-slate-800 rounded-2xl text-sm text-white" required />
                                <input name="quantity" type="number" step="0.1" placeholder="Cant. Inicial" className="w-full px-4 py-3 bg-black border border-slate-800 rounded-2xl text-sm text-white" required />
                                <input name="minStock" type="number" step="0.1" placeholder="Stock Mín. (Alerta)" className="w-full px-4 py-3 bg-black border border-slate-800 rounded-2xl text-sm text-white" required />
                                <input name="cost" type="number" step="0.01" placeholder="Coste (€) (Opcional)" className="w-full px-4 py-3 bg-black border border-slate-800 rounded-2xl text-sm text-white" />
                            </div>
                            <button className="w-full py-4 bg-emerald-600 text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all">
                                Añadir al Inventario & Registrar Gasto
                            </button>
                        </form>
                    </CardContent>
                </Card>

                {/* Inventory List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Existencias Actuales</h3>
                    {resources.length === 0 ? (
                        <div className="p-12 border border-dashed border-slate-800 rounded-[2.5rem] text-center">
                            <p className="text-sm text-slate-600 italic">El almacén está vacío.</p>
                        </div>
                    ) : (
                        resources.map((res: any) => (
                            <Card key={res.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group">
                                <CardContent className="p-5 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${res.quantity <= res.minStock ? 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                                            <Package className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-white">{res.name}</h4>
                                                {res.quantity <= res.minStock && (
                                                    <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Bajo Stock</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{res.category}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white leading-none">{res.quantity} <span className="text-[10px] text-slate-500 uppercase">{res.unit}</span></p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <form action={async () => { 'use server'; await updateResourceQuantity(res.id, 1); }}>
                                                <button className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors">
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </form>
                                            <form action={async () => { 'use server'; await updateResourceQuantity(res.id, -1); }}>
                                                <button className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                            </form>
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
