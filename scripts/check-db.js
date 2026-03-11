// Check all table schemas
const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.tbnqakhokrqsrecdzury:Herrera123Musfelcrow@aws-0-us-west-2.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    
    const tables = ["workspaces", "properties", "leads", "deals", "smart_alerts", "market_listings", "knowledge_entries", "saved_searches"];
    for (const table of tables) {
      const cols = await client.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      console.log(`\n${table}: ${cols.rows.map(r => r.column_name).join(', ')}`);
    }
  } catch (err) {
    console.error("❌", err.message);
  } finally {
    await client.end();
  }
}
run();
