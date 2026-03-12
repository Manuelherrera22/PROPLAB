import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

// Realistic Ecuador real estate data pools
const cities = [
  { name: "Quito", lat: -0.18, lng: -78.48, zones: ["Cumbayá", "González Suárez", "La Carolina", "Tumbaco", "El Batán", "La Floresta", "Quito Tennis", "Condado"] },
  { name: "Guayaquil", lat: -2.17, lng: -79.92, zones: ["Samborondón", "Urdesa", "Kennedy Norte", "Ceibos", "Puerto Santa Ana", "Vía a la Costa", "Ciudad Celeste"] },
  { name: "Cuenca", lat: -2.90, lng: -79.01, zones: ["Centro Histórico", "El Vergel", "Av. Ordóñez Lasso", "Turi", "Yanuncay", "Totoracocha"] },
  { name: "Manta", lat: -0.95, lng: -80.73, zones: ["Barbasquillo", "Murcielago", "San Lorenzo", "Tarqui", "Umiña"] },
  { name: "Ambato", lat: -1.25, lng: -78.62, zones: ["Ficoa", "Atocha", "Miraflores", "Centro"] },
  { name: "Loja", lat: -3.99, lng: -79.20, zones: ["Ciudad Victoria", "Centro", "El Valle", "Vilcabamba"] },
  { name: "Esmeraldas", lat: 0.87, lng: -79.84, zones: ["Atacames", "Tonsupa", "Mompiche", "Súa"] },
  { name: "Salinas", lat: -2.22, lng: -80.96, zones: ["Chipipe", "Malecón", "Mar Bravo", "San Lorenzo"] },
  { name: "Ibarra", lat: 0.35, lng: -78.12, zones: ["Yacucalle", "Caranqui", "Yahuarcocha", "Centro"] },
  { name: "Santo Domingo", lat: -0.25, lng: -79.17, zones: ["Zaracay", "Vía Quevedo", "Centro", "Bombolí"] },
  { name: "Machala", lat: -3.26, lng: -79.96, zones: ["Centro", "Urdesa", "Av. 25 de Junio", "El Cambio"] },
  { name: "Riobamba", lat: -1.67, lng: -78.65, zones: ["La Estación", "Centro", "Terminal", "Bellavista"] },
  { name: "Baños", lat: -1.39, lng: -78.42, zones: ["Centro", "Ulba", "Runtún", "Lligua"] },
];

const portals = ["Properati", "OLX", "Plusvalía", "Inmuebles24", "Encuentra24"];
const types = ["house", "apartment", "land", "penthouse"];
const images = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=600",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600",
  "https://images.unsplash.com/photo-1615571022219-eb45cf7faa36?w=600",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600",
];

const names = [
  "Alejandro Torres","Sofía Mendoza","Juan Carlos Vega","Camila Arévalo","Ricardo Espinoza",
  "Daniela Córdova","Miguel Herrera","Gabriela Páez","Luis Fernando Díaz","Carolina Salgado",
  "José María Reyes","Valeria Montalvo","Andrés Salazar","Natalia Bravo","Francisco Guerrero",
];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generateMarketListing(city: typeof cities[0]) {
  const zone = pick(city.zones);
  const type = pick(types);
  const area = type === "land" ? rand(200, 5000) : type === "penthouse" ? rand(120, 300) : rand(50, 400);
  const pricePerM2 = type === "land" ? rand(30, 400) : rand(500, 3000);
  const price = area * pricePerM2;
  const isOpp = Math.random() > 0.5;
  return {
    title: `${type === "house" ? "Casa" : type === "apartment" ? "Depto" : type === "land" ? "Terreno" : "Penthouse"} ${zone} - ${city.name}`,
    location: zone,
    city: city.name,
    price,
    area_m2: area,
    price_per_m2: pricePerM2,
    property_type: type,
    latitude: city.lat + (Math.random() * 0.06 - 0.03),
    longitude: city.lng + (Math.random() * 0.06 - 0.03),
    source_portal: pick(portals),
    is_opportunity: isOpp,
    opportunity_score: isOpp ? rand(60, 95) : 0,
    days_on_market: rand(1, 120),
  };
}

function generateAlert(city: string) {
  const templates = [
    { type: "opportunity", title: `🔥 Oportunidad en ${city}`, message: `Propiedad detectada ${rand(15, 35)}% debajo del promedio de zona. Score: ${rand(70, 95)}.` },
    { type: "market", title: `📈 Precios subiendo en ${city}`, message: `Precio promedio/m² subió ${rand(3, 15)}% en los últimos ${rand(15, 60)} días.` },
    { type: "lead", title: `👤 Nuevo lead interesado en ${city}`, message: `${pick(names)} busca propiedad en ${city}. Presupuesto: $${rand(50, 500)}k. Score: ${rand(60, 95)}.` },
    { type: "opportunity", title: `⚡ ${city}: propiedad +${rand(45, 120)}d en mercado`, message: `Listado con más de ${rand(45, 120)} días sin vender. Potencial de negociación alta.` },
    { type: "market", title: `📊 ${city}: nuevo reporte de zona`, message: `${rand(5, 20)} nuevos listados detectados en portales. ${rand(2, 8)} oportunidades potenciales.` },
  ];
  return pick(templates);
}

export async function POST(req: Request) {
  try {
    const { workspaceId } = await req.json();
    if (!workspaceId) {
      return NextResponse.json({ error: "Missing workspaceId" }, { status: 400 });
    }

    const supabase = createServerClient();
    const results = { listings: 0, alerts: 0 };

    // Generate 3-6 new market listings across random cities
    const numListings = rand(3, 6);
    for (let i = 0; i < numListings; i++) {
      const city = pick(cities);
      const listing = generateMarketListing(city);
      const { error } = await supabase.from("market_listings").insert({
        workspace_id: workspaceId,
        ...listing,
      });
      if (!error) results.listings++;
    }

    // Generate 1-3 alerts
    const numAlerts = rand(1, 3);
    for (let i = 0; i < numAlerts; i++) {
      const city = pick(cities);
      const alert = generateAlert(city.name);
      const { error } = await supabase.from("smart_alerts").insert({
        workspace_id: workspaceId,
        ...alert,
      });
      if (!error) results.alerts++;
    }

    return NextResponse.json({
      ok: true,
      message: `Feed generated: ${results.listings} listings, ${results.alerts} alerts`,
      ...results,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET = auto-feed (picks first workspace)
export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: ws } = await supabase.from("workspaces").select("id").limit(1);
    if (!ws || ws.length === 0) {
      return NextResponse.json({ error: "No workspace" }, { status: 404 });
    }

    const body = JSON.stringify({ workspaceId: ws[0].id });
    const fakeReq = new Request("http://localhost/api/feed", { method: "POST", body, headers: { "Content-Type": "application/json" } });
    return POST(fakeReq);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
