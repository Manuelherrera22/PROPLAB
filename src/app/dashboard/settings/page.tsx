"use client";

import { motion } from "framer-motion";
import { Settings, Key, Building2, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto space-y-6 pt-16 md:pt-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-3">
          <Settings size={24} className="text-[var(--color-accent)]" />
          Configuración
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="space-y-4">
        {[
          { icon: Key, title: "API Keys", desc: "Configura tus claves de OpenAI y Supabase", tag: "Requerido" },
          { icon: Building2, title: "Workspaces", desc: "Gestiona tus proyectos y desarrollos", tag: "1 activo" },
          { icon: Bell, title: "Notificaciones", desc: "Alertas por email, WhatsApp, o push", tag: "Próximamente" },
          { icon: Palette, title: "Apariencia", desc: "Tema oscuro, idioma y preferencias de UI", tag: "Próximamente" },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4 flex items-center gap-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-muted)] flex items-center justify-center flex-shrink-0">
              <item.icon size={18} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</h3>
              <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
            </div>
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-hover)] px-2.5 py-1 rounded-lg">
              {item.tag}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
