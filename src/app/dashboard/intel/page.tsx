"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore, type MarketListing, type Property } from "@/store/useStore";
import { getSupabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
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

export default function MarketIntelPage() {
  const { workspaceId, properties, setProperties, marketListings, setMarketListings } = useStore();
  const [filter, setFilter] = useState<string>("all");

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

  const opportunities = marketListings.filter((m) => m.is_opportunity);

  const zoneStats = useMemo<ZoneStats[]>(() => {
    const allItems = [
      ...properties.map((p) => ({ city: p.city || "Otro", price: p.price, priceM2: p.price_per_m2 || 0, isOpp: false })),
      ...marketListings.map((m) => ({ city: m.city || "Otro", price: m.price || 0, priceM2: m.price_per_m2 || 0, isOpp: m.is_opportunity })),
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
  }, [properties, marketListings]);

  // Map markers
  const mapPoints = useMemo(() => {
    const points: Array<{ lat: number; lng: number; title: string; price: number; type: "own" | "market" | "opportunity" }> = [];
    properties.forEach((p) => {
      if (p.latitude && p.longitude) {
        points.push({ lat: p.latitude, lng: p.longitude, title: p.title, price: p.price, type: "own" });
      }
    });
    marketListings.forEach((m) => {
      if (m.latitude && m.longitude) {
        points.push({
          lat: m.latitude,
          lng: m.longitude,
          title: m.title || "Listing",
          price: m.price || 0,
          type: m.is_opportunity ? "opportunity" : "market",
        });
      }
    });
    return points;
  }, [properties, marketListings]);

  const filteredOpportunities = filter === "all" ? opportunities : opportunities.filter((o) => o.property_type === filter);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 pt-16 md:pt-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Market Intelligence</h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">Mapa de calor, oportunidades y análisis por zona</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Propiedades Propias", value: properties.length, icon: Building2, color: "var(--color-accent)" },
          { label: "Listados del Mercado", value: marketListings.length, icon: BarChart3, color: "var(--color-info)" },
          { label: "Oportunidades Detectadas", value: opportunities.length, icon: Target, color: "var(--color-warning)" },
          { label: "Zonas Analizadas", value: zoneStats.length, icon: MapPin, color: "var(--color-success)" },
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
                <p className="text-xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <MapPin size={16} className="text-[var(--color-accent)]" />
            Mapa de Mercado
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
        <div className="h-[250px] sm:h-[350px] lg:h-[400px]">
          <MapView points={mapPoints} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Opportunity Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Flame size={16} className="text-[var(--color-warning)]" />
              Oportunidades Detectadas
            </h2>
            <div className="flex items-center gap-1">
              <Filter size={12} className="text-[var(--color-text-muted)]" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-[10px] text-[var(--color-text-muted)] border-none outline-none cursor-pointer"
              >
                <option value="all">Todas</option>
                <option value="house">Casas</option>
                <option value="apartment">Deptos</option>
                <option value="land">Terrenos</option>
              </select>
            </div>
          </div>
          {filteredOpportunities.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle size={24} className="text-[var(--color-text-muted)] mx-auto mb-2" />
              <p className="text-xs text-[var(--color-text-muted)]">No hay oportunidades detectadas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOpportunities.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-default)] hover:border-[var(--color-warning)] hover:border-opacity-30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{opp.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <MapPin size={10} /> {opp.location}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock size={10} /> {opp.days_on_market}d en mercado
                      </span>
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
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[var(--color-success)]" />
            Análisis por Zona
          </h2>
          {zoneStats.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-8">Sin datos de zonas</p>
          ) : (
            <div className="space-y-3">
              {zoneStats.map((zone) => (
                <div key={zone.city} className="p-3 rounded-xl bg-[var(--color-bg-hover)] border border-[var(--color-border-default)]">
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
