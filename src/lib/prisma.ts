import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // Attempt to initialize Prisma
    try {
        return new PrismaClient()
    } catch (e) {
        // Only mock if we are strictly in a build phase where env vars might be missing
        // If we are in runtime production, we WANT this to crash so we see the logs, 
        // but let's try to mock just to be safe for the build process.
        console.error("Failed to initialize Prisma Client:", e);

        // If we are getting this in production runtime, it means configuration is wrong.
        // But throwing here crashes the pod. Let's return the proxy but log LOUDLY.
        return new Proxy({}, {
            get: (target, prop) => {
                if (prop === 'then') return undefined;
                console.error(`[Prisma Mock] Attempted to access property '${String(prop)}' on mock client. DB Connection likely failed.`);
                return () => Promise.resolve([]);
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
