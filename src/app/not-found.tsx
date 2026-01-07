import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
            <h2 className="text-4xl font-black text-emerald-500 mb-4">404</h2>
            <p className="text-xl font-bold mb-8">Página no encontrada</p>
            <Link href="/" className="px-6 py-3 bg-emerald-600 rounded-2xl font-black text-sm hover:bg-emerald-500 transition-colors">
                Volver al Inicio
            </Link>
        </div>
    )
}
