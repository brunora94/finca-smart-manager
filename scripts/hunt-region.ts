import pg from 'pg';

// Extensive list of Supabase regions
const regions = [
    // AWS
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1",
    "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2", "ap-south-1",
    "sa-east-1", "ca-central-1",
    // Fly.io / Others (less likely for old projects but possible)
    "fly-iad", "fly-cdg", "fly-lhr"
];

const projectRef = "goqyxsyrrcgsknnctdny";
const password = "Br4n02025@!";

async function checkRegion(region: string) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    // Try both user formats
    const users = [`postgres.${projectRef}`, `postgres`];

    for (const user of users) {
        try {
            const pool = new pg.Pool({
                host,
                user,
                password,
                database: 'postgres',
                port: 6543,
                ssl: { rejectUnauthorized: false },
                connectionTimeoutMillis: 2000 // Fast timeout
            });

            // We just want to see if we can perform the handshake
            // "tenant not found" = wrong region
            // "password authentication failed" = RIGHT REGION, wrong password/user (but reachable!)
            // "connected" = JACKPOT
            await pool.connect();
            console.log(`\n🎯 JACKPOT! Connected to ${region} with user ${user}`);
            console.log(`Valid Connection String: postgresql://${user}:${encodeURIComponent(password)}@${host}:6543/postgres?sslmode=require`);
            process.exit(0);
        } catch (err: any) {
            const msg = err.message || "";
            if (msg.includes("password authentication failed")) {
                console.log(`\n🔑 FOUND REGION (Auth Error): ${region}`);
                console.log(`Host is valid: ${host}`);
                console.log(`Error: ${msg}`);
                // This is enough to know the region is correct
                process.exit(0);
            } else if (msg.includes("no pg_hba.conf entry")) {
                console.log(`\n🛡️ FOUND REGION (HBA Error): ${region}`);
                console.log(`Host is valid: ${host}`);
                process.exit(0);
            }
            // console.log(`Checked ${region} (${user}): ${msg}`);
        }
    }
}

async function main() {
    console.log("🌍 Hunting for Supabase Region...");
    // Run in parallel chunks of 5
    const chunkSize = 5;
    for (let i = 0; i < regions.length; i += chunkSize) {
        const chunk = regions.slice(i, i + chunkSize);
        await Promise.all(chunk.map(checkRegion));
    }
    console.log("\n❌ Could not find active region.");
}

main();
