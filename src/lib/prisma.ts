import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// -----------------------------------------------------------------------------
// RUNTIME REGION RACE
// -----------------------------------------------------------------------------
// Since we don't know the region and DNS is broken, we must race to find it.
// This function tests a list of regions in parallel and returns the first winner.
async function findWorkingRegion(originalHost: string, projectRef: string, password: string): Promise<string> {
    const candidates = [
        "aws-0-eu-west-1.pooler.supabase.com", // Ireland (Most common EU)
        "aws-0-eu-central-1.pooler.supabase.com", // Frankfurt
        "aws-0-eu-west-2.pooler.supabase.com", // London
        "aws-0-eu-west-3.pooler.supabase.com", // Paris
        "aws-0-us-east-1.pooler.supabase.com", // N. Virginia
        "aws-0-us-west-1.pooler.supabase.com", // N. California
        "aws-0-sa-east-1.pooler.supabase.com", // São Paulo
    ];

    console.log(`[Database] 🏁 Racing ${candidates.length} regions to find project '${projectRef}'...`);

    // Race function: Tries to connect. 
    // Resolves if connected OR "password auth failed" (means region is correct).
    // Rejects if "Tenant not found" (wrong region) or timeout.
    const checkRegion = (host: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const user = `postgres.${projectRef}`;
            const client = new pg.Client({
                host,
                user,
                password,
                database: 'postgres',
                port: 6543,
                ssl: { rejectUnauthorized: false },
                connectionTimeoutMillis: 3000 // Fast timeout (3s)
            });

            client.connect((err) => {
                client.end().catch(() => { }); // cleanup

                if (!err) {
                    console.log(`[Database] ✅ WINNER: ${host} (Connected)`);
                    resolve(host);
                    return;
                }

                const msg = err.message || "";
                // If we get auth error, IT MEANS THE REGION IS CORRECT (we reached the tenant).
                // "Tenant or user not found" means wrong region.
                if (msg.includes("password authentication failed")) {
                    console.log(`[Database] ✅ WINNER: ${host} (Auth verify)`);
                    resolve(host);
                }
                else if (msg.includes("Tenant or user not found")) {
                    // Wrong region
                    reject(new Error(`Wrong region: ${host}`));
                }
                else {
                    // Other error (network?), treat as fail but log
                    // console.error(`[Database] Error ${host}: ${msg}`);
                    reject(err);
                }
            });
        });
    };

    try {
        // Promise.any resolves as soon as ONE promise resolves.
        // It ignores rejections unless ALL reject.
        const winner = await Promise.any(candidates.map(checkRegion));
        return winner;
    } catch (e) {
        console.error("[Database] ❌ All regions failed to identify tenant.");
        // Default fallback if race fails entirely
        return "aws-0-eu-west-1.pooler.supabase.com";
    }
}

