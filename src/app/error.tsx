'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to console for Vercel logs
        console.error('Runtime Application Error:', error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
            <div className="bg-red-500/10 p-6 rounded-full border border-red-500/20 mb-6">
                <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-tight">Error de Sistema</h2>
            <p className="text-sm font-medium text-slate-400 mb-8 max-w-md">
                Ocurrió algo inesperado. Es posible que la base de datos no esté conectada.
            </p>
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 mb-8 w-full max-w-md text-left overflow-auto max-h-48 scrollbar-hide">
                <code className="text-xs font-mono text-red-400 block whitespace-pre-wrap">
                    {error.message || "Error desconocido"}
                </code>
                {error.stack && (
                    <code className="text-[10px] font-mono text-slate-600 block mt-2 border-t border-slate-800 pt-2 whitespace-pre-wrap">
                        {error.stack.split('\n')[0]}
                    </code>
                )}
            </div>
            <button
                onClick={reset}
                className="px-6 py-3 bg-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
            >
                Reintentar Conexión
            </button>
        </div>
    )
}
