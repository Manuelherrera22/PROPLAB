"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useStore, type SmartAlert } from "@/store/useStore";
import { getSupabase } from "@/lib/supabase";
import {
  Bell,
  Target,
  Users,
  TrendingUp,
  Settings,
  Check,
  Clock,
} from "lucide-react";

const typeIcons: Record<string, typeof Target> = {
  opportunity: Target,
  lead: Users,
  market: TrendingUp,
  system: Settings,
};

const typeColors: Record<string, string> = {
  opportunity: "var(--color-warning)",
  lead: "var(--color-success)",
  market: "var(--color-info)",
  system: "var(--color-text-muted)",
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

export default function AlertsPage() {
  const { workspaceId, alerts, setAlerts } = useStore();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    async function loadAlerts() {
      const { data } = await supabase!
        .from("smart_alerts")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      if (data) setAlerts(data as SmartAlert[]);
    }
    loadAlerts();

    const channel = supabase
      .channel("alerts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "smart_alerts" }, () => {
        loadAlerts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workspaceId, setAlerts]);

  const markAsRead = async (id: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("smart_alerts").update({ is_read: true }).eq("id", id);
    setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  const markAllAsRead = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("smart_alerts").update({ is_read: true }).eq("workspace_id", workspaceId).eq("is_read", false);
    setAlerts(alerts.map(a => ({ ...a, is_read: true })));
  };

  const unread = alerts.filter(a => !a.is_read).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-4 sm:space-y-6 pt-16 md:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-3">
            <Bell size={20} className="text-[var(--color-accent)] sm:w-6 sm:h-6" />
            Alertas Inteligentes
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            {unread > 0 ? `${unread} sin leer` : "Todas leídas"} · {alerts.length} total
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--color-accent)] bg-[var(--color-accent-muted)] rounded-xl border border-[rgba(212,168,83,0.12)] hover:border-[rgba(212,168,83,0.3)] transition-colors"
          >
            <Check size={14} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={32} className="text-[var(--color-text-muted)] mx-auto mb-3 opacity-30" />
          <p className="text-sm text-[var(--color-text-muted)]">No hay alertas</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Las alertas se generan automáticamente cuando se detectan oportunidades o nuevos leads.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = typeIcons[alert.type] || Bell;
            const color = typeColors[alert.type] || "var(--color-text-muted)";

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-card p-4 flex items-start gap-4 transition-all cursor-pointer ${
                  !alert.is_read ? "border-l-2" : ""
                }`}
                style={{ borderLeftColor: !alert.is_read ? color : undefined }}
                onClick={() => !alert.is_read && markAsRead(alert.id)}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
                >
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm font-semibold ${!alert.is_read ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>
                      {alert.title}
                    </h3>
                    {!alert.is_read && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-[var(--color-text-muted)]">
                    <Clock size={10} />
                    {formatTimeAgo(alert.created_at)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
