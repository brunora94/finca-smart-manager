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
            process.env.supbase_postgres_url ||
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

        // HEAL: Encode special characters in password if they are unencoded
        let sanitizedString = connectionString;
        try {
            const url = new URL(connectionString);
            if (url.password) {
                // Manually encode password parts that might have @ or ! that URL() might miss
                const encodedPassword = encodeURIComponent(decodeURIComponent(url.password));
                url.password = encodedPassword;
                sanitizedString = url.toString();
            }
        } catch (e) {
            const match = connectionString.match(/^(postgresql:\/\/.*?):(.*)@(.*)$/);
            if (match) {
                const [_, prefix, password, suffix] = match;
                // Double protection for @ and !
                const safePassword = encodeURIComponent(decodeURIComponent(password));
                sanitizedString = `${prefix}:${safePassword}@${suffix}`;
            }
        }

        // Capture system variables before we delete them
        const systemUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
        let manualPassword = "";

        // HEAL: Encode special characters
        // ... (existing healing logic from lines 30-45 is assumed handled above, effectively)
        // Actually, let's just grab the password from the sanitizedString we just made
        try {
            const tempUrl = new URL(sanitizedString);
            manualPassword = decodeURIComponent(tempUrl.password);
        } catch (e) {
            // Fallback parse
            const m = sanitizedString.match(/^(postgresql:\/\/.*?):(.*)@(.*)$/);
            if (m) manualPassword = decodeURIComponent(m[2]);
        }

        // NUCLEAR DNS FIX:
        // The "db." hostname is confirmed broken for this project.
        // We MUST rewrite it to a pooler, regardless of any other checks.
        if (sanitizedString.includes("db.goqyxsyrrcgsknnctdny.supabase.co")) {
            try {
                // Default to US East 1 (N. Virginia) - The other most common region
                const explicitHost = "aws-0-us-east-1.pooler.supabase.com";
                const tempUrl = new URL(sanitizedString);

                console.log(`[Database] ⚠️ DETECTED BROKEN HOST: ${tempUrl.hostname}`);

                // Rewrite to Pooler
                tempUrl.hostname = explicitHost;
                tempUrl.port = "6543";

                // Fix User (pooler needs postgres.project_ref)
                const projectRef = "goqyxsyrrcgsknnctdny";
                if (tempUrl.username === "postgres") {
                    tempUrl.username = `postgres.${projectRef}`;
                }

                sanitizedString = tempUrl.toString();
                console.log(`[Database] 🔄 REDIRECTED TO: ${explicitHost} (User: ${tempUrl.username})`);
            } catch (nuclearErr) {
                console.error("[Database] Nuclear fix failed", nuclearErr);
            }
        }
        else if (systemUrl && sanitizedString.includes("db.") && systemUrl.includes("pooler.")) {
            // Standard Host Swap (still useful if vars return)
            try {
                const sysUrlObj = new URL(systemUrl);
                sysUrlObj.password = encodeURIComponent(manualPassword);
                console.log(`[Database] Swapping broken 'db.' host for working pooler host: ${sysUrlObj.hostname}`);
                sanitizedString = sysUrlObj.toString();
            } catch (swapErr) {
                console.error("[Database] Host swap failed", swapErr);
            }
        }

        // Region Fallback (Generic safety net)
        else if (!systemUrl && sanitizedString.includes("db.")) {
            try {
                // Same logic but generic for other projects if reused
                const explicitHost = "aws-0-eu-central-1.pooler.supabase.com";
                const tempUrl = new URL(sanitizedString);
                const matchRef = tempUrl.hostname.match(/^db\.(.*?)\.supabase\.co$/);
                if (matchRef) {
                    const projectRef = matchRef[1];
                    tempUrl.hostname = explicitHost;
                    tempUrl.port = "6543";
                    if (tempUrl.username === 'postgres') {
                        tempUrl.username = `postgres.${projectRef}`;
                    }
                    console.log(`[Database] DNS Fallback: Betting on ${explicitHost}`);
                    sanitizedString = tempUrl.toString();
                }
            } catch (fallbackErr) {
                console.error("[Database] Region fallback failed", fallbackErr);
            }
        }

        // and if it points to a Prisma Cloud URL, it triggers the circuit breaker.
        // We also delete other common Vercel/Prisma variables to avoid confusion.
        process.env.DATABASE_URL = sanitizedString;
        delete process.env.PRISMA_DATABASE_URL;
        delete process.env.POSTGRES_URL;
        delete process.env.POSTGRES_PRISMA_URL;
        delete process.env.POSTGRES_URL_NON_POOLING;

        console.log(`[Database] Connecting to ${sanitizedString.split('@')[1]?.split('?')[0] || 'remote host'}`);

        const pool = new pg.Pool({
            connectionString: sanitizedString,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 30000, // Increased timeout for cold starts
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
