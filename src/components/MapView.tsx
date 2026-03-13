"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  LayersControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

export type MapPoint = {
  lat: number;
  lng: number;
  title: string;
  price: number;
  type: "own" | "market" | "opportunity";
  // Rich data
  id?: string;
  image_url?: string;
  gallery?: string[];
  area_m2?: number | null;
  bedrooms?: number;
  bathrooms?: number;
  price_per_m2?: number | null;
  opportunity_score?: number | null;
  days_on_market?: number;
  city?: string | null;
  property_type?: string;
  source?: string;
  description?: string;
};

const colorMap = {
  own: "#d4a853",
  market: "#60a5fa",
  opportunity: "#f5a623",
};

const typeLabels: Record<string, string> = {
  house: "Casa",
  apartment: "Depto",
  penthouse: "Penthouse",
  land: "Terreno",
  commercial: "Comercial",
  office: "Oficina",
};

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

// Component to recenter map when points change
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapView({
  points,
  height,
}: {
  points: MapPoint[];
  height?: string;
}) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  // Center on Ecuador by default
  const center: [number, number] =
    points.length > 0
      ? [
          points.reduce((s, p) => s + p.lat, 0) / points.length,
          points.reduce((s, p) => s + p.lng, 0) / points.length,
        ]
      : [-1.83, -78.18]; // Center of Ecuador

  const zoom = points.length > 0 ? 7 : 6;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: height || "100%", width: "100%" }}
      zoomControl={true}
    >
      <MapUpdater center={center} zoom={zoom} />

      <LayersControl position="topright">
        {/* Dark Map (default) */}
        <LayersControl.BaseLayer checked name="Mapa Oscuro">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>

        {/* Satellite View */}
        <LayersControl.BaseLayer name="Satelital">
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>

        {/* Light Map */}
        <LayersControl.BaseLayer name="Claro">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      {points.map((point, idx) => {
        const hasImage = point.image_url && !imgErrors.has(idx);
        const isRich = point.id || point.image_url;
        const scoreColor =
          (point.opportunity_score || 0) >= 75
            ? "#22c55e"
            : (point.opportunity_score || 0) >= 50
            ? "#f5a623"
            : "#60a5fa";

        return (
          <CircleMarker
            key={`${point.lat}-${point.lng}-${idx}`}
            center={[point.lat, point.lng]}
            radius={point.type === "opportunity" ? 10 : 7}
            pathOptions={{
              color: colorMap[point.type],
              fillColor: colorMap[point.type],
              fillOpacity: point.type === "opportunity" ? 0.8 : 0.5,
              weight: 2,
            }}
          >
            <Popup maxWidth={320} minWidth={isRich ? 280 : 180}>
              <div
                style={{
                  color: "#fff",
                  background: "#16161f",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  overflow: "hidden",
                  minWidth: isRich ? "280px" : "150px",
                }}
              >
                {/* Photo */}
                {hasImage && (
                  <div
                    style={{
                      position: "relative",
                      height: "140px",
                      overflow: "hidden",
                      background: "#0d0d14",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={point.image_url!}
                      alt={point.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={() => {
                        setImgErrors((prev) => new Set([...prev, idx]));
                      }}
                    />
                    {/* Photo count badge */}
                    {point.gallery && point.gallery.length > 1 && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "6px",
                          right: "6px",
                          background: "rgba(0,0,0,0.7)",
                          backdropFilter: "blur(4px)",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "10px",
                          color: "#fff",
                        }}
                      >
                        📸 {point.gallery.length} fotos
                      </div>
                    )}
                    {/* Price on image */}
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        background: "rgba(0,0,0,0.75)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "8px",
                        padding: "3px 10px",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {formatPrice(point.price)}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: "12px 14px" }}>
                  {/* Title + Price (if no image) */}
                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: "13px",
                      marginBottom: "2px",
                      lineHeight: "1.3",
                    }}
                  >
                    {point.title}
                  </p>

                  {!hasImage && (
                    <p
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: colorMap[point.type],
                        marginTop: "4px",
                      }}
                    >
                      {formatPrice(point.price)}
                    </p>
                  )}

                  {/* Location + Type */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "6px",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {point.city && <span>📍 {point.city}</span>}
                    {point.property_type && (
                      <span
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {typeLabels[point.property_type] || point.property_type}
                      </span>
                    )}
                    <span
                      style={{
                        color: colorMap[point.type],
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {point.type === "own"
                        ? "Propia"
                        : point.type === "opportunity"
                        ? "⚡ Oportunidad"
                        : "Mercado"}
                    </span>
                  </div>

                  {/* Metrics Row */}
                  {(point.bedrooms || point.area_m2 || point.price_per_m2) && (
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "10px",
                        fontSize: "11px",
                      }}
                    >
                      {point.bedrooms !== undefined && point.bedrooms > 0 && (
                        <div
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          🛏️ {point.bedrooms}
                        </div>
                      )}
                      {point.area_m2 && (
                        <div
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          📐 {point.area_m2}m²
                        </div>
                      )}
                      {point.price_per_m2 && (
                        <div
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          💲 ${point.price_per_m2}/m²
                        </div>
                      )}
                    </div>
                  )}

                  {/* Opportunity Score Bar */}
                  {point.opportunity_score !== undefined &&
                    point.opportunity_score !== null &&
                    point.opportunity_score > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "10px",
                            marginBottom: "4px",
                          }}
                        >
                          <span style={{ color: "rgba(255,255,255,0.5)" }}>
                            Score de Oportunidad
                          </span>
                          <span style={{ fontWeight: 700, color: scoreColor }}>
                            {point.opportunity_score}/100
                          </span>
                        </div>
                        <div
                          style={{
                            height: "5px",
                            borderRadius: "3px",
                            background: "rgba(255,255,255,0.08)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${point.opportunity_score}%`,
                              borderRadius: "3px",
                              background: scoreColor,
                              transition: "width 0.5s ease",
                            }}
                          />
                        </div>
                      </div>
                    )}

                  {/* Days on Market */}
                  {point.days_on_market !== undefined &&
                    point.days_on_market > 0 && (
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        ⏱️ {point.days_on_market} días en mercado
                      </div>
                    )}

                  {/* Action button */}
                  {point.id && point.type === "own" && (
                    <Link
                      href={`/dashboard/properties/${point.id}`}
                      style={{
                        display: "block",
                        marginTop: "10px",
                        textAlign: "center",
                        padding: "6px 0",
                        borderRadius: "8px",
                        background:
                          "linear-gradient(135deg, #d4a853, #c49a3c)",
                        color: "#16161f",
                        fontSize: "11px",
                        fontWeight: 700,
                        textDecoration: "none",
                        letterSpacing: "0.3px",
                      }}
                    >
                      Ver Detalle Completo →
                    </Link>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
