import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
    },
    datasource: {
        url: (() => {
            const raw = process.env.supbase_POSTGRES_URL ||
                process.env.supbase_postgres_url ||
                process.env.supbase_POSTGRES_PRISMA_URL ||
                process.env.SUPABASE_DATABASE_URL ||
                process.env.DATABASE_URL ||
                process.env.POSTGRES_PRISMA_URL;
            if (!raw) return "";

            // Heal: Encode special chars in password
            let sanitized = raw;
            const match = raw.match(/^(postgresql:\/\/.*?):(.*)@(.*)$/);
            if (match) {
                const [_, prefix, password, suffix] = match;
                // Double protection for @ and ! (decode first to avoid double encoding)
                const safePassword = encodeURIComponent(decodeURIComponent(password));
                sanitized = `${prefix}:${safePassword}@${suffix}`;
            }

            // HOST SWAP STRATEGY (CLI Version)
            const systemUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
            if (systemUrl && sanitized.includes("db.") && systemUrl.includes("pooler.")) {
                try {
                    // Extract Healing Password from current sanitized string
                    let healingPassword = "";
                    try {
                        const tempUrl = new URL(sanitized);
                        healingPassword = decodeURIComponent(tempUrl.password);
                    } catch (e) {
                        const m = sanitized.match(/^(postgresql:\/\/.*?):(.*)@(.*)$/);
                        if (m) healingPassword = decodeURIComponent(m[2]);
                    }

                    const sysUrlObj = new URL(systemUrl);
                    sysUrlObj.password = encodeURIComponent(healingPassword);

                    console.log(`[PrismaConfig] Swapping broken 'db.' host for working pooler host: ${sysUrlObj.hostname}`);
                    sanitized = sysUrlObj.toString();
                } catch (e) {
                    console.error("[PrismaConfig] Host swap failed");
                }
            }

            // Force override global env for CLI to avoid Prisma 7 circuit breaker
            process.env.DATABASE_URL = sanitized;
            delete process.env.PRISMA_DATABASE_URL;
            delete process.env.POSTGRES_URL;
            delete process.env.POSTGRES_PRISMA_URL;
            delete process.env.POSTGRES_URL_NON_POOLING;

            return sanitized;
        })(),
    },
});
