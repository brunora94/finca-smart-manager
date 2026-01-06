const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

async function cleanup() {
    console.log("Starting cleanup...");

    // 1. Wipe Database Logs
    const adapter = new PrismaBetterSqlite3({
        url: 'dev.db'
    })
    const prisma = new PrismaClient({ adapter })

    try {
        const deleted = await prisma.cropLog.deleteMany({});
        console.log(`Deleted ${deleted.count} database entries.`);
    } catch (err) {
        console.error("DB Cleanup Error:", err);
    } finally {
        await prisma.$disconnect();
    }

    // 2. Wipe Uploads Folder
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const file of files) {
            if (file === '.gitkeep') continue;
            const filePath = path.join(uploadsDir, file);
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${file}`);
        }
    }

    console.log("Cleanup complete!");
}

cleanup();
