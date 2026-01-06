import prisma from "../src/lib/prisma";

async function seedCoordinates() {
    console.log("Seeding coordinates...");

    const crops = await prisma.crop.findMany();
    const trees = await prisma.tree.findMany();

    const centerLat = 43.43519;
    const centerLon = -5.68478;

    // Scatter crops
    for (let i = 0; i < crops.length; i++) {
        await prisma.crop.update({
            where: { id: crops[i].id },
            data: {
                latitude: centerLat + (Math.random() - 0.5) * 0.001,
                longitude: centerLon + (Math.random() - 0.5) * 0.001
            }
        });
    }

    // Scatter trees
    for (let i = 0; i < trees.length; i++) {
        await prisma.tree.update({
            where: { id: trees[i].id },
            data: {
                latitude: centerLat + (Math.random() - 0.5) * 0.001,
                longitude: centerLon + (Math.random() - 0.5) * 0.001
            }
        });
    }

    console.log("Coordinates seeded!");
}

seedCoordinates().finally(() => prisma.$disconnect());
