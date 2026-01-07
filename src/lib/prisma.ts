```typescript
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    try {
        return new PrismaClient()
    } catch (e) {
        console.error("Failed to initialize Prisma Client:", e);

        // Smart Proxy to handle specific Prisma methods with safe defaults
        const proxyHandler: ProxyHandler<any> = {
            get: (target, prop) => {
                if (prop === 'then') return undefined; // Promise safety
                
                // Return a function that returns a Promise resolving to a safe default
                return new Proxy(() => {}, {
                    apply: (target, thisArg, args) => {
                        const propName = String(prop);
                        if (propName === 'count') return Promise.resolve(0);
                        if (propName === 'findMany') return Promise.resolve([]);
                        if (propName === 'findUnique' || propName === 'findFirst') return Promise.resolve(null);
                        if (propName === 'create' || propName === 'update' || propName === 'upsert') return Promise.resolve({});
                        // Default fallback
                        return Promise.resolve([]);
                    },
                    get: (target, subProp) => {
                        // Handle deep chaining like prisma.crop.count()
                         if (subProp === 'then') return undefined;
                         return new Proxy(() => {}, {
                             apply: (subTarget, subThis, subArgs) => {
                                 const subPropName = String(subProp);
                                 if (subPropName === 'count') return Promise.resolve(0);
                                 if (subPropName === 'findMany') return Promise.resolve([]);
                                 if (subPropName === 'findUnique' || subPropName === 'findFirst') return Promise.resolve(null);
                                 return Promise.resolve({});
                             }
                         });
                    }
                });
            }
        };

        return new Proxy({}, proxyHandler) as unknown as PrismaClient;
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
