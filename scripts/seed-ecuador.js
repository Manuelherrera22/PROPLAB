// PROPLAB — Seed ALL Ecuador: properties, market listings, leads, deals, alerts
const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.tbnqakhokrqsrecdzury:Herrera123Musfelcrow@aws-0-us-west-2.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("✅ Connected\n");

    // Get workspace
    const ws = await client.query(`SELECT id FROM public.workspaces WHERE name = 'Guayaquil Premium'`);
    if (ws.rows.length === 0) { console.error("❌ No workspace found"); return; }
    const WS = ws.rows[0].id;

    // Rename workspace to Ecuador-wide
    await client.query(`UPDATE public.workspaces SET name = 'Ecuador Intelligence' WHERE id = $1`, [WS]);
    console.log("📍 Workspace renamed to 'Ecuador Intelligence'\n");

    // ========== PROPERTIES — ALL ECUADOR ==========
    console.log("⏳ Seeding properties across Ecuador...");
    const properties = [
      // QUITO
      ['Casa Moderna - Cumbayá', 345000, 'Cumbayá, Valle de los Chillos', 'Quito', -0.205, -78.439, 4, 3, 320, 1078, 'house', 'available', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600'],
      ['Penthouse Panorámico - La Carolina', 520000, 'Av. Amazonas y República', 'Quito', -0.177, -78.484, 3, 3, 180, 2889, 'penthouse', 'available', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'],
      ['Departamento Ejecutivo - González Suárez', 195000, 'González Suárez N34', 'Quito', -0.198, -78.486, 2, 2, 95, 2053, 'apartment', 'available', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600'],
      ['Terreno Residencial - Tumbaco', 85000, 'Tumbaco, Los Eucaliptos', 'Quito', -0.212, -78.397, 0, 0, 600, 142, 'land', 'available', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'],
      ['Casa de Campo - Valle de los Chillos', 275000, 'Sangolquí, Urb. San Rafael', 'Quito', -0.314, -78.451, 5, 4, 450, 611, 'house', 'reserved', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'],
      ['Suite Moderna - La Floresta', 115000, 'La Floresta, La Ronda', 'Quito', -0.204, -78.488, 1, 1, 55, 2091, 'apartment', 'available', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'],

      // CUENCA
      ['Casa Colonial Restaurada - Centro Histórico', 280000, 'Centro Histórico, Calle Larga', 'Cuenca', -2.897, -79.005, 4, 3, 350, 800, 'house', 'available', 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600'],
      ['Departamento Río Tomebamba', 142000, 'Av. 3 de Noviembre', 'Cuenca', -2.900, -79.008, 2, 2, 90, 1578, 'apartment', 'available', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600'],
      ['Terreno Panorámico - Turi', 65000, 'Turi, Mirador', 'Cuenca', -2.922, -79.007, 0, 0, 800, 81, 'land', 'available', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600'],
      ['Casa Campestre - Yunguilla', 198000, 'Valle de Yunguilla', 'Cuenca', -3.222, -79.278, 3, 2, 280, 707, 'house', 'available', 'https://images.unsplash.com/photo-1510627489930-0c1b0bfb6785?w=600'],

      // MANTA / PLAYA
      ['Villa Frente al Mar - San Lorenzo', 365000, 'San Lorenzo, Primera Línea', 'Manta', -1.035, -80.723, 4, 3.5, 300, 1217, 'house', 'available', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600'],
      ['Depto Playa - Murcielago', 125000, 'Playa Murciélago', 'Manta', -0.947, -80.746, 2, 1, 75, 1667, 'apartment', 'available', 'https://images.unsplash.com/photo-1615571022219-eb45cf7faa36?w=600'],
      ['Terreno Comercial - Tarqui', 95000, 'Tarqui, Av. Principal', 'Manta', -0.970, -80.718, 0, 0, 400, 238, 'land', 'available', 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=600'],

      // AMBATO
      ['Casa Moderna - Ficoa', 175000, 'Ficoa, Av. Los Guaytambos', 'Ambato', -1.241, -78.630, 3, 2.5, 200, 875, 'house', 'available', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'],
      ['Departamento Centro - Ambato', 78000, 'Centro, Bolívar y Lalama', 'Ambato', -1.247, -78.624, 2, 1, 80, 975, 'apartment', 'available', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'],

      // LOJA
      ['Casa Residencial - Loja', 145000, 'Urb. Ciudad Victoria', 'Loja', -3.993, -79.199, 3, 2, 180, 806, 'house', 'available', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600'],
      ['Terreno Valle - Vilcabamba', 55000, 'Valle de Vilcabamba', 'Loja', -4.260, -79.224, 0, 0, 1000, 55, 'land', 'available', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600'],

      // ESMERALDAS
      ['Casa de Playa - Atacames', 135000, 'Atacames, Malecón', 'Esmeraldas', 0.869, -79.838, 3, 2, 150, 900, 'house', 'available', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600'],
      ['Terreno Turístico - Tonsupa', 72000, 'Tonsupa, Frente al Mar', 'Esmeraldas', 0.862, -79.846, 0, 0, 350, 206, 'land', 'available', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'],

      // SANTO DOMINGO
      ['Finca Productiva - Santo Domingo', 110000, 'Km 7 Vía Quevedo', 'Santo Domingo', -0.265, -79.206, 2, 1, 5000, 22, 'land', 'available', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'],
      ['Casa Familiar - Urb. Zaracay', 125000, 'Urb. Zaracay', 'Santo Domingo', -0.252, -79.172, 3, 2, 200, 625, 'house', 'available', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600'],

      // RIOBAMBA
      ['Casa Tradicional - Riobamba', 98000, 'Sector La Estación', 'Riobamba', -1.674, -78.648, 3, 2, 180, 544, 'house', 'available', 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600'],

      // IBARRA
      ['Casa Moderna - Yacucalle', 135000, 'Yacucalle, Ibarra', 'Ibarra', 0.349, -78.123, 3, 2.5, 200, 675, 'house', 'available', 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600'],
      ['Terreno con Vista - Yahuarcocha', 45000, 'Yahuarcocha', 'Ibarra', 0.375, -78.101, 0, 0, 500, 90, 'land', 'available', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600'],

      // MACHALA
      ['Casa Comercial - Machala', 155000, 'Av. 25 de Junio', 'Machala', -3.259, -79.960, 3, 2, 220, 705, 'house', 'available', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600'],

      // SALINAS / SANTA ELENA
      ['Depto Vista Mar - Salinas', 185000, 'Malecón de Salinas', 'Salinas', -2.218, -80.955, 2, 2, 95, 1947, 'apartment', 'available', 'https://images.unsplash.com/photo-1615571022219-eb45cf7faa36?w=600'],
      ['Casa de Playa - Montañita', 210000, 'Montañita, Primera Línea', 'Santa Elena', -1.826, -80.752, 3, 2, 160, 1313, 'house', 'available', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'],

      // BAÑOS
      ['Hostal Boutique - Baños', 240000, 'Centro, Vista al Tungurahua', 'Baños', -1.393, -78.423, 6, 4, 380, 632, 'house', 'available', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600'],
    ];

    for (const p of properties) {
      try {
        await client.query(`
          INSERT INTO public.properties (workspace_id, title, price, location, city, latitude, longitude, bedrooms, bathrooms, area_m2, price_per_m2, property_type, status, image_url, source)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'seed')
          ON CONFLICT DO NOTHING
        `, [WS, ...p]);
      } catch(e) { console.log(`   ⚠️ ${p[0]}: ${e.message}`); }
    }
    console.log(`✅ ${properties.length} properties seeded across Ecuador\n`);

    // ========== MARKET LISTINGS — OPORTUNIDADES ==========
    console.log("⏳ Seeding market listings (competitor/opportunity data)...");
    const marketListings = [
      // Guayaquil
      ['Casa en Urdesa - Por Debajo del Mercado', 'Urdesa Central', 'Guayaquil', 165000, 180, 917, 'house', -2.157, -79.907, 'Properati', true, 82, 45],
      ['Depto Nuevo - Kennedy', 'Kennedy Norte', 'Guayaquil', 92000, 70, 1314, 'apartment', -2.151, -79.912, 'OLX', false, 0, 15],
      ['Terreno 800m² - Vía Daule', 'Vía Daule km 12', 'Guayaquil', 68000, 800, 85, 'land', -2.095, -79.973, 'Plusvalía', true, 75, 60],

      // Quito
      ['Depto Seminuevo - El Batán', 'El Batán, Quito', 'Quito', 135000, 85, 1588, 'apartment', -0.189, -78.480, 'Properati', true, 88, 30],
      ['Casa Esquinera - Tumbaco', 'Tumbaco Centro', 'Quito', 198000, 250, 792, 'house', -0.213, -78.400, 'OLX', false, 0, 20],
      ['Penthouse - Quito Tennis', 'Quito Tennis', 'Quito', 480000, 200, 2400, 'penthouse', -0.173, -78.477, 'Properati', true, 70, 12],
      ['Terreno Plano - Pomasqui', 'Pomasqui', 'Quito', 52000, 400, 130, 'land', -0.064, -78.448, 'Plusvalía', true, 78, 90],

      // Cuenca
      ['Casa Reciclada - El Vergel', 'El Vergel', 'Cuenca', 145000, 200, 725, 'house', -2.905, -79.012, 'Properati', true, 85, 55],
      ['Depto Amoblado - Av. Ordóñez', 'Av. Ordóñez Lasso', 'Cuenca', 88000, 65, 1354, 'apartment', -2.893, -79.018, 'OLX', false, 0, 25],

      // Manta
      ['Casa de Playa - Barbasquillo', 'Barbasquillo', 'Manta', 220000, 200, 1100, 'house', -0.961, -80.754, 'Plusvalía', true, 72, 40],
      ['Terreno Costero - San Mateo', 'San Mateo', 'Manta', 45000, 300, 150, 'land', -1.025, -80.698, 'OLX', true, 80, 75],

      // Ambato
      ['Casa Moderna - Atocha', 'Atocha', 'Ambato', 128000, 180, 711, 'house', -1.252, -78.618, 'Properati', false, 0, 18],

      // Loja
      ['Terreno Agrícola - Malacatos', 'Malacatos', 'Loja', 35000, 2000, 18, 'land', -4.220, -79.268, 'OLX', true, 90, 120],

      // Esmeraldas
      ['Cabaña Ecológica - Mompiche', 'Mompiche', 'Esmeraldas', 95000, 120, 792, 'house', 0.520, -79.890, 'Plusvalía', true, 76, 35],

      // Salinas
      ['Depto Frente al Mar - Chipipe', 'Chipipe, Salinas', 'Salinas', 145000, 80, 1813, 'apartment', -2.220, -80.960, 'Properati', true, 83, 28],

      // Ibarra
      ['Casa Esquinera - Caranqui', 'Caranqui', 'Ibarra', 85000, 170, 500, 'house', 0.330, -78.130, 'OLX', false, 0, 22],

      // Santa Elena
      ['Terreno Turístico - Olón', 'Olón', 'Santa Elena', 62000, 400, 155, 'land', -1.789, -80.756, 'Plusvalía', true, 88, 50],

      // Santo Domingo
      ['Finca Cacao - Vía Quevedo', 'Km 15 Vía Quevedo', 'Santo Domingo', 78000, 10000, 8, 'land', -0.290, -79.250, 'OLX', true, 65, 95],

      // Baños
      ['Local Comercial - Centro Baños', 'Centro', 'Baños', 180000, 150, 1200, 'house', -1.394, -78.421, 'Properati', false, 0, 10],
    ];

    for (const m of marketListings) {
      try {
        await client.query(`
          INSERT INTO public.market_listings (workspace_id, title, location, city, price, area_m2, price_per_m2, property_type, latitude, longitude, source_portal, is_opportunity, opportunity_score, days_on_market)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [WS, ...m]);
      } catch(e) { console.log(`   ⚠️ ${m[0]}: ${e.message}`); }
    }
    console.log(`✅ ${marketListings.length} market listings seeded\n`);

    // ========== MORE LEADS — DIVERSAS CIUDADES ==========
    console.log("⏳ Seeding leads from across Ecuador...");
    const leads = [
      ['Ana Gabriela Pérez', '+593997111222', 'Quito', 'end_user', 78, '$200k-$350k', 'apartment', 'high', 'whatsapp'],
      ['Diego Morales', '+593986222333', 'Cuenca', 'investor', 92, '$100k-$200k', 'house', 'immediate', 'referral'],
      ['Valentina Roldán', '+593975333444', 'Manta', 'end_user', 65, '$100k-$250k', 'house', 'medium', 'chat'],
      ['Andrés Córdova', '+593964444555', 'Ambato', 'investor', 70, '$80k-$150k', 'land', 'low', 'portfolio'],
      ['Cristina Zambrano', '+593953555666', 'Esmeraldas', 'end_user', 82, '$80k-$150k', 'house', 'high', 'whatsapp'],
      ['Fernando Hidalgo', '+593942666777', 'Salinas', 'investor', 88, '$150k-$300k', 'apartment', 'immediate', 'referral'],
      ['Laura Montero', '+593931777888', 'Loja', 'end_user', 55, '$50k-$100k', 'land', 'medium', 'chat'],
      ['Patricio Vega', '+593920888999', 'Ibarra', 'developer', 95, '$200k+', 'house', 'immediate', 'referral'],
    ];

    for (const l of leads) {
      try {
        await client.query(`
          INSERT INTO public.leads (workspace_id, user_name, whatsapp_number, desired_location, buyer_type, lead_score, budget_info, desired_type, urgency, source)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [WS, ...l]);
      } catch(e) { console.log(`   ⚠️ ${l[0]}: ${e.message}`); }
    }
    console.log(`✅ ${leads.length} leads seeded\n`);

    // ========== MORE DEALS ==========
    console.log("⏳ Seeding deals...");
    const newProps = await client.query(`SELECT id, title, price, city FROM public.properties WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 30`, [WS]);
    const newLeads = await client.query(`SELECT id, user_name FROM public.leads WHERE workspace_id = $1 ORDER BY created_at DESC LIMIT 12`, [WS]);

    if (newProps.rows.length >= 6 && newLeads.rows.length >= 6) {
      const deals = [
        [newLeads.rows[0].id, newProps.rows[0].id, `${newLeads.rows[0].user_name} - ${newProps.rows[0].city}`, 'contacted', newProps.rows[0].price, 'Enviar brochure digital'],
        [newLeads.rows[1].id, newProps.rows[2].id, `${newLeads.rows[1].user_name} - ${newProps.rows[2].city}`, 'showing', newProps.rows[2].price, 'Visita programada viernes'],
        [newLeads.rows[2].id, newProps.rows[4].id, `${newLeads.rows[2].user_name} - ${newProps.rows[4].city}`, 'offer', newProps.rows[4].price, 'Evaluar oferta del cliente'],
        [newLeads.rows[3].id, newProps.rows[6].id, `${newLeads.rows[3].user_name} - ${newProps.rows[6].city}`, 'new_lead', newProps.rows[6].price, 'Primer contacto WhatsApp'],
        [newLeads.rows[4].id, newProps.rows[8].id, `${newLeads.rows[4].user_name} - ${newProps.rows[8].city}`, 'negotiation', newProps.rows[8].price, 'Contraoferta en curso'],
        [newLeads.rows[5].id, newProps.rows[10]?.id || newProps.rows[1].id, `${newLeads.rows[5].user_name} - Cerrado`, 'closed_won', 185000, 'Escrituración en proceso'],
      ];

      for (const d of deals) {
        try {
          await client.query(`
            INSERT INTO public.deals (workspace_id, lead_id, property_id, title, stage, deal_value, next_action)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [WS, ...d]);
        } catch(e) { console.log(`   ⚠️ ${d[2]}: ${e.message}`); }
      }
      console.log(`✅ ${deals.length} deals seeded\n`);
    }

    // ========== MORE ALERTS ==========
    console.log("⏳ Seeding smart alerts...");
    const alerts = [
      ['opportunity', '🔥 Oportunidad en Cuenca', 'Casa en El Vergel listada 25% debajo del promedio. Score: 85.'],
      ['market', '📈 Quito: precios subiendo en Cumbayá', 'Precio promedio/m² subió 12% en últimos 60 días en Cumbayá.'],
      ['lead', '🎯 Lead de alto valor: Patricio Vega', 'Developer busca terrenos >$200k en Ibarra. Score: 95. Urgencia: inmediata.'],
      ['opportunity', '⚡ Terreno subvalorado en Loja', 'Terreno en Malacatos a $18/m², promedio zona: $35/m². Score: 90.'],
      ['market', '📊 Manta: temporada alta acercándose', 'Propiedades costeras suben 15-20% en temporada. Oportunidad de listado.'],
      ['lead', '👤 Nuevo lead desde WhatsApp', 'Cristina Zambrano busca casa en Esmeraldas. Presupuesto: $80k-$150k.'],
      ['system', '🔄 Scraping completado: 19 portales', 'Se detectaron 8 oportunidades nuevas en Properati, OLX y Plusvalía.'],
    ];

    for (const a of alerts) {
      try {
        await client.query(`
          INSERT INTO public.smart_alerts (workspace_id, type, title, message) VALUES ($1, $2, $3, $4)
        `, [WS, ...a]);
      } catch(e) { console.log(`   ⚠️ ${a[1]}: ${e.message}`); }
    }
    console.log(`✅ ${alerts.length} alerts seeded\n`);

    // ========== MORE KNOWLEDGE ==========
    console.log("⏳ Seeding knowledge base...");
    const knowledge = [
      ['Zonas Premium Ecuador', 'Quito: Cumbayá $1500-$2500/m², González Suárez $2000-$3000/m². Guayaquil: Samborondón $1200-$1800/m². Cuenca: Centro $700-$1200/m². Manta: Primera línea $1000-$1800/m². Salinas: Chipipe $1500-$2000/m².', 'pricing'],
      ['Marco Legal Ecuador', 'Extranjeros pueden comprar sin restricciones. Impuestos: Alcabala 1%, Plusvalía municipal. Hipotecas: 70% financiamiento max, 20 años. Tasas: 8-10% USD.', 'legal'],
      ['Tendencias 2026', 'Ciudades con mayor apreciación: Cumbayá (+12%), Salinas (+15% temporada), Vilcabamba (+8% eco-turismo). Mercado de alquiler vacacional en crecimiento en costa.', 'market'],
      ['Estrategia de Pricing', 'Regla del 5%: Si propiedad está 5% o más debajo del promedio/m² de zona = oportunidad de arbitraje. Usar days_on_market > 60 como señal de negociación.', 'strategy'],
    ];

    for (const k of knowledge) {
      try {
        await client.query(`
          INSERT INTO public.knowledge_entries (workspace_id, title, content, category) VALUES ($1, $2, $3, $4)
        `, [WS, ...k]);
      } catch(e) { console.log(`   ⚠️ ${k[0]}: ${e.message}`); }
    }
    console.log(`✅ ${knowledge.length} knowledge entries seeded\n`);

    // ========== SUMMARY ==========
    console.log("=" .repeat(50));
    console.log("📊 PROPLAB Ecuador — Database Summary:");
    console.log("=".repeat(50));
    for (const t of ["workspaces", "properties", "leads", "deals", "smart_alerts", "knowledge_entries", "market_listings"]) {
      const res = await client.query(`SELECT COUNT(*) FROM public.${t} WHERE workspace_id = $1`, [WS]);
      console.log(`   ${t}: ${res.rows[0].count} rows`);
    }

    // City breakdown
    console.log("\n📍 Propiedades por ciudad:");
    const cityBreakdown = await client.query(`
      SELECT city, COUNT(*) as count, ROUND(AVG(price)) as avg_price
      FROM public.properties WHERE workspace_id = $1 GROUP BY city ORDER BY count DESC
    `, [WS]);
    for (const row of cityBreakdown.rows) {
      console.log(`   ${row.city}: ${row.count} propiedades (precio prom: $${Number(row.avg_price).toLocaleString()})`);
    }

    console.log(`\n🎉 DONE! Workspace: Ecuador Intelligence (${WS})`);

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

run();
