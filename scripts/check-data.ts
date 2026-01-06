import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const crops = await prisma.crop.findMany({
        select: { bed: true, row: true, name: true }
    })
    console.log("Crops Locations:", JSON.stringify(crops, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
