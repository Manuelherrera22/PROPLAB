"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, ArrowRight, BarChart3, Brain, Target, Zap } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Market Intelligence", desc: "Mapa de calor con precios/m² por zona y detector de oportunidades." },
  { icon: Brain, title: "AI Sales Advisor", desc: "Chat con IA que conoce tu inventario, el mercado y tus leads." },
  { icon: Target, title: "Deal Tracker", desc: "Pipeline Kanban de ventas con scoring automático de leads." },
  { icon: Zap, title: "Arbitrage Engine", desc: "Scraping de portales + IA detecta propiedades subvaloradas." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden gradient-bg px-4 sm:px-6 py-12 sm:py-0">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent)] opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-info)] opacity-[0.02] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-center max-w-3xl"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 gradient-accent rounded-2xl flex items-center justify-center shadow-lg accent-glow">
            <Building2 size={24} className="text-[var(--color-bg-primary)] sm:w-7 sm:h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            PROP<span className="text-[var(--color-accent)]">LAB</span>
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg sm:text-xl text-[var(--color-text-secondary)] mb-4 leading-relaxed"
        >
          Motor de Inteligencia Artificial para el{" "}
          <span className="text-[var(--color-text-primary)] font-semibold">Sector Inmobiliario</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-[var(--color-text-muted)] mb-10 max-w-lg mx-auto"
        >
          Scraping inteligente → Análisis de mercado → Valuación IA → Captura de leads → Cierre de ventas.
          Todo en una sola plataforma.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 gradient-accent rounded-2xl text-[var(--color-bg-primary)] font-semibold text-sm sm:text-base shadow-lg hover:shadow-[0_0_30px_rgba(212,168,83,0.25)] transition-all duration-300 group"
          >
            Entrar al Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-20 max-w-5xl w-full"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 + i * 0.1 }}
            className="glass-card p-5 cursor-default"
          >
            <f.icon size={20} className="text-[var(--color-accent)] mb-3" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              {f.title}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Version badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 text-[10px] font-medium text-[var(--color-text-muted)] tracking-widest uppercase"
      >
        Beta v0.1.0 — Powered by AI
      </motion.div>
    </div>
  );
}
