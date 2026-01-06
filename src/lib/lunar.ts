export type LunarPhase = 'Nueva' | 'Creciente' | 'Llena' | 'Menguante';

export interface LunarInfo {
    phase: LunarPhase;
    illumination: number; // 0 to 100
    recommendation: string;
    dayType: 'Raíz' | 'Hoja' | 'Flor' | 'Fruto' | 'Descanso';
}

/**
 * Calculates the lunar phase and biodynamic recommendation for a given date.
 * Uses a simplified approximation based on the average lunar cycle.
 */
export function getLunarInfo(date: Date = new Date()): LunarInfo {
    // Reference: New Moon on Jan 6, 2000
    const referenceDate = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const lunarCycle = 29.530588;

    const diffMs = date.getTime() - referenceDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    const phaseDays = diffDays % lunarCycle;
    const illumination = 100 * (1 - Math.abs(2 * (phaseDays / lunarCycle) - 1));

    let phase: LunarPhase;
    let recommendation: string;
    let dayType: LunarInfo['dayType'];

    // simplified buckets for phases
    if (phaseDays < 1.5 || phaseDays > (lunarCycle - 1.5)) {
        phase = 'Nueva';
        dayType = 'Descanso';
        recommendation = 'Evitar siembra. Buen momento para control de plagas y limpieza.';
    } else if (phaseDays < (lunarCycle / 2 - 1.5)) {
        phase = 'Creciente';
        dayType = Math.floor(phaseDays % 4) === 0 ? 'Hoja' : 'Flor';
        recommendation = 'Ideal para sembrar plantas de superficie (hojas y flores). El vigor sube.';
    } else if (phaseDays < (lunarCycle / 2 + 1.5)) {
        phase = 'Llena';
        dayType = 'Fruto';
        recommendation = 'Momento de máxima savia. Ideal para cosechar frutos y trasplantar.';
    } else {
        phase = 'Menguante';
        dayType = 'Raíz';
        recommendation = 'Energía hacia las raíces. Ideal para siembra de tubérculos y poda.';
    }

    return { phase, illumination: Math.round(illumination), recommendation, dayType };
}
