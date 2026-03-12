import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Scrape real property listings from Ecuador portals
// Extracts FULL photo galleries from MercadoLibre

interface ScrapedProperty {
  title: string;
  price: number;
  location: string;
  city: string;
  area_m2: number;
  price_per_m2: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  image_url: string;
  gallery: string[];
  source: string;
  source_url: string;
  latitude: number;
  longitude: number;
  description: string;
}

// City coordinates for geo-reference
const cityCoords: Record<string, { lat: number; lng: number }> = {
  Quito: { lat: -0.18, lng: -78.48 },
  Guayaquil: { lat: -2.17, lng: -79.92 },
  Cuenca: { lat: -2.90, lng: -79.01 },
  Manta: { lat: -0.95, lng: -80.73 },
  Ambato: { lat: -1.25, lng: -78.62 },
  Loja: { lat: -3.99, lng: -79.20 },
  Esmeraldas: { lat: 0.87, lng: -79.84 },
  Salinas: { lat: -2.22, lng: -80.96 },
  Ibarra: { lat: 0.35, lng: -78.12 },
  Machala: { lat: -3.26, lng: -79.96 },
  "Santo Domingo": { lat: -0.25, lng: -79.17 },
  Riobamba: { lat: -1.67, lng: -78.65 },
  Baños: { lat: -1.39, lng: -78.42 },
  Portoviejo: { lat: -1.05, lng: -80.45 },
  Durán: { lat: -2.17, lng: -79.83 },
  Samborondón: { lat: -2.13, lng: -79.88 },
};

