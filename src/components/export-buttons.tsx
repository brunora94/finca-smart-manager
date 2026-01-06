'use client'

import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { exportFincaData, exportExpensesData } from "@/app/actions"

export default function ExportButtons() {
    const [loadingCrops, setLoadingCrops] = useState(false)
    const [loadingExpenses, setLoadingExpenses] = useState(false)

    const handleExportCrops = async () => {
        setLoadingCrops(true);
        try {
            const csv = await exportFincaData();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `cuaderno_la_finquina_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCrops(false);
        }
    };

    const handleExportExpenses = async () => {
        setLoadingExpenses(true);
        try {
            const csv = await exportExpensesData();
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `gastos_la_finquina_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingExpenses(false);
        }
    };

    return (
        <div className="space-y-3 pt-6 border-t border-slate-800/50">
            <button
                onClick={handleExportCrops}
                disabled={loadingCrops}
                className="w-full p-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
            >
                {loadingCrops ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                Exportar Cuaderno
            </button>

            <button
                onClick={handleExportExpenses}
                disabled={loadingExpenses}
                className="w-full p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 disabled:opacity-50 text-slate-300 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95"
            >
                {loadingExpenses ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                Exportar Gastos
            </button>
            <p className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-widest">Formato CSV compatible con Excel y registros oficiales</p>
        </div>
    );
}
