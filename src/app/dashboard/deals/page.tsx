"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useStore, type Deal } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import {
  KanbanSquare,
  Phone,
  DollarSign,
  Calendar,
  MessageSquare,
  Target,
  ArrowRight,
} from "lucide-react";

const stages = [
  { key: "new_lead", label: "Nuevo Lead", icon: "📥", color: "var(--color-info)" },
  { key: "contacted", label: "Contactado", icon: "📞", color: "var(--color-accent)" },
  { key: "showing", label: "Visita", icon: "🏠", color: "var(--color-warning)" },
  { key: "offer", label: "Oferta", icon: "💰", color: "#a855f7" },
  { key: "negotiation", label: "Negociación", icon: "🤝", color: "#ec4899" },
  { key: "closed_won", label: "Cerrado ✓", icon: "✅", color: "var(--color-success)" },
  { key: "closed_lost", label: "Perdido", icon: "❌", color: "var(--color-danger)" },
];

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function DealTrackerPage() {
  const { workspaceId, deals, setDeals } = useStore();

  useEffect(() => {
    if (!supabase) return;
    async function loadDeals() {
      const { data } = await supabase!
        .from("deals")
        .select("*, lead:leads(*), property:properties(*)")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      if (data) setDeals(data as Deal[]);
    }
    loadDeals();

    const channel = supabase
      .channel("deals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "deals" }, () => { loadDeals(); })
      .subscribe();

    return () => { supabase?.removeChannel(channel); };
  }, [workspaceId, setDeals]);

  const dealsByStage = stages.map((stage) => ({
    ...stage,
    deals: deals.filter((d) => d.stage === stage.key),
  }));

  const totalValue = deals.filter((d) => !["closed_won", "closed_lost"].includes(d.stage)).reduce((sum, d) => sum + (d.deal_value || 0), 0);
  const wonValue = deals.filter((d) => d.stage === "closed_won").reduce((sum, d) => sum + (d.deal_value || 0), 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-full mx-auto space-y-4 sm:space-y-6 pt-16 md:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-3">
            <KanbanSquare size={20} className="text-[var(--color-accent)] sm:w-6 sm:h-6" />
            Deal Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">Pipeline de ventas inmobiliarias</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Pipeline Activo</p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-accent)]">{formatPrice(totalValue)}</p>
          </div>
          <div className="w-px h-8 sm:h-10 bg-[var(--color-border-default)]" />
          <div className="text-right">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Cerrados</p>
            <p className="text-base sm:text-lg font-bold text-[var(--color-success)]">{formatPrice(wonValue)}</p>
          </div>
        </div>
      </div>

      {/* Stage indicator bar */}
      <div className="flex items-center gap-1 py-2">
        {stages.slice(0, -1).map((stage, i) => {
          const count = dealsByStage[i].deals.length;
          return (
            <div key={stage.key} className="flex items-center gap-1 flex-1">
              <div
                className="h-1.5 rounded-full flex-1 transition-all"
                style={{
                  background: count > 0 ? stage.color : "var(--color-bg-hover)",
                  opacity: count > 0 ? 1 : 0.3,
                }}
              />
              {i < stages.length - 2 && (
                <ArrowRight size={10} className="text-[var(--color-text-muted)] flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 min-h-[400px] sm:min-h-[500px] -mx-4 px-4 sm:mx-0 sm:px-0">
        {dealsByStage.map((stageData, si) => (
          <motion.div
            key={stageData.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
            className="kanban-column flex-shrink-0 w-72"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">{stageData.icon}</span>
                <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">{stageData.label}</h3>
              </div>
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: `color-mix(in srgb, ${stageData.color} 15%, transparent)`,
                  color: stageData.color,
                }}
              >
                {stageData.deals.length}
              </span>
            </div>

            {/* Cards */}
            {stageData.deals.map((deal, di) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.05 + di * 0.05 + 0.1 }}
                className="glass-card p-3.5 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors leading-snug pr-2">
                    {deal.title}
                  </h4>
                  {deal.deal_value && (
                    <span className="text-xs font-bold text-[var(--color-accent)] flex-shrink-0">
                      {formatPrice(deal.deal_value)}
                    </span>
                  )}
                </div>

                {/* Lead info */}
                {deal.lead && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center text-[8px] font-bold text-[var(--color-accent)]">
                      {deal.lead.user_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                      <span className="font-medium text-[var(--color-text-secondary)]">{deal.lead.user_name || "Anónimo"}</span>
                      {deal.lead.lead_score > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Target size={8} className="text-[var(--color-success)]" />
                          {deal.lead.lead_score}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Property */}
                {deal.property && (
                  <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-[var(--color-bg-hover)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={deal.property.image_url}
                      alt=""
                      className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-[var(--color-text-primary)] truncate">{deal.property.title}</p>
                      <p className="text-[9px] text-[var(--color-text-muted)]">{formatPrice(deal.property.price)}</p>
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-2 flex-wrap">
                  {deal.next_action && (
                    <span className="text-[9px] text-[var(--color-info)] bg-[var(--color-info-muted)] px-1.5 py-0.5 rounded font-medium truncate max-w-[140px]">
                      {deal.next_action}
                    </span>
                  )}
                  <span className="text-[9px] text-[var(--color-text-muted)] ml-auto">
                    {formatTimeAgo(deal.created_at)}
                  </span>
                </div>

                {/* Quick Actions */}
                {deal.lead?.whatsapp_number && (
                  <div className="mt-2.5 pt-2.5 border-t border-[var(--color-border-default)] flex items-center gap-2">
                    <a
                      href={`https://wa.me/${deal.lead.whatsapp_number.replace(/\D/g, "")}?text=Hola ${deal.lead.user_name || ""}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] font-medium text-[#25D366] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={10} />
                      WhatsApp
                    </a>
                    <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
                      <DollarSign size={10} />
                      {deal.lead.budget_info || "Sin info"}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Empty state */}
            {stageData.deals.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-center py-8">
                <p className="text-[10px] text-[var(--color-text-muted)] italic">Sin deals</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
