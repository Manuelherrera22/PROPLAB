import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

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
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600",
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

const titleFixes: Record<string, { title: string; type?: string }> = {
  "Hostal Boutique - Baños": { title: "Casa Residencial con Vista - Baños", type: "house" },
  "Modern House with Pool": { title: "Casa Moderna con Piscina" },
  "Cozy Apartment": { title: "Departamento Acogedor" },
  "Luxury Villa": { title: "Villa Residencial" },
  "Spacious Family Home": { title: "Casa Familiar Amplia" },
  "Penthouse Suite": { title: "Suite Ejecutiva" },
  "Affordable Starter Home": { title: "Casa Económica" },
};

export async function GET() {
  const supabase = createServerClient();
  const log: string[] = [];

  // 1. Fix titles
  for (const [oldTitle, fix] of Object.entries(titleFixes)) {
    const update: Record<string, string> = { title: fix.title };
    if (fix.type) update.property_type = fix.type;
    const { error } = await supabase
      .from("properties")
      .update(update)
      .eq("title", oldTitle);
    if (!error) log.push(`✅ "${oldTitle}" → "${fix.title}"`);
    else log.push(`⚠️ ${oldTitle}: ${error.message}`);
  }

  // Also fix any remaining with ilike
  await supabase.from("properties").update({ title: "Casa Residencial con Vista - Baños", property_type: "house" }).ilike("title", "%hostal%");
  await supabase.from("properties").update({ title: "Casa Residencial con Vista - Baños", property_type: "house" }).ilike("title", "%hotel%");

  // 2. Fix images by type
  const imgMap: Record<string, string[]> = { house: houseImgs, apartment: aptImgs, penthouse: phImgs, land: landImgs };

  for (const [type, imgs] of Object.entries(imgMap)) {
    const { data: props } = await supabase
      .from("properties")
      .select("id")
      .eq("property_type", type)
      .order("created_at");

    if (props) {
      for (let i = 0; i < props.length; i++) {
        await supabase
          .from("properties")
          .update({ image_url: imgs[i % imgs.length] })
          .eq("id", props[i].id);
      }
      log.push(`📸 ${type}: ${props.length} images updated`);
    }
  }

  // 3. Summary
  const { data: all } = await supabase.from("properties").select("title, property_type, city").order("city");

  return NextResponse.json({ ok: true, log, properties: all?.length ?? 0, data: all });
}
