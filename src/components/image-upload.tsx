'use client'

import { useState, ChangeEvent } from 'react'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    onUpload: (path: string) => void
    label?: string
    className?: string
}

export default function ImageUpload({ onUpload, label, className }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Show local preview immediately
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error('Upload failed')

            const data = await res.json()
            onUpload(data.filepath)
        } catch (error) {
            console.error(error)
            alert("Error subiendo la imagen")
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    const removeImage = () => {
        setPreview(null)
        onUpload('')
    }

    if (preview) {
        return (
            <div className={cn("relative aspect-video w-full overflow-hidden rounded-lg border bg-slate-100", className)}>
                <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                />
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}
                {!uploading && (
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white shadow-lg"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className={cn("w-full", className)}>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImagePlus className="w-8 h-8 mb-2 text-slate-400" />
                    <p className="text-sm text-slate-500"><span className="font-semibold">{label || "Toca para foto"}</span> o subir</p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment" // Opens camera on mobile
                    onChange={handleFileChange}
                />
            </label>
        </div>
    )
}
