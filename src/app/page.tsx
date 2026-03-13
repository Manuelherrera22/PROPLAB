"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ArrowRight, BarChart3, Brain, Target, Zap, Smartphone, Download, X } from "lucide-react";

const features = [
  { icon: BarChart3, title: "Market Intelligence", desc: "Mapa de calor con precios/m² por zona y detector de oportunidades." },
  { icon: Brain, title: "AI Sales Advisor", desc: "Chat con IA que conoce tu inventario, el mercado y tus leads." },
  { icon: Target, title: "Deal Tracker", desc: "Pipeline Kanban de ventas con scoring automático de leads." },
  { icon: Zap, title: "Arbitrage Engine", desc: "Scraping de portales + IA detecta propiedades subvaloradas." },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }>; }

export default function LandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const mobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua);
    setIsMobile(mobile);
    setIsIOS(ios);

    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (mobile) {
      const timer = setTimeout(() => setShowInstallBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setShowInstallBanner(false);
        }
      } catch {
        // prompt may have already been used
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else if (isMobile) {
      // Android without deferred prompt — show manual guide
      setShowAndroidGuide(true);
    } else {
      // Desktop — show iOS guide as generic guide
      setShowIOSGuide(true);
    }
  };

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

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 gradient-accent rounded-2xl text-[var(--color-bg-primary)] font-semibold text-sm sm:text-base shadow-lg hover:shadow-[0_0_30px_rgba(212,168,83,0.25)] transition-all duration-300 group"
          >
            Entrar al Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Mobile Download Button */}
          <button
            onClick={handleInstall}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)]/80 backdrop-blur-md text-[var(--color-text-primary)] font-semibold text-sm hover:border-[var(--color-accent)]/30 hover:bg-[var(--color-bg-hover)] transition-all duration-300 group"
          >
            <Smartphone size={16} className="text-[var(--color-accent)]" />
            {isMobile ? "Instalar App" : "Descargar en Móvil"}
            <Download size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
          </button>
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

      {/* Mobile Install Banner — slides up on mobile */}
      <AnimatePresence>
        {showInstallBanner && isMobile && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom"
          >
            <div className="max-w-lg mx-auto rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-default)] p-4 shadow-2xl backdrop-blur-xl flex items-center gap-4">
              <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={22} className="text-[var(--color-bg-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-text-primary)]">Instala PROPLAB</p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  Acceso rápido desde tu pantalla de inicio
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 gradient-accent rounded-xl text-[var(--color-bg-primary)] text-xs font-bold"
                >
                  Instalar
                </button>
                <button onClick={() => setShowInstallBanner(false)} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Install Guide Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Smartphone size={18} className="text-[var(--color-accent)]" />
                  Instalar en iPhone
                </h3>
                <button onClick={() => setShowIOSGuide(false)} className="text-[var(--color-text-muted)]">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-[var(--color-bg-primary)] flex-shrink-0">1</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Toca el botón Compartir</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">El ícono con la flecha hacia arriba ↑ en Safari</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-[var(--color-bg-primary)] flex-shrink-0">2</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Agregar a Pantalla de Inicio</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Desliza hacia abajo y selecciona esta opción</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-[var(--color-bg-primary)] flex-shrink-0">3</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Toca &quot;Agregar&quot;</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">PROPLAB se instalará como una app en tu iPhone</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full mt-5 py-2.5 gradient-accent rounded-xl text-[var(--color-bg-primary)] text-sm font-bold"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android Install Guide Modal */}
      <AnimatePresence>
        {showAndroidGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAndroidGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Smartphone size={18} className="text-[var(--color-accent)]" />
                  Instalar en Android
                </h3>
                <button onClick={() => setShowAndroidGuide(false)} className="text-[var(--color-text-muted)]">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-[var(--color-bg-primary)] flex-shrink-0">1</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Abre el menú de Chrome</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Toca los 3 puntos ⋮ en la esquina superior derecha</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-[var(--color-bg-primary)] flex-shrink-0">2</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Instalar aplicación</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Selecciona &quot;Instalar app&quot; o &quot;Agregar a pantalla de inicio&quot;</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-[var(--color-bg-primary)] flex-shrink-0">3</div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Confirmar instalación</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">PROPLAB aparecerá como app en tu pantalla de inicio</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="w-full mt-5 py-2.5 gradient-accent rounded-xl text-[var(--color-bg-primary)] text-sm font-bold"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
