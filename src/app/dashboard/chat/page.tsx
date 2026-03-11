"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import {
  Send,
  Bot,
  User,
  MapPin,
  BedDouble,
  DollarSign,
  Sparkles,
  Loader2,
} from "lucide-react";

type Property = {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  image_url: string;
  area_m2: number | null;
};

type Message = {
  id: number;
  role: "user" | "bot";
  text: string;
  properties?: Property[];
};

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

export default function AIChatPage() {
  const { workspaceId } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "bot",
      text: "¡Hola! Soy tu **AI Sales Advisor** de PROPLAB. Conozco tu inventario, el mercado y tus leads. ¿En qué puedo ayudarte?\n\nPuedes preguntarme cosas como:\n- \"¿Qué propiedades tengo en Samborondón?\"\n- \"Genera una descripción para la villa frente al mar\"\n- \"¿Cuál es el precio promedio en Quito?\"\n- \"Redacta un mensaje de WhatsApp para Carlos Mendoza\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { id: Date.now(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, workspaceId }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: data.text || "Lo siento, no pude procesar tu solicitud.",
          properties: data.properties,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: "⚠️ Error al conectar con el servidor. Verifica tus API keys en `.env.local`.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-[var(--color-border-default)] px-6 py-4 glass flex items-center gap-3">
        <div className="w-9 h-9 gradient-accent rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles size={18} className="text-[var(--color-bg-primary)]" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-[var(--color-text-primary)]">AI Sales Advisor</h1>
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Powered by GPT-4o • Contexto: tu inventario + mercado</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-[var(--color-bg-card)] border border-[var(--color-border-default)]"
                    : "gradient-accent shadow-lg"
                }`}>
                  {msg.role === "user" ? (
                    <User size={14} className="text-[var(--color-text-secondary)]" />
                  ) : (
                    <Bot size={14} className="text-[var(--color-bg-primary)]" />
                  )}
                </div>

                {/* Bubble + Properties */}
                <div className={`flex flex-col gap-3 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user" ? "chat-bubble-user" : "chat-bubble-bot"
                  }`}>
                    {msg.text}
                  </div>

                  {/* Properties */}
                  {msg.properties && msg.properties.length > 0 && (
                    <div className="flex flex-col gap-3 w-full">
                      {msg.properties.map((prop, idx) => (
                        <motion.div
                          key={prop.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 + 0.15 }}
                          className="flex flex-col sm:flex-row glass-card overflow-hidden group"
                        >
                          <div className="relative h-32 sm:h-auto sm:w-36 bg-[var(--color-bg-hover)] overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prop.image_url}
                              alt={prop.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-lg text-[11px] font-bold text-white border border-white/10">
                              {formatPrice(prop.price)}
                            </div>
                          </div>
                          <div className="p-3.5 flex flex-col justify-center flex-1">
                            <h3 className="font-semibold text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                              {prop.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-[var(--color-text-muted)] text-xs">
                              <MapPin size={11} />
                              {prop.location}
                            </div>
                            <div className="flex items-center gap-3 mt-2.5 text-xs text-[var(--color-text-secondary)]">
                              {prop.bedrooms > 0 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-bg-hover)]">
                                  <BedDouble size={11} className="text-[var(--color-accent)]" />
                                  {prop.bedrooms}
                                </span>
                              )}
                              {prop.area_m2 && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--color-bg-hover)]">
                                  <DollarSign size={11} className="text-[var(--color-success)]" />
                                  {prop.area_m2}m²
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Loading */}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl gradient-accent flex items-center justify-center shadow-lg">
                  <Bot size={14} className="text-[var(--color-bg-primary)]" />
                </div>
                <div className="chat-bubble-bot px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[var(--color-accent)]" />
                  <span className="text-xs text-[var(--color-text-muted)]">Analizando...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--color-border-default)] p-4 sm:p-6 glass">
        <div className="max-w-3xl mx-auto relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); handleTextareaInput(); }}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntame sobre propiedades, leads, mercado, o pídeme generar contenido..."
            rows={1}
            className="input-field pr-14 resize-none leading-normal"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 w-10 h-10 gradient-accent rounded-xl flex items-center justify-center text-[var(--color-bg-primary)] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_15px_rgba(212,168,83,0.2)] transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
