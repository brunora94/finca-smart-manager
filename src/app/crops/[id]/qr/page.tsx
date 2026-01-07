import { getCropById } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Printer, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CropQRPage({ params }: { params: { id: string } }) {
    const crop = await getCropById(parseInt(params.id));
    if (!crop) notFound();

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://finca.app/crops/${crop.id}`)}`;

    return (
        <div className="min-h-screen bg-black p-6 flex flex-col items-center justify-center space-y-8 page-animate">
            <header className="w-full max-w-sm flex justify-between items-center mb-4">
                <Link href={`/crops/${crop.id}`} className="text-slate-400 p-2 hover:bg-slate-900 rounded-full transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter">Marcador QR</h1>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <Card className="w-full max-w-sm bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center space-y-6 text-black border-none">
                <div className="text-center space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Finca Smart Manager</p>
                    <h2 className="text-2xl font-black tracking-tight">{crop.name}</h2>
                    <p className="text-sm font-bold text-slate-500 italic">{crop.variety || 'Variedad General'}</p>
                </div>

                <div className="p-4 bg-white border-[12px] border-slate-50 rounded-3xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={qrUrl}
                        alt="QR Code"
                        className="w-48 h-48"
                    />
                </div>

                <div className="text-center">
                    <p className="text-[8px] font-medium text-slate-400 leading-tight">
                        ID: #{crop.id} | Plantado: {new Date(crop.plantedAt).toLocaleDateString()}
                    </p>
                </div>
            </Card>

            <div className="flex flex-col w-full max-w-sm gap-4">
                <button
                    onClick={() => window.print()}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-3 print:hidden"
                >
                    <Printer className="h-5 w-5" />
                    IMPRIMIR MARCADOR
                </button>

                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center space-y-2">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Consejo Maker 3D</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        Imprime este marcador en PETG o ABS para exteriores. <br />
                        Puedes usar un marcador estilo "Estaca" y pegar este QR laminado.
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body { background: white !important; }
                    .print\\:hidden { display: none !important; }
                    main { padding: 0 !important; }
                }
            `}} />
        </div>
    );
}
