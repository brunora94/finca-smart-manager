"use client";

import dynamic from "next/dynamic";

const FarmMap = dynamic(() => import("@/components/farm-map"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-2xl" />
});

interface MapClientProps {
    crops: any[];
    trees: any[];
    rainfallToday: number;
    history: any[];
}

export default function MapClient({ crops, trees, rainfallToday, history }: MapClientProps) {
    return (
        <div className="h-[500px] w-full">
            <FarmMap
                crops={crops}
                trees={trees}
                rainfallToday={rainfallToday}
                history={history}
            />
        </div>
    );
}
