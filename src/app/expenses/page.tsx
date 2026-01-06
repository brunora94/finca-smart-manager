import MobileLayout from "@/components/mobile-layout";
import { getExpenses } from "@/app/actions";
import ExpenseForm from "@/components/expense-form";
import { Card, CardContent } from "@/components/ui/card";
import { Euro, Calendar, ShoppingBag, Trash2, TrendingDown } from "lucide-react";
import { deleteExpense } from "@/app/actions";

export default async function ExpensesPage() {
    const expenses = await getExpenses();
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 bg-black min-h-screen">
                <header className="flex justify-between items-end px-1">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight font-serif">Gastos</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Control Financiero</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-emerald-500 tracking-wider">Total Invertido</p>
                        <p className="text-2xl font-black text-white">{totalSpent.toLocaleString('es-ES', { minimumFractionDigits: 2 })}<span className="text-xs ml-1 text-slate-500">€</span></p>
                    </div>
                </header>

                <ExpenseForm />

                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Historial de Compras</h2>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-400">
                            {expenses.length} registros
                        </span>
                    </div>

                    <div className="space-y-3">
                        {expenses.length === 0 ? (
                            <div className="text-center py-16 bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-800">
                                <Euro className="mx-auto h-12 w-12 text-slate-800 mb-3" />
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sin gastos registrados</p>
                            </div>
                        ) : (
                            expenses.map((expense) => (
                                <Card key={expense.id} className="border-none shadow-xl overflow-hidden bg-slate-900 group">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-emerald-500 border border-slate-800">
                                                <TrendingDown className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-100">{expense.item}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-black uppercase">
                                                        {expense.category}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(expense.date).toLocaleDateString('es-ES')}
                                                    </div>
                                                    {expense.shop && (
                                                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold">
                                                            <ShoppingBag className="h-3 w-3" />
                                                            {expense.shop}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-black text-xl text-white">
                                                {expense.amount.toFixed(2)}<span className="text-[10px] ml-0.5 text-slate-500">€</span>
                                            </p>
                                            <form action={async () => {
                                                'use server'
                                                const { deleteExpense } = await import("../actions");
                                                await deleteExpense(expense.id);
                                            }}>
                                                <button className="text-slate-700 hover:text-red-500 transition-colors p-2" title="Borrar">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </MobileLayout>
    );
}
