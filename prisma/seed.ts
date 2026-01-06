import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!.replace('file:', '')
})
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding database...')

    // Limpiar datos antiguos
    await prisma.task.deleteMany()
    await prisma.cropLog.deleteMany()
    await prisma.crop.deleteMany()

    // Crear Cultivos
    const puerros = await prisma.crop.create({
        data: {
            name: 'Puerros',
            status: 'Planted',
            location: 'Bancal 1',
            plantedAt: new Date('2025-10-15'),
            notes: 'Variedad de invierno',
        },
    })

    const ajos = await prisma.crop.create({
        data: {
            name: 'Ajos',
            status: 'Planted',
            location: 'Bancal 2',
            plantedAt: new Date('2025-12-05'),
        },
    })

    const repollo = await prisma.crop.create({
        data: {
            name: 'Repollo',
            status: 'Planted',
            location: 'Bancal 1',
            plantedAt: new Date('2025-09-20'),
        },
    })

    // Crear Tareas (Mantenimiento y Cultivo)
    await prisma.task.createMany({
        data: [
            {
                title: 'Regar Ajos',
                description: 'Tierra seca, necesitan agua si no llueve',
                status: 'Pending',
                priority: 'High',
                dueDate: new Date(), // Hoy
                category: 'Garden',
                cropId: ajos.id,
            },
            {
                title: 'Revisar Aceite Cortacésped',
                description: 'Cambio de aceite anual antes de la temporada',
                status: 'Pending',
                dueDate: new Date(Date.now() + 86400000), // Mañana
                category: 'Machinery',
            },
            {
                title: 'Pintar Caseta',
                description: 'Retocar pintura de la fachada sur',
                status: 'Pending',
                category: 'Infrastructure',
            },
        ],
    })

    console.log('Database seeded!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
