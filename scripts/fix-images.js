// Fix property images — replace hotel-looking photos with realistic residential ones
const { Client } = require("pg");

const DATABASE_URL =
  "postgresql://postgres.tbnqakhokrqsrecdzury:Herrera123Musfelcrow@aws-0-us-west-2.pooler.supabase.com:5432/postgres";

// Realistic residential images by type
const houseImages = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600",  // Simple family house
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=600",  // Normal suburban house
  "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=600",  // Modest home with yard
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600",  // Regular 2-story home
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600",  // Simple house facade
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=600",  // Normal residential
  "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=600",  // Colonial-style house
  "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600",  // Latin american home
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600",  // Simple white house
  "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=600",  // Residential street
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=600",  // Two-story residential
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600",  // Neighborhood house
];

const apartmentImages = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",  // Apartment building
  "https://images.unsplash.com/photo-1560448075-bb485b067938?w=600",  // Condo building exterior
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600",  // Apartment complex
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600",  // Apartment interior living
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",  // Living room interior
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600",  // Apartment living room
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600",  // Kitchen apartment
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600",  // Modern apartment
];

const penthouseImages = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",  // High-rise view
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600",  // Terrace apartment
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600",  // Modern interior
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600",  // Apartment with view
];

const landImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",  // Open green field
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600",  // Land with mountains
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",  // Valley land
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600",  // Rural landscape
  "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=600",  // River valley
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600",  // Green terrain
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",  // Flat land
  "https://images.unsplash.com/photo-1473864803180-6173b0c6ab4f?w=600",  // Coastal land
];

async function run() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("✅ Connected\n");

    // Get all properties
    const { rows: props } = await client.query(`SELECT id, title, property_type FROM public.properties ORDER BY created_at`);
    console.log(`📸 Updating ${props.length} property images...\n`);

    let houseIdx = 0, aptIdx = 0, phIdx = 0, landIdx = 0;

    for (const prop of props) {
      let img;
      switch (prop.property_type) {
        case "house":
          img = houseImages[houseIdx % houseImages.length];
          houseIdx++;
          break;
        case "apartment":
          img = apartmentImages[aptIdx % apartmentImages.length];
          aptIdx++;
          break;
        case "penthouse":
          img = penthouseImages[phIdx % penthouseImages.length];
          phIdx++;
          break;
        case "land":
          img = landImages[landIdx % landImages.length];
          landIdx++;
          break;
        default:
          img = houseImages[houseIdx % houseImages.length];
          houseIdx++;
      }

      await client.query(`UPDATE public.properties SET image_url = $1 WHERE id = $2`, [img, prop.id]);
      console.log(`   ✅ ${prop.property_type.padEnd(10)} ${prop.title} → updated`);
    }

    console.log(`\n🎉 Done! ${props.length} images updated.`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
  }
}

run();
