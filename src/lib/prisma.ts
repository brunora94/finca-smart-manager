import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    // Attempt to initialize Prisma
    try {
        return new PrismaClient()
    } catch (e) {
        console.error("Failed to initialize Prisma Client:", e);

        // Recursive proxy to handle deep nesting like prisma.crop.count()
        // properties return the proxy itself, function calls return a Promise
        const emptyPromise = Promise.resolve([]);
        const proxyHandler: ProxyHandler<any> = {
            get: (target, prop) => {
                if (prop === 'then') return undefined; // Avoid treating as Promise
                if (prop === 'catch') return undefined;
                if (prop === 'finally') return undefined;

                // Return the proxy for any property access to allow chaining
                return new Proxy(() => emptyPromise, proxyHandler);
            },
            apply: (target, thisArg, args) => {
                // If it's a function call (like .count(), .findMany()), return safe defaults
                return emptyPromise;
            }
        };

        return new Proxy(() => { }, proxyHandler) as unknown as PrismaClient;
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