const prismaClientSingleton = () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    try {
        const connectionString = (
            process.env.supbase_POSTGRES_URL ||
            process.env.supbase_postgres_url ||
            process.env.supbase_POSTGRES_PRISMA_URL ||
            process.env.SUPABASE_DATABASE_URL ||
            process.env.SUPABASE_URL || // Sometimes this is just the https URL, handle carefully?
            process.env.DATABASE_URL ||
            process.env.POSTGRES_PRISMA_URL ||
            process.env.POSTGRES_URL ||
            process.env.POSTGRES_URL_NON_POOLING
        )?.trim().replace(/^["']|["']$/g, "");

        if (!connectionString) throw new Error("No URL found");

        let sanitizedString = connectionString;
        let manualPassword = "";
        let projectRef = "";

        try {
            // Basic URL parsing to extract pass and ref
            // Handle truncated URLs or weird formats if needed
            let tempUrl: URL;
            try {
                tempUrl = new URL(sanitizedString);
            } catch (e) {
                // If it fails (e.g. missing protocol), try adding postgresql://
                if (!sanitizedString.startsWith("postgresql://")) {
                    tempUrl = new URL("postgresql://" + sanitizedString);
                } else {
                    throw e;
                }
            }

            // Heal Password
            if (tempUrl.password) {
                manualPassword = decodeURIComponent(tempUrl.password);
                tempUrl.password = encodeURIComponent(manualPassword);
                sanitizedString = tempUrl.toString();
            }

            // Extract Project Ref
            // from db.abcdefg.supabase.co
            const matchRef = tempUrl.hostname.match(/db\.(.*?)\.supabase\.co/);
            if (matchRef) {
                projectRef = matchRef[1];
            } else if (tempUrl.hostname.includes("pooler.supabase.com")) {
                // Maybe it's already a pooler URL?
                // But we don't rely on it if it's failing.
            }

            // Extract Ref from user if hostname fails?
            if (!projectRef && tempUrl.username.includes(".")) {
                projectRef = tempUrl.username.split(".")[1];
            }

            // Hardcode ref if missing (we know it from logs)
            if (!projectRef) projectRef = "goqyxsyrrcgsknnctdny";

        } catch (e) {
            console.error("URL Parse error", e);
        }

        // ---------------------------------------------------------------------
        // ASYNC CLIENT FACTORY WRAPPER
        // ---------------------------------------------------------------------
        // Since we need to 'await' the region race, but `prismaClientSingleton` is sync,
        // we will create a Proxy that manages an internal PROMISE of the real client.
        // All calls to prisma.model.action() will wait for this promise.

        let clientPromise: Promise<PrismaClient>;

        const initClient = async () => {
            console.log("[Database] Initializing connection logic...");

            // Check if we need to race
            // If manual string is "db." (broken), we race.
            if (sanitizedString.includes("db.goqyxsyrrcgsknnctdny.supabase.co") ||
                sanitizedString.includes("db.supabase.co")) {

                console.log("[Database] ⚠️ Broken Host Detected. Starting Region Race...");
                const workingHost = await findWorkingRegion("broken", projectRef, manualPassword);

                const url = new URL(sanitizedString);
                url.hostname = workingHost;
                url.port = "6543";
                if (url.username === "postgres") url.username = `postgres.${projectRef}`;
                sanitizedString = url.toString();

                console.log(`[Database] 🚀 CONNECTING TO WINNER: ${workingHost}`);
            } else {
                console.log(`[Database] Using configured host: ${sanitizedString.split('@')[1]}`);
            }

            process.env.DATABASE_URL = sanitizedString;
            // Cleanup
            delete process.env.PRISMA_DATABASE_URL;
            delete process.env.POSTGRES_URL;
            delete process.env.POSTGRES_PRISMA_URL;

            const pool = new pg.Pool({
                connectionString: sanitizedString,
                ssl: { rejectUnauthorized: false },
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000,
            });
            const adapter = new PrismaPg(pool);
            return new PrismaClient({ adapter });
        };

        clientPromise = initClient();

        // RETURN PROXY
        return new Proxy({} as PrismaClient, {
            get: (target, prop) => {
                // If accessing $connect, $disconnect, etc.
                if (prop === 'then') return Promise.resolve(clientPromise).then.bind(clientPromise);

                return new Proxy(() => { }, {
                    apply: async (funcTarget, thisArg, args) => {
                        const realClient = await clientPromise;
                        // @ts-ignore
                        const realFunc = realClient[prop];
                        if (typeof realFunc === 'function') {
                            return realFunc.apply(realClient, args);
                        }
                        return realFunc;
                    },
                    get: (subTarget, subProp) => {
                        // Handle prisma.model.findMany()
                        return async (...args: any[]) => {
                            const realClient = await clientPromise;
                            // @ts-ignore
                            const model = realClient[prop]; // e.g. prisma.user
                            // @ts-ignore
                            return model[subProp](...args);
                        }
                    }
                });
            }
        });

    } catch (e: any) {
        console.error("FATAL: Init failed", e);
        return new PrismaClient(); // Fallback to crash safely?
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
