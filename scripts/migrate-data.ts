import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const sqlite = new Database('dev.db');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("❌ DATABASE_URL missing");
    process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrate() {
    console.log("🚀 Starting migration from dev.db to Supabase...");

    // 1. Migrate Crops
    console.log("Migrating Crops...");
    const crops = sqlite.prepare('SELECT * FROM Crop').all();
    for (const crop of crops as any[]) {
        await prisma.crop.upsert({
            where: { id: crop.id },
            update: {},
            create: {
                id: crop.id,
                name: crop.name,
                variety: crop.variety,
                status: crop.status,
                plantedAt: new Date(crop.plantedAt),
                harvestDate: crop.harvestDate ? new Date(crop.harvestDate) : null,
                location: crop.location,
                bed: crop.bed,
                row: crop.row,
                imageUrl: crop.imageUrl,
                latitude: crop.latitude,
                longitude: crop.longitude,
                notes: crop.notes
            }
        });
    }
    console.log(`✅ Migrated ${crops.length} crops.`);

    // 2. Migrate Trees
    console.log("Migrating Trees...");
    const trees = sqlite.prepare('SELECT * FROM Tree').all();
    for (const tree of trees as any[]) {
        await prisma.tree.upsert({
            where: { id: tree.id },
            update: {},
            create: {
                id: tree.id,
                name: tree.name,
                plantedYear: tree.plantedYear,
                location: tree.location,
                latitude: tree.latitude,
                longitude: tree.longitude,
                health: tree.health,
                notes: tree.notes
            }
        });
    }
    console.log(`✅ Migrated ${trees.length} trees.`);

    // 3. Migrate Tasks (Handle Foreign Keys optional)
    console.log("Migrating Tasks...");
    const tasks = sqlite.prepare('SELECT * FROM Task').all();
    for (const task of tasks as any[]) {
        // Verify cropId exists if present
        let cropId = task.cropId;
        if (cropId) {
            const cropExists = await prisma.crop.findUnique({ where: { id: cropId } });
            if (!cropExists) cropId = null;
        }

        await prisma.task.upsert({
            where: { id: task.id },
            update: {},
            create: {
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                periodicity: task.periodicity,
                category: task.category,
                priority: task.priority,
                cropId: cropId
            }
        });
    }
    console.log(`✅ Migrated ${tasks.length} tasks.`);

    // 4. Migrate CropLogs
    console.log("Migrating CropLogs...");
    const cropLogs = sqlite.prepare('SELECT * FROM CropLog').all();
    for (const log of cropLogs as any[]) {
        // Verify cropId exists
        const cropExists = await prisma.crop.findUnique({ where: { id: log.cropId } });
        if (!cropExists) continue;

        await prisma.cropLog.upsert({
            where: { id: log.id },
            update: {},
            create: {
                id: log.id,
                cropId: log.cropId,
                date: new Date(log.date),
                createdAt: new Date(log.createdAt),
                imageUrl: log.imageUrl,
                note: log.note,
                aiAnalysis: log.aiAnalysis
            }
        });
    }
    console.log(`✅ Migrated ${cropLogs.length} crop logs.`);

    // 5. Migrate Expenses
    console.log("Migrating Expenses...");
    const expenses = sqlite.prepare('SELECT * FROM Expense').all();
    for (const exp of expenses as any[]) {
        await prisma.expense.upsert({
            where: { id: exp.id },
            update: {},
            create: {
                id: exp.id,
                item: exp.item,
                amount: exp.amount,
                category: exp.category,
                date: new Date(exp.date),
                shop: exp.shop
            }
        });
    }
    console.log(`✅ Migrated ${expenses.length} expenses.`);

    // 6. Migrate Resources
    console.log("Migrating Resources...");
    const resources = sqlite.prepare('SELECT * FROM Resource').all();
    for (const res of resources as any[]) {
        await prisma.resource.upsert({
            where: { id: res.id },
            update: {},
            create: {
                id: res.id,
                name: res.name,
                category: res.category,
                quantity: res.quantity,
                unit: res.unit,
                minStock: res.minStock,
                updatedAt: new Date(res.updatedAt)
            }
        });
    }
    console.log(`✅ Migrated ${resources.length} resources.`);

    console.log("🎉 Migration completed successfully!");
}

migrate()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        sqlite.close();
    });
