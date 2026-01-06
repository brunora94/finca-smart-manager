'use server'

import prisma from "@/lib/prisma"

const MONTHS_ES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export async function getHarvestCalendarData() {
    try {
        const crops = await prisma.crop.findMany({
            where: { status: 'Planted' },
            include: {
                logs: {
                    take: 1,
                    orderBy: { date: 'desc' }
                }
            }
        });

        const calendarEvents: any[] = [];

        for (const crop of crops) {
            const latestLog = crop.logs[0];
            let harvestText = "Pendiente de análisis";
            let sortDate = new Date(9999, 11, 31); // Default to far future

            if (latestLog?.aiAnalysis) {
                // Extract extraction date text
                const harvestMatch = latestLog.aiAnalysis.match(/📆 Cosecha estimada: (.*?)(\n|$)/);
                if (harvestMatch) {
                    harvestText = harvestMatch[1].trim();

                    // Heuristic sorting
                    const lowerText = harvestText.toLowerCase();
                    const currentYear = new Date().getFullYear();

                    // Find month
                    const monthIndex = MONTHS_ES.findIndex(m => lowerText.includes(m));

                    if (monthIndex !== -1) {
                        // Check for year in text, otherwise assume current or next depending on month
                        let year = currentYear;
                        const yearMatch = lowerText.match(/202[0-9]/);
                        if (yearMatch) {
                            year = parseInt(yearMatch[0]);
                        } else {
                            // If month is earlier than current month, assume next year (simple heuristic)
                            if (monthIndex < new Date().getMonth()) {
                                year += 1;
                            }
                        }
                        sortDate = new Date(year, monthIndex, 15); // Mid-month
                    }
                }
            }

            // Only add if we have some info or it's active
            calendarEvents.push({
                crop,
                prediction: harvestText,
                sortDate,
                monthName: sortDate.getFullYear() === 9999 ? 'Pendiente' : sortDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
            });
        }

        // Sort by date
        return calendarEvents.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

    } catch (e) {
        console.error("Error getting calendar data:", e);
        return [];
    }
}
