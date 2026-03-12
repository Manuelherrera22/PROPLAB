// Fix ALL property names and images to look like REAL residential Ecuador properties
const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.tbnqakhokrqsrecdzury:Herrera123Musfelcrow@aws-0-us-west-2.pooler.supabase.com:5432/postgres";

async function run() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("✅ Connected\n");

  // 1. Fix Hostal Boutique → Casa residencial
  console.log("🔧 Renaming hotel/hostal titles...");
  await client.query(`UPDATE public.properties SET title = 'Casa Residencial con Vista - Baños', property_type = 'house' WHERE title LIKE '%Hostal%'`);
  await client.query(`UPDATE public.properties SET title = 'Casa Moderna con Piscina' WHERE title = 'Modern House with Pool'`);
  await client.query(`UPDATE public.properties SET title = 'Departamento Acogedor' WHERE title = 'Cozy Apartment'`);
  await client.query(`UPDATE public.properties SET title = 'Villa Residencial' WHERE title = 'Luxury Villa'`);
  await client.query(`UPDATE public.properties SET title = 'Casa Familiar Amplia' WHERE title = 'Spacious Family Home'`);
  await client.query(`UPDATE public.properties SET title = 'Suite Ejecutiva' WHERE title = 'Penthouse Suite'`);
  await client.query(`UPDATE public.properties SET title = 'Casa Económica - Primer Hogar' WHERE title = 'Affordable Starter Home'`);
  console.log("✅ Titles fixed\n");

  // 2. Update ALL images by type with truly residential photos
  console.log("📸 Updating images by property type...\n");

  const houseImgs = [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600",
    "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600",
    "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=600",
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600",
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600",
    "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?w=600",
    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=600",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600",
  ];

  const aptImgs = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600",
    "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600",
    "https://images.unsplash.com/photo-1560448075-bb485b067938?w=600",
  ];

  const phImgs = [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600",
  ];

  const landImgs = [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600",
    "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=600",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600",
  ];

  // Update each property type
  const typeImgMap = { house: houseImgs, apartment: aptImgs, penthouse: phImgs, land: landImgs };
  for (const type of Object.keys(typeImgMap)) {
    const imgs = typeImgMap[type];
    const { rows } = await client.query("SELECT id FROM public.properties WHERE property_type = $1 ORDER BY created_at", [type]);
    let idx = 0;
    for (const row of rows) {
      await client.query("UPDATE public.properties SET image_url = $1 WHERE id = $2", [imgs[idx % imgs.length], row.id]);
      idx++;
    }
    console.log(`   ✅ ${type}: ${rows.length} images updated`);
  }

  // Final check
  const { rows: all } = await client.query("SELECT title, property_type, city FROM public.properties ORDER BY city, title");
  console.log(`\n📋 ${all.length} properties total:`);
  for (const p of all) {
    console.log(`   ${p.city.padEnd(15)} ${p.property_type.padEnd(10)} ${p.title}`);
  }

  console.log("\n🎉 Done!");
  await client.end();
}

run();
