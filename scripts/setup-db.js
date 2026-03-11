// Complete PROPLAB migration & seed
const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.tbnqakhokrqsrecdzury:Herrera123Musfelcrow@aws-0-us-west-2.pooler.supabase.com:5432/postgres";

async function addColumnSafe(client, table, colDef) {
  const colName = colDef.split(" ")[0];
  try {
    await client.query(`ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS ${colDef}`);
    return true;
  } catch(e) {
    if (!e.message.includes("already exists")) console.log(`   ⚠️  ${table}.${colName}: ${e.message}`);
    return false;
  }
}

async function run() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("✅ Connected\n");

    // === MIGRATE LEADS TABLE ===
    console.log("⏳ Migrating leads table...");
    const leadCols = [
      "workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE",
      "email TEXT",
      "budget_min NUMERIC",
      "budget_max NUMERIC",
      "desired_location TEXT",
      "desired_type TEXT",
      "buyer_type TEXT DEFAULT 'unknown'",
      "lead_score INTEGER DEFAULT 0",
      "urgency TEXT DEFAULT 'medium'",
      "source TEXT DEFAULT 'chat'",
      "updated_at TIMESTAMPTZ DEFAULT NOW()",
    ];
    for (const col of leadCols) {
      const added = await addColumnSafe(client, "leads", col);
      if (added) console.log(`   ✅ ${col.split(" ")[0]}`);
    }

    // === MIGRATE SAVED_SEARCHES TABLE ===
    console.log("\n⏳ Migrating saved_searches table...");
    const ssCols = [
      "workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE",
      "lead_id UUID REFERENCES public.leads(id)",
    ];
    for (const col of ssCols) {
      const added = await addColumnSafe(client, "saved_searches", col);
      if (added) console.log(`   ✅ ${col.split(" ")[0]}`);
    }

    // === GET/CREATE WORKSPACE ===
    const ws = await client.query(`SELECT id FROM public.workspaces WHERE name = 'Guayaquil Premium'`);
    const workspaceId = ws.rows[0].id;
    console.log(`\n📍 Workspace: ${workspaceId}`);

    // === SEED PROPERTIES ===
    const propCount = await client.query(`SELECT COUNT(*) FROM public.properties WHERE workspace_id = $1`, [workspaceId]);
    if (parseInt(propCount.rows[0].count) === 0) {
      // Check if there are old unattached properties and attach them
      const oldProps = await client.query(`SELECT COUNT(*) FROM public.properties WHERE workspace_id IS NULL`);
      if (parseInt(oldProps.rows[0].count) > 0) {
        await client.query(`UPDATE public.properties SET workspace_id = $1 WHERE workspace_id IS NULL`, [workspaceId]);
        console.log(`✅ Attached ${oldProps.rows[0].count} existing properties to workspace`);
      }
      
      // Add PROPLAB seed properties
      const properties = [
        ['Villa Frente al Mar - Capaes', 285000, 'Capaes, Ruta del Sol', 'Guayaquil', -1.95, -80.72, 4, 3.5, 280, 1018, 'house', 'available', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600'],
        ['Depto Vista Río - Samborondón', 165000, 'Samborondón, Ciudad Celeste', 'Samborondón', -2.13, -79.88, 3, 2, 120, 1375, 'apartment', 'available', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'],
        ['Terreno Premium - Vía a la Costa', 120000, 'Vía a la Costa km 14', 'Guayaquil', -2.20, -80.02, 0, 0, 500, 240, 'land', 'available', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'],
        ['Penthouse Luxury - Puerto Santa Ana', 420000, 'Puerto Santa Ana, Malecón', 'Guayaquil', -2.18, -79.88, 3, 3, 200, 2100, 'penthouse', 'reserved', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'],
        ['Casa Familiar - Ceibos', 195000, 'Los Ceibos', 'Guayaquil', -2.17, -79.95, 4, 3, 240, 813, 'house', 'available', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'],
        ['Suite Ejecutiva - Kennedy Norte', 89000, 'Kennedy Norte', 'Guayaquil', -2.15, -79.91, 1, 1, 65, 1369, 'apartment', 'sold', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'],
      ];
      for (const p of properties) {
        await client.query(`
          INSERT INTO public.properties (workspace_id, title, price, location, city, latitude, longitude, bedrooms, bathrooms, area_m2, price_per_m2, property_type, status, image_url, source)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'seed')
        `, [workspaceId, ...p]);
      }
      console.log(`✅ 6 properties seeded`);
    } else {
      console.log(`⏭️  Properties: ${propCount.rows[0].count} already`);
    }

    // === SEED LEADS ===
    const leadCount = await client.query(`SELECT COUNT(*) FROM public.leads WHERE workspace_id = $1`, [workspaceId]);
    if (parseInt(leadCount.rows[0].count) === 0) {
      // Attach existing leads
      const oldLeads = await client.query(`SELECT COUNT(*) FROM public.leads WHERE workspace_id IS NULL`);
      if (parseInt(oldLeads.rows[0].count) > 0) {
        await client.query(`UPDATE public.leads SET workspace_id = $1 WHERE workspace_id IS NULL`, [workspaceId]);
        console.log(`✅ Attached ${oldLeads.rows[0].count} existing leads to workspace`);
      }

      await client.query(`
        INSERT INTO public.leads (workspace_id, user_name, whatsapp_number, desired_location, buyer_type, lead_score, budget_info, source) VALUES
        ($1, 'Carlos Mendoza', '+593987654321', 'Samborondón', 'investor', 85, '$150k-$300k', 'chat'),
        ($1, 'María Fernanda López', '+593991234567', 'Vía a la Costa', 'end_user', 72, '$100k-$200k', 'whatsapp'),
        ($1, 'Roberto Aguilar', '+593998765432', 'Centro', 'developer', 90, '$500k+', 'referral')
      `, [workspaceId]);
      console.log(`✅ 3 leads seeded`);
    } else {
      console.log(`⏭️  Leads: ${leadCount.rows[0].count} already`);
    }

    // === SEED DEALS ===
    const dealCount = await client.query(`SELECT COUNT(*) FROM public.deals WHERE workspace_id = $1`, [workspaceId]);
    if (parseInt(dealCount.rows[0].count) === 0) {
      const pIds = await client.query(`SELECT id FROM public.properties WHERE workspace_id = $1 ORDER BY created_at LIMIT 6`, [workspaceId]);
      const lIds = await client.query(`SELECT id FROM public.leads WHERE workspace_id = $1 ORDER BY created_at LIMIT 3`, [workspaceId]);
      
      if (pIds.rows.length >= 3 && lIds.rows.length >= 3) {
        await client.query(`
          INSERT INTO public.deals (workspace_id, lead_id, property_id, title, stage, deal_value, next_action) VALUES
          ($1, $2, $3, 'Mendoza - Villa Capaes', 'showing', 285000, 'Agendar segunda visita'),
          ($1, $4, $5, 'López - Terreno Vía Costa', 'offer', 120000, 'Revisar contraoferta'),
          ($1, $6, $7, 'Aguilar - Penthouse PSA', 'negotiation', 420000, 'Enviar contrato final')
        `, [workspaceId, lIds.rows[0].id, pIds.rows[0].id, lIds.rows[1].id, pIds.rows[2].id, lIds.rows[2].id, pIds.rows[3]?.id || pIds.rows[0].id]);
        console.log(`✅ 3 deals seeded`);
      }
    } else {
      console.log(`⏭️  Deals: ${dealCount.rows[0].count} already`);
    }

    // === SEED ALERTS ===
    const alertCount = await client.query(`SELECT COUNT(*) FROM public.smart_alerts WHERE workspace_id = $1`, [workspaceId]);
    if (parseInt(alertCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO public.smart_alerts (workspace_id, type, title, message) VALUES
        ($1, 'opportunity', '🔥 Propiedad subvalorada detectada', 'Casa en Samborondón listada 25% debajo del promedio de zona.'),
        ($1, 'lead', '👤 Nuevo lead de alto valor', 'Roberto Aguilar (developer) busca terrenos >$500k. Score: 90.'),
        ($1, 'market', '📊 Precios subiendo en Ceibos', 'Precio promedio/m² subió 8% en los últimos 30 días en Los Ceibos.')
      `, [workspaceId]);
      console.log(`✅ 3 alerts seeded`);
    } else {
      console.log(`⏭️  Alerts: ${alertCount.rows[0].count} already`);
    }

    // === SEED KNOWLEDGE ===
    const keCount = await client.query(`SELECT COUNT(*) FROM public.knowledge_entries WHERE workspace_id = $1`, [workspaceId]);
    if (parseInt(keCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO public.knowledge_entries (workspace_id, title, content, category) VALUES
        ($1, 'Guía de Zonas Premium', 'Samborondón: $1200-$1800/m². Vía a la Costa: $800-$1400/m². Ceibos: $900-$1300/m².', 'pricing'),
        ($1, 'Argumentos de Venta', 'Ecuador: mejores tasas de retorno en LATAM. Sin restricciones para extranjeros.', 'general'),
        ($1, 'Proceso de Compra', 'Promesa → Due diligence (15d) → Escrituración → Registro. Alcabala 1%.', 'legal')
      `, [workspaceId]);
      console.log(`✅ 3 knowledge entries seeded`);
    } else {
      console.log(`⏭️  Knowledge: ${keCount.rows[0].count} already`);
    }

    // === FINAL SUMMARY ===
    console.log("\n" + "=".repeat(40));
    console.log("📊 PROPLAB Database Summary:");
    console.log("=".repeat(40));
    for (const t of ["workspaces", "properties", "leads", "deals", "smart_alerts", "knowledge_entries", "market_listings"]) {
      const res = await client.query(`SELECT COUNT(*) FROM public.${t}`);
      console.log(`   ${t}: ${res.rows[0].count} rows`);
    }
    console.log(`\n🎉 DONE! Workspace ID: ${workspaceId}`);

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

run();
