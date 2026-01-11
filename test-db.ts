import pg from 'pg';

const connectionString = "postgresql://postgres:Br4n02025%40%21@db.goqyxsyrrcgsknnctdny.supabase.co:5432/postgres?sslmode=no-verify&connect_timeout=60";

async function test() {
    console.log("Testing connection to Supabase...");
    const pool = new pg.Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log("SUCCESS: Connected to database!");
        const res = await client.query('SELECT NOW()');
        console.log("Query result:", res.rows[0]);
        client.release();
    } catch (err: any) {
        console.error("FAILURE: Could not connect to database.");
        console.error("Error details:", err.message);

        // Try to see if resolving goqyxsyrrcgsknnctdny.supabase.co helps
        console.log("\nTrying alternative host (no 'db.' prefix)...");
        const altString = connectionString.replace('db.goqyxsyrrcgsknnctdny', 'goqyxsyrrcgsknnctdny');
        const altPool = new pg.Pool({ connectionString: altString, ssl: { rejectUnauthorized: false } });
        try {
            const client = await altPool.connect();
            console.log("SUCCESS: Connected using alternative host!");
            client.release();
        } catch (e: any) {
            console.error("Alternative host also failed:", e.message);
        }
    } finally {
        await pool.end();
        process.exit();
    }
}

test();
