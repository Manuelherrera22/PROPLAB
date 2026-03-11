"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  KanbanSquare,
  Bell,
  Settings,
  Menu,
  X,
  Building2,
  ChevronDown,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard, badge: null },
  { href: "/dashboard/intel", label: "Market Intel", icon: BarChart3, badge: null },
  { href: "/dashboard/chat", label: "AI Advisor", icon: MessageSquare, badge: null },
  { href: "/dashboard/deals", label: "Deal Tracker", icon: KanbanSquare, badge: null },
  { href: "/dashboard/alerts", label: "Alertas", icon: Bell, badge: "alerts" as const },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, badge: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { workspaceName, unreadAlerts } = useStore();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-default)] flex items-center justify-center text-[var(--color-text-secondary)] shadow-lg"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[var(--color-bg-secondary)] border-r border-[var(--color-border-default)] flex flex-col transition-transform duration-300 ease-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "var(--sidebar-width)" }}
      >
        {/* Close (mobile) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
        >
          <X size={16} />
        </button>

        {/* Logo */}
        <div className="px-6 pt-7 pb-5 border-b border-[var(--color-border-default)]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shadow-md group-hover:shadow-[0_0_20px_rgba(212,168,83,0.25)] transition-shadow">
              <Building2 size={20} className="text-[var(--color-bg-primary)]" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-[var(--color-text-primary)] leading-none">
                PROP<span className="text-[var(--color-accent)]">LAB</span>
              </h1>
              <p className="text-[9px] font-semibold text-[var(--color-text-muted)] tracking-[0.15em] uppercase mt-1">
                Real Estate Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Workspace */}
        <div className="px-4 pt-5 pb-1">
          <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--color-accent-muted)] border border-[var(--color-border-accent)] hover:bg-[rgba(212,168,83,0.06)] transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] pulse-dot flex-shrink-0" />
              <span className="text-[13px] font-semibold text-[var(--color-accent)] truncate">
                {workspaceName}
              </span>
            </div>
            <ChevronDown size={14} className="text-[var(--color-accent)] opacity-40 group-hover:opacity-80 transition-opacity flex-shrink-0" />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-[9px] font-bold text-[var(--color-text-muted)] tracking-[0.18em] uppercase">
            Plataforma
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group relative ${
                  active
                    ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)] shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                }`}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--color-accent)]" />
                )}
                <item.icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                  className={active ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]"}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge === "alerts" && unreadAlerts > 0 && (
                  <span className="min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-[var(--color-danger)] text-white px-1">
                    {unreadAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[var(--color-border-default)]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--color-bg-hover)]">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Zap size={14} className="text-[var(--color-bg-primary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-[var(--color-text-primary)]">PROPLAB Beta</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">v0.1.0 • MVP</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
