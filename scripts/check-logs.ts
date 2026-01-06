import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'

const adapter = new PrismaBetterSqlite3({
    url: 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
    const logs = await prisma.cropLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    })
    console.log("Recent Logs:", JSON.stringify(logs, null, 2))
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
