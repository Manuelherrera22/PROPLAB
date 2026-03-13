"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase } from "@/lib/supabase";
import { useStore, type Property, type MarketListing } from "@/store/useStore";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString()}`;
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    house: "Casa",
    apartment: "Departamento",
    penthouse: "Penthouse",
    land: "Terreno",
  };
  return map[t] || t;
}

function statusBadge(s: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    available: { label: "Disponible", color: "var(--color-success)", bg: "var(--color-success-muted)" },
    reserved: { label: "Reservada", color: "var(--color-warning)", bg: "var(--color-warning-muted)" },
    sold: { label: "Vendida", color: "var(--color-danger)", bg: "var(--color-danger-muted)" },
  };
  return map[s] || { label: s, color: "var(--color-text-muted)", bg: "var(--color-bg-hover)" };
}

function typeIcon(t: string) {
  const icons: Record<string, string> = {
    house: "🏠",
    apartment: "🏢",
    penthouse: "🏙️",
    land: "🌿",
  };
  return icons[t] || "🏠";
}

// Detect MercadoLibre placeholder/logo images
function isRealImage(url: string | null | undefined): boolean {
  if (!url || !url.startsWith("http")) return false;
  const lower = url.toLowerCase();
  if (lower.includes("resources.mlstatic.com")) return false;
  if (lower.includes("/resources/")) return false;
  if (lower.includes("logo")) return false;
  if (lower.includes("_noimage")) return false;
  if (lower.includes("no-image")) return false;
  if (lower.includes("placeholder")) return false;
  return true;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { workspaceId } = useStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [comparables, setComparables] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !params.id) return;

    async function load() {
      // Load property
      const { data: prop } = await sb!.from("properties").select("*").eq("id", params.id).single();
      if (prop) {
        setProperty(prop as Property);
        // Load comparable market listings in same city
        const { data: comps } = await sb!
          .from("market_listings")
          .select("*")
          .eq("workspace_id", workspaceId)
          .eq("city", prop.city)
          .order("scraped_at", { ascending: false })
          .limit(6);
        if (comps) setComparables(comps as MarketListing[]);
      }
      setLoading(false);
    }
    load();
  }, [params.id, workspaceId]);

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto pt-16 md:pt-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-[var(--color-bg-hover)] rounded w-1/3" />
          <div className="h-64 bg-[var(--color-bg-hover)] rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[var(--color-bg-hover)] rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl mx-auto pt-16 md:pt-8 text-center">
        <p className="text-[var(--color-text-muted)]">Propiedad no encontrada</p>
        <Link href="/dashboard" className="text-[var(--color-accent)] text-sm mt-2 inline-block">← Volver</Link>
      </div>
    );
  }

  const p = property;
  const badge = statusBadge(p.status);
  const avgMarketPrice = comparables.length > 0
    ? comparables.reduce((s, c) => s + (c.price_per_m2 || 0), 0) / comparables.length
    : p.price_per_m2;
  const priceDiff = (p.price_per_m2 || 0) - (avgMarketPrice || 0);
  const priceDiffPct = (avgMarketPrice || 0) > 0 ? ((priceDiff / (avgMarketPrice || 1)) * 100) : 0;
  const isBelow = priceDiffPct < -5;
  const isAbove = priceDiffPct > 5;

  // Build gallery: use gallery array if available, otherwise just main image — filter out ML logos
  const gallery: string[] = ((p.gallery && p.gallery.length > 0)
    ? p.gallery
    : (p.image_url && p.image_url.startsWith("http")) ? [p.image_url] : []
  ).filter((url: string) => isRealImage(url));

  const hasGallery = gallery.length > 0;
  const currentImage = gallery[activeImageIdx] || "";

  const nextImage = () => setActiveImageIdx((prev) => (prev + 1) % gallery.length);
  const prevImage = () => setActiveImageIdx((prev) => (prev - 1 + gallery.length) % gallery.length);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 pt-16 md:pt-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <ArrowLeft size={16} />
        Volver
      </button>

      {/* Photo Gallery */}
      {hasGallery ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
          {/* Main Image */}
          <div className="relative h-64 sm:h-80 md:h-96 bg-[var(--color-bg-hover)] overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIdx}
                src={currentImage}
                alt={`${p.title} - Foto ${activeImageIdx + 1}`}
                className="object-cover w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/70"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Photo Counter */}
            <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white flex items-center gap-1.5">
              <ImageIcon size={12} />
              {activeImageIdx + 1} / {gallery.length}
            </div>

            {/* Price Badge */}
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-xl text-sm font-bold text-white border border-white/10 shadow-lg">
              ${p.price.toLocaleString()}
            </div>

            {/* Status Badge */}
            <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider`}
              style={{ background: badge.bg, color: badge.color }}
            >
              {badge.label}
            </div>

            {/* Source Link */}
            {p.source_url && (
              <a
                href={p.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-[11px] text-white/80 flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <ExternalLink size={11} />
                Ver anuncio original
              </a>
            )}
          </div>

          {/* Thumbnail Strip */}
          {gallery.length > 1 && (
            <div className="flex gap-1.5 p-3 overflow-x-auto bg-[var(--color-bg-secondary)]">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden transition-all ${
                    idx === activeImageIdx
                      ? "ring-2 ring-[var(--color-accent)] opacity-100 scale-105"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Foto ${idx + 1}`}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.style.display = "none";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        /* No Photos Fallback */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card h-48 flex items-center justify-center"
          style={{
            background: p.property_type === "house" ? "linear-gradient(135deg, #1a3a2a 0%, #0d1f15 100%)" :
              p.property_type === "apartment" ? "linear-gradient(135deg, #1a2a3a 0%, #0d1520 100%)" :
              p.property_type === "penthouse" ? "linear-gradient(135deg, #2a1a3a 0%, #150d20 100%)" :
              "linear-gradient(135deg, #2a3a1a 0%, #151f0d 100%)"
          }}
        >
          <div className="text-center">
            <span className="text-5xl opacity-30">{typeIcon(p.property_type)}</span>
            <p className="text-xs text-[var(--color-text-muted)] mt-2">Sin fotos disponibles</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{typeIcon(p.property_type)}</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">{p.title}</h1>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-[var(--color-text-muted)]">
                <MapPin size={14} />
                <span>{p.location}{p.city ? `, ${p.city}` : ""}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">{typeLabel(p.property_type)}</span>
                {p.source && (
                  <span className="text-[10px] text-[var(--color-text-muted)] px-1.5 py-0.5 rounded bg-[var(--color-bg-hover)]">
                    📡 {p.source}
                  </span>
                )}
              </div>
              {p.description && (
                <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed max-w-xl">
                  {p.description}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[var(--color-accent)]">${p.price.toLocaleString()}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">${p.price_per_m2?.toLocaleString()}/m²</p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {p.property_type !== "land" && (
          <>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <BedDouble size={16} className="text-[var(--color-info)]" />
                <span className="text-xs text-[var(--color-text-muted)]">Habitaciones</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{p.bedrooms}</p>
            </div>
            <div className="kpi-card">
              <div className="flex items-center gap-2 mb-2">
                <Bath size={16} className="text-[var(--color-info)]" />
                <span className="text-xs text-[var(--color-text-muted)]">Baños</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{p.bathrooms}</p>
            </div>
          </>
        )}
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <Maximize2 size={16} className="text-[var(--color-accent)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Área</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{p.area_m2}m²</p>
        </div>
        <div className="kpi-card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-[var(--color-success)]" />
            <span className="text-xs text-[var(--color-text-muted)]">Precio/m²</span>
          </div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">${p.price_per_m2?.toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Market Analysis */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
          <BarChart3 size={18} className="text-[var(--color-accent)]" />
          Análisis de Mercado
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Price vs Market */}
          <div className="p-4 rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-default)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Precio vs Mercado</p>
            <div className="flex items-center gap-2">
              {isBelow ? (
                <TrendingDown size={18} className="text-[var(--color-success)]" />
              ) : isAbove ? (
                <TrendingUp size={18} className="text-[var(--color-danger)]" />
              ) : (
                <Target size={18} className="text-[var(--color-info)]" />
              )}
              <span className={`text-xl font-bold ${isBelow ? "text-[var(--color-success)]" : isAbove ? "text-[var(--color-danger)]" : "text-[var(--color-info)]"}`}>
                {priceDiffPct > 0 ? "+" : ""}{priceDiffPct.toFixed(1)}%
              </span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              {isBelow ? "Por debajo del promedio — buena oportunidad" : isAbove ? "Por encima del promedio" : "En rango de mercado"}
            </p>
          </div>

          {/* Market Average */}
          <div className="p-4 rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-default)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Promedio zona ({p.city})</p>
            <p className="text-xl font-bold text-[var(--color-text-primary)]">${Math.round(avgMarketPrice || 0).toLocaleString()}/m²</p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Basado en {comparables.length} listados del mercado</p>
          </div>

          {/* Opportunity Score */}
          <div className="p-4 rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-default)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Score de Inversión</p>
            <p className={`text-xl font-bold ${isBelow ? "text-[var(--color-success)]" : "text-[var(--color-text-primary)]"}`}>
              {Math.max(0, Math.min(100, Math.round(50 - priceDiffPct * 2)))}/100
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
              {isBelow ? "⚡ Alta oportunidad de arbitraje" : "Inversión estándar"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Property Assessment */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pros */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--color-success)] flex items-center gap-2 mb-3">
              <CheckCircle size={16} /> Ventajas
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {(p.area_m2 || 0) > 200 && <li>✓ Área amplia ({p.area_m2}m²)</li>}
              {p.bedrooms >= 3 && <li>✓ {p.bedrooms} habitaciones — ideal para familias</li>}
              {isBelow && <li>✓ Precio {Math.abs(priceDiffPct).toFixed(0)}% debajo del mercado</li>}
              {p.status === "available" && <li>✓ Disponible para compra inmediata</li>}
              {p.city && <li>✓ Ubicación en {p.city} — zona de alta demanda</li>}
              {(p.price_per_m2 || 0) < 1000 && <li>✓ Precio/m² accesible (${p.price_per_m2}/m²)</li>}
              {gallery.length > 3 && <li>✓ {gallery.length} fotos reales del inmueble</li>}
            </ul>
          </div>

          {/* Considerations */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--color-warning)] flex items-center gap-2 mb-3">
              <AlertTriangle size={16} /> Consideraciones
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {isAbove && <li>⚠ Precio {priceDiffPct.toFixed(0)}% sobre el promedio de zona</li>}
              {p.status === "reserved" && <li>⚠ Propiedad actualmente reservada</li>}
              {p.status === "sold" && <li>⚠ Propiedad ya vendida</li>}
              {p.property_type === "land" && <li>⚠ Terreno — requiere inversión de construcción adicional</li>}
              {comparables.length === 0 && <li>⚠ Sin datos comparativos en la zona</li>}
              {gallery.length <= 1 && <li>⚠ Pocas fotos disponibles — verificar en sitio</li>}
              <li>⚠ Verificar documentación legal y escrituración</li>
              <li>⚠ Inspección física recomendada antes de oferta</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Comparable Listings */}
      {comparables.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-[var(--color-info)]" />
            Comparables en {p.city}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--color-text-muted)] text-xs border-b border-[var(--color-border-default)]">
                  <th className="pb-2 pr-4">Propiedad</th>
                  <th className="pb-2 pr-4">Precio</th>
                  <th className="pb-2 pr-4">$/m²</th>
                  <th className="pb-2 pr-4">Área</th>
                  <th className="pb-2 pr-4">Portal</th>
                  <th className="pb-2">Días</th>
                </tr>
              </thead>
              <tbody>
                {comparables.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--color-border-default)]/50">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        {c.is_opportunity && <span className="text-[10px]">🔥</span>}
                        <span className="text-[var(--color-text-primary)] truncate max-w-[200px]">{c.title}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--color-text-primary)] font-medium">{formatPrice(c.price || 0)}</td>
                    <td className={`py-2.5 pr-4 font-medium ${(c.price_per_m2 || 0) < (p.price_per_m2 || 0) ? "text-[var(--color-success)]" : "text-[var(--color-text-secondary)]"}`}>
                      ${(c.price_per_m2 || 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 text-[var(--color-text-muted)]">{c.area_m2}m²</td>
                    <td className="py-2.5 pr-4 text-[var(--color-text-muted)]">{c.source_portal}</td>
                    <td className="py-2.5">
                      <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                        <Clock size={12} />{c.days_on_market}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
