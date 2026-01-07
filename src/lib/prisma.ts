import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    try {
        return new PrismaClient()
    } catch (e) {
        console.warn("Failed to initialize Prisma Client (likely during build). Using fallback mock.");
        // Return a proxy that handles any property access gracefully to prevent crashes
        return new Proxy({}, {
            get: (target, prop) => {
                if (prop === 'then') return undefined; // Promise safety
                return () => Promise.resolve([]); // Return empty array for any function call (findMany, etc.)
            }
        }) as unknown as PrismaClient;
    }
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
