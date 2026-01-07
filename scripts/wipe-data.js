const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function cleanup() {
    console.log("Starting cleanup...");

    // 1. Wipe Database Logs
    const prisma = new PrismaClient();

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
