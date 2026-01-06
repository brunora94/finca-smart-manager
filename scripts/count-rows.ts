import prisma from "../src/lib/prisma";

async function countRows() {
    console.log("Counting rows in DB...");
    try {
        const crops = await prisma.crop.count();
        const trees = await prisma.tree.count();
        const tasks = await prisma.task.count();
        const cropLogs = await prisma.cropLog.count();
        const weatherLogs = await prisma.weatherLog.count();

        console.log(`Crops: ${crops}`);
        console.log(`Trees: ${trees}`);
        console.log(`Tasks: ${tasks}`);
        console.log(`CropLogs: ${cropLogs}`);
        console.log(`WeatherLogs: ${weatherLogs}`);
    } catch (e) {
        console.error("Error counting rows:", e);
    }
}

countRows().finally(() => prisma.$disconnect());
