'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/image-upload'

import { ChevronLeft, Save } from 'lucide-react'
import Link from 'next/link'

import { createJournalEntry } from '@/app/actions' // Import Server Action

export default function NewEntryPage() {
    const router = useRouter()
    const [note, setNote] = useState('')
    const [imagePath, setImagePath] = useState('')
    const [saving, setSaving] = useState(false)

    const handleSubmit = async () => {
        if (!note && !imagePath) {
            alert("Escribe una nota o sube una foto")
            return
        }

        setSaving(true)

        try {
            const formData = new FormData()
            formData.append('note', note)
            formData.append('imagePath', imagePath)

            await createJournalEntry(formData)

            router.push('/')
            router.refresh()
        } catch (e) {
            console.error(e)
            alert("Error guardando entrada")
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100">
                    <ChevronLeft className="h-6 w-6 text-slate-600" />
                </Link>
                <h1 className="text-xl font-bold text-slate-800">Nueva Entrada</h1>
            </div>

            <div className="space-y-4">
                {/* Photo Upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Foto (Opcional)</label>
                    <ImageUpload onUpload={setImagePath} />
                </div>

                {/* Note Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Notas / Observaciones</label>
                    <textarea
                        className="w-full text-slate-800 p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[150px] resize-none"
                        placeholder="¿Qué has hecho hoy? ¿Cómo ves los cultivos?"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleSubmit}
                disabled={saving}
                className="fixed bottom-20 left-4 right-4 bg-slate-900 text-white py-4 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100"
            >
                {saving ? (
                    "Guardando..."
                ) : (
                    <>
                        <Save className="h-5 w-5" />
                        Guardar en Diario
                    </>
                )}
            </button>
        </div>
    )
}