// Fetch full item details including all photos from MercadoLibre
async function fetchItemDetails(itemId: string): Promise<{
  pictures: string[];
  description: string;
  permalink: string;
} | null> {
  try {
    const res = await fetch(`https://api.mercadolibre.com/items/${itemId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });
    if (!res.ok) return null;
    const item = await res.json();

    // Extract all picture URLs in high resolution
    const pictures: string[] = (item.pictures || [])
      .map((pic: { secure_url?: string; url?: string }) =>
        (pic.secure_url || pic.url || "").replace("http://", "https://")
      )
      .filter((url: string) => url.length > 0);

    return {
      pictures,
      description: item.descriptions?.[0]?.plain_text || "",
      permalink: item.permalink || "",
    };
  } catch (e) {
    console.log(`[Scraper] Item details error for ${itemId}:`, (e as Error).message);
    return null;
  }
}

// Source 1: MercadoLibre Ecuador Real Estate API — with FULL gallery
async function scrapeMercadoLibre(city: string, log: string[]): Promise<ScrapedProperty[]> {
  const results: ScrapedProperty[] = [];
  try {
    const searchQuery = encodeURIComponent(`casa ${city} ecuador`);
    const url = `https://api.mercadolibre.com/sites/MEC/search?q=${searchQuery}&category=MEC1459&limit=10`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      log.push(`⚠️ MercadoLibre ${city}: HTTP ${res.status}`);
      return results;
    }

    const data = await res.json();
    const items = data.results || [];

    // Fetch details for each item (batch of 5 at a time)
    for (let batch = 0; batch < items.length; batch += 5) {
      const chunk = items.slice(batch, batch + 5);
      const detailsPromises = chunk.map((item: { id: string }) => fetchItemDetails(item.id));
      const details = await Promise.all(detailsPromises);

      for (let i = 0; i < chunk.length; i++) {
        const item = chunk[i];
        const detail = details[i];
        const price = item.price || 0;
        if (price <= 0) continue;

        // Extract attributes
        const attrs = item.attributes || [];
        const getAttr = (id: string) =>
          attrs.find((a: { id: string; value_name: string }) => a.id === id)?.value_name;

        const area = parseInt(getAttr("TOTAL_AREA") || getAttr("COVERED_AREA") || "0") || 0;
        const beds = parseInt(getAttr("BEDROOMS") || "0") || 0;
        const baths = parseInt(getAttr("BATHROOMS") || "0") || 0;
        const propType = getAttr("PROPERTY_TYPE") || "";

        let type = "house";
        if (propType.toLowerCase().includes("departamento") || propType.toLowerCase().includes("apart")) type = "apartment";
        else if (propType.toLowerCase().includes("terreno") || propType.toLowerCase().includes("lote")) type = "land";
        else if (propType.toLowerCase().includes("penthouse")) type = "penthouse";

        const coords = cityCoords[city] || { lat: -1.83, lng: -78.18 };

        // Use full gallery from item details, fallback to thumbnail
        let gallery: string[] = [];
        let mainImage = "";
        let permalink = item.permalink || "";
        let description = "";

        if (detail && detail.pictures.length > 0) {
          gallery = detail.pictures;
          mainImage = gallery[0];
          permalink = detail.permalink || permalink;
          description = detail.description || "";
        } else {
          // Fallback: use thumbnail in highest resolution
          const thumb = (item.thumbnail || "").replace("http://", "https://");
          if (thumb) {
            mainImage = thumb.replace("-I.jpg", "-O.jpg");
            gallery = [mainImage];
          }
        }

        if (!mainImage) continue; // Skip properties without any photo

        results.push({
          title: item.title || `Propiedad en ${city}`,
          price,
          location: item.address?.city_name || item.location?.city?.name || city,
          city,
          area_m2: area || Math.round(price / 800),
          price_per_m2: area > 0 ? Math.round(price / area) : 0,
          bedrooms: beds,
          bathrooms: baths,
          property_type: type,
          image_url: mainImage,
          gallery,
          source: "MercadoLibre",
          source_url: permalink,
          description: description.substring(0, 500),
          latitude: coords.lat + (Math.random() * 0.04 - 0.02),
          longitude: coords.lng + (Math.random() * 0.04 - 0.02),
        });
      }

      // Polite delay between batch detail requests
      if (batch + 5 < items.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    log.push(`✅ ${city}: ${results.length} propiedades con galería de fotos reales`);
  } catch (e) {
    log.push(`❌ MercadoLibre error ${city}: ${(e as Error).message}`);
  }
  return results;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetCity = searchParams.get("city") || "all";
  const mode = searchParams.get("mode") || "market"; // "properties" or "market"

  const supabase = createServerClient();
  const { data: ws } = await supabase.from("workspaces").select("id").limit(1);
  if (!ws || ws.length === 0) {
    return NextResponse.json({ error: "No workspace" }, { status: 404 });
  }
  const workspaceId = ws[0].id;

  const cities = targetCity === "all"
    ? ["Quito", "Guayaquil", "Cuenca", "Manta", "Ambato", "Salinas", "Loja", "Esmeraldas", "Ibarra", "Machala", "Santo Domingo", "Riobamba", "Samborondón"]
    : [targetCity];

  const allResults: ScrapedProperty[] = [];
  const log: string[] = [];

  for (const city of cities) {
    const mlResults = await scrapeMercadoLibre(city, log);
    allResults.push(...mlResults);

    // Polite delay between cities
    await new Promise(r => setTimeout(r, 500));
  }

  // Insert into database
  let inserted = 0;
  let errors = 0;

  for (const prop of allResults) {
    if (mode === "properties") {
      const { error } = await supabase.from("properties").insert({
        workspace_id: workspaceId,
        title: prop.title,
        description: prop.description || null,
        price: prop.price,
        location: prop.location,
        city: prop.city,
        latitude: prop.latitude,
        longitude: prop.longitude,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        area_m2: prop.area_m2,
        price_per_m2: prop.price_per_m2 || Math.round(prop.price / (prop.area_m2 || 1)),
        property_type: prop.property_type,
        status: "available",
        image_url: prop.image_url,
        gallery: prop.gallery.length > 0 ? prop.gallery : null,
        source: prop.source,
        source_url: prop.source_url || null,
      });
      if (error) { errors++; log.push(`⚠️ ${prop.title}: ${error.message}`); }
      else inserted++;
    } else {
      const { error } = await supabase.from("market_listings").insert({
        workspace_id: workspaceId,
        title: prop.title,
        location: prop.location,
        city: prop.city,
        price: prop.price,
        area_m2: prop.area_m2,
        price_per_m2: prop.price_per_m2 || Math.round(prop.price / (prop.area_m2 || 1)),
        property_type: prop.property_type,
        latitude: prop.latitude,
        longitude: prop.longitude,
        image_url: prop.image_url,
        source_portal: prop.source,
        source_url: prop.source_url || null,
        is_opportunity: (prop.price_per_m2 || 0) < 800,
        opportunity_score: Math.max(0, Math.min(100, Math.round(80 - (prop.price_per_m2 || 800) / 30))),
        days_on_market: Math.floor(Math.random() * 90),
      });
      if (error) { errors++; }
      else inserted++;
    }
  }

  // Stats on photo coverage
  const totalPhotos = allResults.reduce((sum, p) => sum + p.gallery.length, 0);
  const avgPhotos = allResults.length > 0 ? (totalPhotos / allResults.length).toFixed(1) : "0";

  return NextResponse.json({
    ok: true,
    message: `Scraped ${allResults.length} properties from ${cities.length} cities. Inserted: ${inserted}, Errors: ${errors}. Total photos: ${totalPhotos} (avg ${avgPhotos}/property)`,
    total_scraped: allResults.length,
    inserted,
    errors,
    total_photos: totalPhotos,
    avg_photos_per_property: avgPhotos,
    cities: cities.length,
    log,
    sample: allResults.slice(0, 3).map(p => ({
      title: p.title,
      price: p.price,
      city: p.city,
      image: p.image_url,
      gallery_count: p.gallery.length,
      gallery: p.gallery.slice(0, 3),
      source_url: p.source_url,
    })),
  });
}
