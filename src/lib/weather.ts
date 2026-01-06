import prisma from "./prisma";

// Ensure we always work with UTC 00:00:00 to avoid timezone shifts in SQLite
function getUTCDate(date: Date = new Date()) {
    const d = new Date(date);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export async function updateRainfallData(lat: number = 43.43519, lon: number = -5.68478) {
    try {
        const dateObj = getUTCDate();

        if (!prisma) return null;

        // Fetch from Open-Meteo
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,relative_humidity_2m_max,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
        );

        if (!response.ok) throw new Error("Weather API failed");
        const data = await response.json();

        if (data.daily) {
            const rainfall = data.daily.precipitation_sum[0];
            const humidity = data.daily.relative_humidity_2m_max[0];
            const tMax = data.daily.temperature_2m_max[0];
            const tMin = data.daily.temperature_2m_min[0];

            const log = await prisma.weatherLog.upsert({
                where: { date: dateObj },
                update: {
                    precipitation: rainfall,
                    humidity: humidity,
                    tempMax: tMax,
                    tempMin: tMin
                },
                create: {
                    date: dateObj,
                    precipitation: rainfall,
                    humidity: humidity,
                    tempMax: tMax,
                    tempMin: tMin
                }
            });

            return log;
        }
    } catch (error) {
        console.error("Failed to fetch/store weather:", error);
        return null;
    }
    return null;
}

export async function getCurrentWeather(lat: number = 43.43519, lon: number = -5.68478) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&daily=temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3`
        );
        if (!response.ok) throw new Error("Weather API failed");
        const data = await response.json();

        const alerts = [];
        // Check for frost in next 3 days
        const minTemps = data.daily.temperature_2m_min;
        if (minTemps.some((t: number) => t < 2)) {
            alerts.push({ type: 'Frost', message: 'Riesgo de helada detectado' });
        }
        // Check for heavy rain
        const rain = data.daily.precipitation_sum;
        if (rain.some((r: number) => r > 10)) {
            alerts.push({ type: 'Rain', message: 'Lluvias fuertes previstas' });
        }

        return {
            temp: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            code: data.current.weather_code,
            time: data.current.time,
            alerts
        };
    } catch (error) {
        console.error("Failed to fetch current weather:", error);
        return null;
    }
}

export async function getRecentRainfall() {
    if (!prisma || !(prisma as any).weatherLog) return [];
    const result = await (prisma as any).weatherLog.findMany({
        take: 7,
        orderBy: { date: 'desc' }
    });
    return result;
}

export async function syncWeatherHistory(lat: number = 43.43519, lon: number = -5.68478) {
    try {
        if (!prisma || !(prisma as any).weatherLog) return;

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,relative_humidity_2m_max,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=7&forecast_days=1`
        );
        const data = await response.json();

        if (data.daily) {
            for (let i = 0; i < data.daily.time.length; i++) {
                const dateStr = data.daily.time[i];
                const dateObj = new Date(dateStr + "T00:00:00Z");

                await (prisma as any).weatherLog.upsert({
                    where: { date: dateObj },
                    update: {
                        precipitation: data.daily.precipitation_sum[i],
                        humidity: data.daily.relative_humidity_2m_max[i],
                        tempMax: data.daily.temperature_2m_max[i],
                        tempMin: data.daily.temperature_2m_min[i]
                    },
                    create: {
                        date: dateObj,
                        precipitation: data.daily.precipitation_sum[i],
                        humidity: data.daily.relative_humidity_2m_max[i],
                        tempMax: data.daily.temperature_2m_max[i],
                        tempMin: data.daily.temperature_2m_min[i]
                    }
                });
            }
        }
    } catch (error) {
        console.error("Sync failed:", error);
    }
}
