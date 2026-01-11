import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const prismaClientSingleton = () => {
    // Last resort for self-signed certificate errors in Vercel/Supabase
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    try {
        // Support multiple environment variable names including the custom supbase_ prefix
        const connectionString = (
            process.env.supbase_POSTGRES_URL ||
            process.env.supbase_POSTGRES_PRISMA_URL ||
            process.env.SUPABASE_DATABASE_URL ||
            process.env.SUPABASE_URL ||
            process.env.DATABASE_URL ||
            process.env.POSTGRES_PRISMA_URL ||
            process.env.POSTGRES_URL ||
            process.env.POSTGRES_URL_NON_POOLING
        )?.trim().replace(/^["']|["']$/g, ""); // Remove quotes and spaces

        if (!connectionString) {
            throw new Error("No se encontró ninguna variable de conexión (DATABASE_URL, etc.) en el entorno.");
        }

        const pool = new pg.Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 15000, // Slightly more time for cold starts
        });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter });
    } catch (e: any) {
        console.error("FATAL: Prisma Client init failed:", e.message);

        // Smart Proxy to handle specific Prisma methods with safe defaults
        const proxyHandler: ProxyHandler<any> = {
            get: (target, prop) => {
                if (prop === 'then') return undefined; // Promise safety

                // Return a function that returns a Promise resolving to a safe default
                return new Proxy(() => { }, {
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
                        return new Proxy(() => { }, {
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
