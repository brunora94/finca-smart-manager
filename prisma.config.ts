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
            const match = raw.match(/^(postgresql:\/\/.*?):(.*)@(.*)$/);
            if (match) {
                const [_, prefix, password, suffix] = match;
                if (!password.includes('%')) { // Only encode if not already encoded
                    return `${prefix}:${encodeURIComponent(password)}@${suffix}`;
                }
            }
            return raw;
        })(),
    },
});
