"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore, type MarketListing, type Property } from "@/store/useStore";
import { getSupabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import type { MapPoint } from "@/components/MapView";
import {
  MapPin,
  TrendingUp,
  Target,
  AlertTriangle,
  Building2,
  DollarSign,
  Clock,
  Flame,
  BarChart3,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

// Lazy load map to avoid SSR issues
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type ZoneStats = {
  city: string;
  avgPrice: number;
  avgPriceM2: number;
  count: number;
  opportunities: number;
};

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

// Ecuador provinces and their main cities
const PROVINCE_CITY_MAP: Record<string, string[]> = {
  "Guayas": ["Guayaquil", "Samborondón", "Durán", "Playas"],
  "Pichincha": ["Quito"],
  "Azuay": ["Cuenca"],
  "Manabí": ["Manta", "Portoviejo"],
  "Tungurahua": ["Ambato"],
  "Santa Elena": ["Salinas"],
  "Loja": ["Loja"],
  "Esmeraldas": ["Esmeraldas"],
  "Imbabura": ["Ibarra"],
  "El Oro": ["Machala"],
  "Santo Domingo": ["Santo Domingo"],
  "Chimborazo": ["Riobamba"],
  "Pastaza": ["Baños"],
};

export default function MarketIntelPage() {
  const { workspaceId, properties, setProperties, marketListings, setMarketListings } = useStore();

  // === FILTER STATE ===
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterProvince, setFilterProvince] = useState<string>("all");
  const [filterMinPrice, setFilterMinPrice] = useState<string>("");
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
  const [filterOnlyOpportunities, setFilterOnlyOpportunities] = useState(false);
  const [filterMinScore, setFilterMinScore] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    async function load() {
      const [propsRes, marketRes] = await Promise.all([
        sb!.from("properties").select("*").eq("workspace_id", workspaceId),
        sb!.from("market_listings").select("*").eq("workspace_id", workspaceId).order("scraped_at", { ascending: false }),
      ]);
      if (propsRes.data) setProperties(propsRes.data as Property[]);
      if (marketRes.data) setMarketListings(marketRes.data as MarketListing[]);
    }
    load();
  }, [workspaceId, setProperties, setMarketListings]);

  // === AVAILABLE CITIES from data ===
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    properties.forEach((p) => { if (p.city) cities.add(p.city); });
    marketListings.forEach((m) => { if (m.city) cities.add(m.city); });
    return Array.from(cities).sort();
  }, [properties, marketListings]);

  // === PROVINCES that have cities in our data ===
  const availableProvinces = useMemo(() => {
    const provinces = new Set<string>();
    for (const [province, cities] of Object.entries(PROVINCE_CITY_MAP)) {
      if (cities.some((c) => availableCities.includes(c))) {
        provinces.add(province);
      }
    }
    return Array.from(provinces).sort();
  }, [availableCities]);

  // === Cities filtered by province ===
  const filteredAvailableCities = useMemo(() => {
    if (filterProvince === "all") return availableCities;
    const provinceCities = PROVINCE_CITY_MAP[filterProvince] || [];
    return availableCities.filter((c) => provinceCities.includes(c));
  }, [filterProvince, availableCities]);

  // Reset city when province changes
  useEffect(() => {
    if (filterProvince !== "all" && filterCity !== "all") {
      const provinceCities = PROVINCE_CITY_MAP[filterProvince] || [];
      if (!provinceCities.includes(filterCity)) {
        setFilterCity("all");
      }
    }
  }, [filterProvince, filterCity]);

  // === FILTER LOGIC ===
  const applyFilters = <T extends { price?: number | null; property_type?: string | null; city?: string | null; is_opportunity?: boolean; opportunity_score?: number | null }>(items: T[]): T[] => {
    return items.filter((item) => {
      const price = item.price || 0;
      if (filterMinPrice && price < Number(filterMinPrice)) return false;
      if (filterMaxPrice && price > Number(filterMaxPrice)) return false;
      if (filterType !== "all" && item.property_type !== filterType) return false;
      if (filterCity !== "all" && item.city !== filterCity) return false;
      if (filterProvince !== "all") {
        const provinceCities = PROVINCE_CITY_MAP[filterProvince] || [];
        if (!provinceCities.includes(item.city || "")) return false;
      }
      if (filterOnlyOpportunities && !item.is_opportunity) return false;
      if (filterMinScore && (item.opportunity_score || 0) < Number(filterMinScore)) return false;
      return true;
    });
  };

  const filteredProperties = useMemo(() => applyFilters(properties), [properties, filterType, filterCity, filterProvince, filterMinPrice, filterMaxPrice, filterOnlyOpportunities, filterMinScore]);
  const filteredMarketListings = useMemo(() => applyFilters(marketListings), [marketListings, filterType, filterCity, filterProvince, filterMinPrice, filterMaxPrice, filterOnlyOpportunities, filterMinScore]);

  const opportunities = filteredMarketListings.filter((m) => m.is_opportunity);

  // === ZONE STATS (filtered) ===
  const zoneStats = useMemo<ZoneStats[]>(() => {
    const allItems = [
      ...filteredProperties.map((p) => ({ city: p.city || "Otro", price: p.price, priceM2: p.price_per_m2 || 0, isOpp: false })),
      ...filteredMarketListings.map((m) => ({ city: m.city || "Otro", price: m.price || 0, priceM2: m.price_per_m2 || 0, isOpp: m.is_opportunity })),
    ];
    const grouped: Record<string, { prices: number[]; pricesM2: number[]; opps: number }> = {};
    allItems.forEach((item) => {
      if (!grouped[item.city]) grouped[item.city] = { prices: [], pricesM2: [], opps: 0 };
      if (item.price > 0) grouped[item.city].prices.push(item.price);
      if (item.priceM2 > 0) grouped[item.city].pricesM2.push(item.priceM2);
      if (item.isOpp) grouped[item.city].opps++;
    });
    return Object.entries(grouped).map(([city, data]) => ({
      city,
      avgPrice: data.prices.length > 0 ? data.prices.reduce((a, b) => a + b, 0) / data.prices.length : 0,
      avgPriceM2: data.pricesM2.length > 0 ? data.pricesM2.reduce((a, b) => a + b, 0) / data.pricesM2.length : 0,
      count: data.prices.length,
      opportunities: data.opps,
    })).sort((a, b) => b.count - a.count);
  }, [filteredProperties, filteredMarketListings]);

  // === MAP POINTS (enriched with photos and data) ===
  const mapPoints = useMemo<MapPoint[]>(() => {
    const points: MapPoint[] = [];
    filteredProperties.forEach((p) => {
      if (p.latitude && p.longitude) {
        points.push({
          lat: p.latitude,
          lng: p.longitude,
          title: p.title,
          price: p.price,
          type: "own",
          id: p.id,
          image_url: p.image_url,
          gallery: p.gallery || undefined,
          area_m2: p.area_m2,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          price_per_m2: p.price_per_m2,
          city: p.city,
          property_type: p.property_type,
          source: p.source,
          description: p.description?.substring(0, 120),
        });
      }
    });
    filteredMarketListings.forEach((m) => {
      if (m.latitude && m.longitude) {
        points.push({
          lat: m.latitude,
          lng: m.longitude,
          title: m.title || "Listing",
          price: m.price || 0,
          type: m.is_opportunity ? "opportunity" : "market",
          area_m2: m.area_m2,
          bedrooms: m.bedrooms || undefined,
          price_per_m2: m.price_per_m2,
          opportunity_score: m.opportunity_score,
          days_on_market: m.days_on_market,
          city: m.city,
          property_type: m.property_type || undefined,
          source: m.source_portal || undefined,
        });
      }
    });
    return points;
  }, [filteredProperties, filteredMarketListings]);

  const activeFilterCount = [
    filterType !== "all",
    filterCity !== "all",
    filterProvince !== "all",
    !!filterMinPrice,
    !!filterMaxPrice,
    filterOnlyOpportunities,
    !!filterMinScore,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterType("all");
    setFilterCity("all");
    setFilterProvince("all");
    setFilterMinPrice("");
    setFilterMaxPrice("");
    setFilterOnlyOpportunities(false);
    setFilterMinScore("");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-5 pt-16 md:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Market Intelligence</h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">Mapa interactivo, filtrado avanzado y análisis por zona</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            showFilters
              ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/20"
              : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border-default)]"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filtros
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-[var(--color-bg-primary)] text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Propiedades Propias", value: filteredProperties.length, total: properties.length, icon: Building2, color: "var(--color-accent)" },
          { label: "Listados del Mercado", value: filteredMarketListings.length, total: marketListings.length, icon: BarChart3, color: "var(--color-info)" },
          { label: "Oportunidades", value: opportunities.length, total: marketListings.filter(m => m.is_opportunity).length, icon: Target, color: "var(--color-warning)" },
          { label: "Zonas Activas", value: zoneStats.length, total: zoneStats.length, icon: MapPin, color: "var(--color-success)" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="kpi-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--color-text-primary)]">
                  {stat.value}
                  {activeFilterCount > 0 && stat.value !== stat.total && (
                    <span className="text-xs font-normal text-[var(--color-text-muted)] ml-1">/ {stat.total}</span>
                  )}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* === FILTER BAR === */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Filter size={13} className="text-[var(--color-accent)]" />
              Filtros de Búsqueda
            </h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-[10px] text-[var(--color-accent)] hover:underline flex items-center gap-1">
                <X size={10} />
                Limpiar ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* Provincia */}
            <div>
              <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">Provincia</label>
              <select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className="w-full bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] text-xs rounded-lg px-3 py-2 border border-[var(--color-border-default)] outline-none focus:border-[var(--color-accent)]/40"
              >
                <option value="all">Todas</option>
                {availableProvinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Ciudad */}
            <div>
              <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">Ciudad</label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] text-xs rounded-lg px-3 py-2 border border-[var(--color-border-default)] outline-none focus:border-[var(--color-accent)]/40"
              >
                <option value="all">Todas</option>
                {filteredAvailableCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] text-xs rounded-lg px-3 py-2 border border-[var(--color-border-default)] outline-none focus:border-[var(--color-accent)]/40"
              >
                <option value="all">Todos</option>
                <option value="house">Casa</option>
                <option value="apartment">Departamento</option>
                <option value="land">Terreno</option>
                <option value="penthouse">Penthouse</option>
              </select>
            </div>

            {/* Precio Min */}
            <div>
              <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">Precio Mín ($)</label>
              <input
                type="number"
                value={filterMinPrice}
                onChange={(e) => setFilterMinPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] text-xs rounded-lg px-3 py-2 border border-[var(--color-border-default)] outline-none focus:border-[var(--color-accent)]/40 placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Precio Max */}
            <div>
              <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">Precio Máx ($)</label>
              <input
                type="number"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                placeholder="∞"
                className="w-full bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] text-xs rounded-lg px-3 py-2 border border-[var(--color-border-default)] outline-none focus:border-[var(--color-accent)]/40 placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Score Min */}
            <div>
              <label className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">Score Mín</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filterMinScore}
                onChange={(e) => setFilterMinScore(e.target.value)}
                placeholder="0"
                className="w-full bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] text-xs rounded-lg px-3 py-2 border border-[var(--color-border-default)] outline-none focus:border-[var(--color-accent)]/40 placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            {/* Solo Oportunidades */}
            <div className="flex flex-col justify-end">
              <button
                onClick={() => setFilterOnlyOpportunities(!filterOnlyOpportunities)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filterOnlyOpportunities
                    ? "bg-[var(--color-warning-muted)] text-[var(--color-warning)] border border-[var(--color-warning)]/20"
                    : "bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] border border-[var(--color-border-default)]"
                }`}
              >
                <Flame size={12} />
                Solo Oportunidades
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <MapPin size={16} className="text-[var(--color-accent)]" />
            Mapa de Mercado
            <span className="text-[10px] font-normal text-[var(--color-text-muted)] ml-1">
              ({mapPoints.length} puntos)
            </span>
          </h2>
          <div className="flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
              <span className="text-[var(--color-text-muted)]">Propias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-info)]" />
              <span className="text-[var(--color-text-muted)]">Mercado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-warning)]" />
              <span className="text-[var(--color-text-muted)]">Oportunidades</span>
            </div>
          </div>
        </div>
        <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
          <MapView points={mapPoints} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Opportunity Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Flame size={16} className="text-[var(--color-warning)]" />
              Oportunidades Detectadas
              <span className="text-[10px] font-normal text-[var(--color-text-muted)]">({opportunities.length})</span>
            </h2>
          </div>
          {opportunities.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle size={24} className="text-[var(--color-text-muted)] mx-auto mb-2" />
              <p className="text-xs text-[var(--color-text-muted)]">
                {activeFilterCount > 0 ? "No hay oportunidades con estos filtros" : "No hay oportunidades detectadas aún"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {opportunities.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] hover:border-[var(--color-warning)] hover:border-opacity-30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{opp.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <MapPin size={10} /> {opp.city || opp.location}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock size={10} /> {opp.days_on_market}d en mercado
                      </span>
                    </div>
                    {/* Mini score bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--color-bg-primary)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${opp.opportunity_score || 0}%`,
                            background: (opp.opportunity_score || 0) >= 75 ? "var(--color-success)" : "var(--color-warning)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-[var(--color-accent)]">{formatPrice(opp.price || 0)}</p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <Target size={10} className="text-[var(--color-warning)]" />
                      <span className="text-[10px] font-semibold text-[var(--color-warning)]">Score: {opp.opportunity_score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Zone Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[var(--color-success)]" />
            Análisis por Zona
            <span className="text-[10px] font-normal text-[var(--color-text-muted)]">({zoneStats.length} zonas)</span>
          </h2>
          {zoneStats.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-8">
              {activeFilterCount > 0 ? "Sin datos con estos filtros" : "Sin datos de zonas"}
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {zoneStats.map((zone) => (
                <div
                  key={zone.city}
                  className="p-3 rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] cursor-pointer hover:border-[var(--color-accent)]/20 transition-colors"
                  onClick={() => {
                    setFilterCity(zone.city);
                    setShowFilters(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{zone.city}</p>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{zone.count} propiedades</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Precio Prom.</p>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">{formatPrice(zone.avgPrice)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">$/m²</p>
                      <p className="text-sm font-bold text-[var(--color-accent)]">${Math.round(zone.avgPriceM2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Oportunidades</p>
                      <p className={`text-sm font-bold ${zone.opportunities > 0 ? "text-[var(--color-warning)]" : "text-[var(--color-text-muted)]"}`}>
                        {zone.opportunities}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
