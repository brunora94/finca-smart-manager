import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
