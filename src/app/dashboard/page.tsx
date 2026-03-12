"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useStore, type Property, type Lead, type Deal, type SmartAlert, type MarketListing } from "@/store/useStore";
import { getSupabase } from "@/lib/supabase";
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  MapPin,
  BedDouble,
  ArrowUpRight,
  Bell,
  Eye,
  Target,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

const stageLabels: Record<string, string> = {
  new_lead: "Nuevo",
  contacted: "Contactado",
  showing: "Visita",
  offer: "Oferta",
  negotiation: "Negociación",
  closed_won: "Cerrado ✓",
  closed_lost: "Perdido",
};

export default function CommandCenter() {
  const {
    workspaceId,
    properties,
    setProperties,
    leads,
    setLeads,
    deals,
    setDeals,
    alerts,
    setAlerts,
    marketListings,
    setMarketListings,
  } = useStore();

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      console.warn("[PROPLAB] Supabase client not available");
      return;
    }

    async function loadData(wsId: string) {
      console.log("[PROPLAB] Loading data for workspace:", wsId);
      const [propsRes, leadsRes, dealsRes, alertsRes, marketRes] = await Promise.all([
        sb!.from("properties").select("*").eq("workspace_id", wsId).order("created_at", { ascending: false }),
        sb!.from("leads").select("*").eq("workspace_id", wsId).order("created_at", { ascending: false }),
        sb!.from("deals").select("*, lead:leads(*), property:properties(*)").eq("workspace_id", wsId).order("created_at", { ascending: false }),
        sb!.from("smart_alerts").select("*").eq("workspace_id", wsId).order("created_at", { ascending: false }).limit(5),
        sb!.from("market_listings").select("*").eq("workspace_id", wsId).order("scraped_at", { ascending: false }),
      ]);
      console.log("[PROPLAB] Data loaded:", {
        properties: propsRes.data?.length ?? 0,
        leads: leadsRes.data?.length ?? 0,
        deals: dealsRes.data?.length ?? 0,
        alerts: alertsRes.data?.length ?? 0,
        market: marketRes.data?.length ?? 0,
        errors: [propsRes.error, leadsRes.error, dealsRes.error, alertsRes.error, marketRes.error].filter(Boolean),
      });
      if (propsRes.data) setProperties(propsRes.data as Property[]);
      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (dealsRes.data) setDeals(dealsRes.data as Deal[]);
      if (alertsRes.data) setAlerts(alertsRes.data as SmartAlert[]);
      if (marketRes.data) setMarketListings(marketRes.data as MarketListing[]);
      return propsRes.data?.length ?? 0;
    }

    // Try loading with current workspaceId; if 0 results, auto-detect
    loadData(workspaceId).then(async (count) => {
      if (count === 0) {
        console.log("[PROPLAB] No data for stored workspace, auto-detecting...");
        const { data: workspaces } = await sb!.from("workspaces").select("id, name").limit(1);
        if (workspaces && workspaces.length > 0) {
          const ws = workspaces[0];
          console.log("[PROPLAB] Auto-detected workspace:", ws.name, ws.id);
          useStore.getState().setWorkspace(ws.id, ws.name);
          // Data will reload via dependency change
        }
      }
    });

    // Realtime subscriptions
    const channel = sb
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        sb!.from("leads").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).then(r => { if (r.data) setLeads(r.data as Lead[]); });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "smart_alerts" }, () => {
        sb!.from("smart_alerts").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(5).then(r => { if (r.data) setAlerts(r.data as SmartAlert[]); });
      })
      .subscribe();

    return () => { sb.removeChannel(channel); };
  }, [workspaceId, setProperties, setLeads, setDeals, setAlerts, setMarketListings]);

  const totalPipelineValue = deals.filter(d => !["closed_won", "closed_lost"].includes(d.stage)).reduce((sum, d) => sum + (d.deal_value || 0), 0);
  const avgPrice = properties.length > 0 ? properties.reduce((s, p) => s + p.price, 0) / properties.length : 0;
  const opportunities = marketListings.filter(m => m.is_opportunity);

  const kpis = [
    { label: "Propiedades", value: properties.length, icon: Building2, color: "var(--color-accent)" },
    { label: "Leads Activos", value: leads.length, icon: Users, color: "var(--color-success)" },
    { label: "Pipeline", value: formatPrice(totalPipelineValue), icon: TrendingUp, color: "var(--color-info)" },
    { label: "Oportunidades", value: opportunities.length, icon: Target, color: "var(--color-warning)" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 pt-16 md:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Vista general de tu operación inmobiliaria
          </p>
        </div>
        <Link
          href="/dashboard/chat"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 gradient-accent text-[var(--color-bg-primary)] rounded-xl font-medium text-sm shadow-lg hover:shadow-[0_0_20px_rgba(212,168,83,0.2)] transition-all"
        >
          <Sparkles size={16} />
          AI Advisor
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="kpi-card"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${kpi.color} 12%, transparent)` }}
              >
                <kpi.icon size={18} style={{ color: kpi.color }} />
              </div>
              <ArrowUpRight size={14} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{kpi.value}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Properties Grid — 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Propiedades Recientes</h2>
            <span className="text-xs text-[var(--color-text-muted)]">{properties.length} total</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {properties.slice(0, 4).map((prop, i) => (
              <Link key={prop.id} href={`/dashboard/properties/${prop.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="glass-card overflow-hidden group cursor-pointer"
                >
                  <div className="relative h-32 sm:h-36 overflow-hidden bg-[var(--color-bg-hover)]">
                    {prop.image_url && prop.image_url.startsWith("http") ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={prop.image_url}
                        alt={prop.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{
                        background: prop.property_type === "house" ? "linear-gradient(135deg, #1a3a2a 0%, #0d1f15 100%)" :
                          prop.property_type === "apartment" ? "linear-gradient(135deg, #1a2a3a 0%, #0d1520 100%)" :
                          prop.property_type === "penthouse" ? "linear-gradient(135deg, #2a1a3a 0%, #150d20 100%)" :
                          "linear-gradient(135deg, #2a3a1a 0%, #151f0d 100%)"
                      }}>
                        <span className="text-4xl opacity-30">
                          {prop.property_type === "house" ? "🏠" : prop.property_type === "apartment" ? "🏢" : prop.property_type === "penthouse" ? "🏙️" : "🌿"}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10">
                      {formatPrice(prop.price)}
                    </div>
                    <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                      prop.status === "available" ? "bg-[var(--color-success-muted)] text-[var(--color-success)]" :
                      prop.status === "reserved" ? "bg-[var(--color-warning-muted)] text-[var(--color-warning)]" :
                      "bg-[var(--color-danger-muted)] text-[var(--color-danger)]"
                    }`}>
                      {prop.status === "available" ? "Disponible" : prop.status === "reserved" ? "Reservada" : "Vendida"}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate">
                      {prop.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[var(--color-text-muted)] text-xs">
                      <MapPin size={12} />
                      <span className="truncate">{prop.location}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-[var(--color-text-secondary)]">
                      {prop.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                          <BedDouble size={12} className="text-[var(--color-accent)]" />
                          {prop.bedrooms}
                        </div>
                      )}
                      {prop.area_m2 && (
                        <div className="flex items-center gap-1">
                          <Eye size={12} className="text-[var(--color-info)]" />
                          {prop.area_m2}m²
                        </div>
                      )}
                      {prop.price_per_m2 && (
                        <div className="flex items-center gap-1">
                          <DollarSign size={12} className="text-[var(--color-success)]" />
                          {prop.price_per_m2}/m²
                        </div>
                      )}
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column — Activity Feed + Alerts */}
        <div className="space-y-6">
          {/* Active Deals */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Deals Activos</h3>
              <Link href="/dashboard/deals" className="text-[10px] text-[var(--color-accent)] hover:underline uppercase font-medium tracking-wider">
                Ver todos
              </Link>
            </div>
            {deals.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-6">No hay deals activos</p>
            ) : (
              <div className="space-y-3">
                {deals.slice(0, 4).map((deal) => (
                  <div key={deal.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-muted)] flex items-center justify-center text-[var(--color-accent)] text-xs font-bold flex-shrink-0">
                      {deal.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{deal.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded stage-${deal.stage}`}>
                          {stageLabels[deal.stage] || deal.stage}
                        </span>
                        {deal.deal_value && (
                          <span className="text-[10px] text-[var(--color-text-muted)]">{formatPrice(deal.deal_value)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Alerts */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <Bell size={14} className="text-[var(--color-accent)]" />
                Alertas
              </h3>
              <Link href="/dashboard/alerts" className="text-[10px] text-[var(--color-accent)] hover:underline uppercase font-medium tracking-wider">
                Ver todas
              </Link>
            </div>
            {alerts.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-6">Sin alertas</p>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-xl border transition-colors ${
                    alert.is_read
                      ? "bg-transparent border-[var(--color-border-default)]"
                      : "bg-[var(--color-accent-glow)] border-[rgba(212,168,83,0.12)]"
                  }`}>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-1">{alert.title}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed line-clamp-2">{alert.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-[var(--color-text-muted)]">
                      <Clock size={10} />
                      {formatTimeAgo(alert.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Leads */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Leads Recientes</h3>
            </div>
            {leads.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] text-center py-6">Sin leads aún</p>
            ) : (
              <div className="space-y-3">
                {leads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--color-bg-hover)] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-success-muted)] flex items-center justify-center text-[var(--color-success)] text-xs font-bold flex-shrink-0">
                      {lead.user_name ? lead.user_name.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{lead.user_name || "Anónimo"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[var(--color-text-muted)]">{lead.desired_location || "Sin ubicación"}</span>
                        <span className="text-[10px] font-semibold text-[var(--color-accent)]">Score: {lead.lead_score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
