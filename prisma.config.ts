import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
    },
    export default defineConfig({
        schema: "prisma/schema.prisma",
        migrations: {
            path: "prisma/migrations",
            seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
        },
        datasource: {
            // Works for Vercel Postgres, Supabase, Neon, etc.
            url: process.env.DATABASE_URL,
            directUrl: process.env.DIRECT_URL,
        },
    });
