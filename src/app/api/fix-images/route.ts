import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Fix properties that have missing or broken images
// Attempts to fetch a real photo from MercadoLibre for each property

async function fetchRealImage(title: string, city: string): Promise<{ image_url: string; gallery: string[] } | null> {
  try {
    const query = encodeURIComponent(`${title} ${city} ecuador`);
    const url = `https://api.mercadolibre.com/sites/MEC/search?q=${query}&category=MEC1459&limit=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const item = data.results?.[0];
    if (!item) return null;

    // Fetch item details for full gallery
    const detailRes = await fetch(`https://api.mercadolibre.com/items/${item.id}`, {
      headers: { "Accept": "application/json" },
    });
    if (!detailRes.ok) return null;
    const detail = await detailRes.json();

    const pictures: string[] = (detail.pictures || [])
      .map((pic: { secure_url?: string; url?: string }) =>
        (pic.secure_url || pic.url || "").replace("http://", "https://")
      )
      .filter((u: string) => u.length > 0);

    if (pictures.length === 0) {
      // Fallback to thumbnail
      const thumb = (item.thumbnail || "").replace("http://", "https://").replace("-I.jpg", "-O.jpg");
      if (!thumb) return null;
      return { image_url: thumb, gallery: [thumb] };
    }

    return { image_url: pictures[0], gallery: pictures };
  } catch {
    return null;
  }
}

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

  // 2. Fix images — find properties with missing/broken/Unsplash images
  const { data: props } = await supabase
    .from("properties")
    .select("id, title, city, image_url, gallery")
    .order("created_at");

  let fixedImages = 0;
  if (props) {
    for (const prop of props) {
      const hasRealImage = prop.image_url &&
        !prop.image_url.includes("unsplash.com") &&
        prop.image_url.startsWith("http");
      const hasGallery = prop.gallery && prop.gallery.length > 0;

      // Skip if already has real image and gallery
      if (hasRealImage && hasGallery) continue;

      // Try to fetch real image from MercadoLibre
      const realImage = await fetchRealImage(prop.title, prop.city || "Ecuador");
      if (realImage) {
        const updateData: Record<string, unknown> = {};
        if (!hasRealImage) updateData.image_url = realImage.image_url;
        if (!hasGallery) updateData.gallery = realImage.gallery;

        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase.from("properties").update(updateData).eq("id", prop.id);
          if (!error) {
            fixedImages++;
            log.push(`📸 ${prop.title}: ${realImage.gallery.length} fotos reales agregadas`);
          }
        }
      }

      // Polite delay
      await new Promise(r => setTimeout(r, 400));
    }
  }

  log.push(`\n📊 Resumen: ${fixedImages} propiedades actualizadas con fotos reales`);

  // 3. Summary
  const { data: all } = await supabase.from("properties").select("title, property_type, city, image_url").order("city");

  return NextResponse.json({ ok: true, log, properties: all?.length ?? 0, fixed_images: fixedImages, data: all });
}
