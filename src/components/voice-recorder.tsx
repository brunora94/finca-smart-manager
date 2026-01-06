"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, Save, X, Sparkles } from "lucide-react";
import { logCropProgress } from "@/app/actions";

export default function VoiceRecorder({ cropId, onSuccess }: { cropId: number, onSuccess?: () => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "speechRecognition" in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = "es-ES";

            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };
        }
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            setTranscript("");
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const handleSave = async () => {
        if (!transcript) return;
        setLoading(true);
        try {
            await logCropProgress(cropId, "", transcript);
            setIsOpen(false);
            setTranscript("");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to save voice log", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full p-4 bg-slate-900 rounded-2xl border border-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
                <Mic className="h-4 w-4 text-emerald-500" />
                Dictar Nota
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 animate-gradient" />

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dictado Inteligente</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-black/40 border border-slate-800 rounded-2xl p-6 min-h-[150px] flex flex-col justify-between">
                    <p className={`text-sm font-medium leading-relaxed ${transcript ? 'text-white' : 'text-slate-600 italic'}`}>
                        {transcript || (isRecording ? "Escuchando..." : "Presiona el micro para empezar a hablar...")}
                    </p>

                    {isRecording && (
                        <div className="flex gap-1 mt-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-1 bg-emerald-500 rounded-full animate-bounce" style={{ height: `${Math.random() * 20 + 5}px`, animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={toggleRecording}
                        className={`flex-1 p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${isRecording ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500 text-black'}`}
                    >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        {isRecording ? "Parar" : "Hablar"}
                    </button>

                    <button
                        disabled={!transcript || loading}
                        onClick={handleSave}
                        className="flex-1 p-4 bg-blue-600 disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Guardar
                    </button>
                </div>

                <div className="flex items-center gap-2 justify-center py-2 opacity-50">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Procesado con IA de Voz</span>
                </div>
            </div>
        </div>
    );
}
