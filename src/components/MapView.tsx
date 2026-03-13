"use client";

import { useState, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
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
  distance_km?: number; // calculated from user location
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

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Component to fly the map to a location
function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [map, center, zoom]);
  return null;
}

// GPS Locate Button
function LocateButton({
  onLocate,
  isLocating,
  isActive,
}: {
  onLocate: () => void;
  isLocating: boolean;
  isActive: boolean;
}) {
  return (
    <button
      onClick={onLocate}
      title="Activar mi ubicación"
      style={{
        position: "absolute",
        bottom: "20px",
        right: "12px",
        zIndex: 1000,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: isActive ? "2px solid #22c55e" : "2px solid rgba(255,255,255,0.15)",
        background: isActive
          ? "linear-gradient(135deg, #16a34a, #15803d)"
          : "linear-gradient(135deg, #1a1a2e, #16161f)",
        color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isActive
          ? "0 0 20px rgba(34,197,94,0.4), 0 4px 12px rgba(0,0,0,0.3)"
          : "0 4px 12px rgba(0,0,0,0.3)",
        transition: "all 0.3s ease",
        fontSize: "20px",
      }}
    >
      {isLocating ? (
        <span
          style={{
            width: "18px",
            height: "18px",
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      ) : (
        "📍"
      )}
    </button>
  );
}

export default function MapView({
  points,
  height,
  onLocationChange,
}: {
  points: MapPoint[];
  height?: string;
  onLocationChange?: (lat: number, lng: number) => void;
}) {
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const center: [number, number] =
    points.length > 0
      ? [
          points.reduce((s, p) => s + p.lat, 0) / points.length,
          points.reduce((s, p) => s + p.lng, 0) / points.length,
        ]
      : [-1.83, -78.18];

  const zoom = points.length > 0 ? 7 : 6;

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalización");
      return;
    }

    if (userLocation) {
      // Already located — toggle off
      setUserLocation(null);
      setFlyTarget(null);
      setGeoError(null);
      onLocationChange?.(0, 0);
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        setFlyTarget({ center: loc, zoom: 13 });
        setIsLocating(false);
        onLocationChange?.(loc[0], loc[1]);
      },
      (err) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError("Permiso de ubicación denegado");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError("Ubicación no disponible");
            break;
          case err.TIMEOUT:
            setGeoError("Tiempo de espera agotado");
            break;
          default:
            setGeoError("Error obteniendo ubicación");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, [userLocation, onLocationChange]);

  return (
    <div style={{ position: "relative", height: height || "100%", width: "100%" }}>
      {/* GPS Error Toast */}
      {geoError && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "rgba(220,38,38,0.9)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          ⚠️ {geoError}
        </div>
      )}

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse-ring { 0% { opacity: 0.6; } 50% { opacity: 0.2; } 100% { opacity: 0.6; } }`}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        {flyTarget && <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Mapa Oscuro">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satelital">
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Claro">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* User Location Marker + Radius */}
        {userLocation && (
          <>
            {/* Accuracy radius ring */}
            <Circle
              center={userLocation}
              radius={2000}
              pathOptions={{
                color: "#22c55e",
                fillColor: "#22c55e",
                fillOpacity: 0.06,
                weight: 1,
                dashArray: "6 4",
              }}
            />
            {/* Outer pulse */}
            <CircleMarker
              center={userLocation}
              radius={18}
              pathOptions={{
                color: "#22c55e",
                fillColor: "#22c55e",
                fillOpacity: 0.15,
                weight: 0,
              }}
            />
            {/* Inner dot */}
            <CircleMarker
              center={userLocation}
              radius={8}
              pathOptions={{
                color: "#fff",
                fillColor: "#22c55e",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <div style={{
                  color: "#fff",
                  background: "#16161f",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(34,197,94,0.3)",
                  textAlign: "center",
                }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, marginBottom: "2px" }}>📍 Tu ubicación</p>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                    {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* Property Markers */}
        {points.map((point, idx) => {
          const hasImage = point.image_url && !imgErrors.has(idx);
          const isRich = point.id || point.image_url;
          const scoreColor =
            (point.opportunity_score || 0) >= 75
              ? "#22c55e"
              : (point.opportunity_score || 0) >= 50
              ? "#f5a623"
              : "#60a5fa";

          const distKm = userLocation
            ? haversineKm(userLocation[0], userLocation[1], point.lat, point.lng)
            : point.distance_km;

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
              <Popup maxWidth={300} minWidth={isRich ? 240 : 140}>
                <div
                  style={{
                    color: "#fff",
                    background: "#16161f",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    overflow: "hidden",
                    maxWidth: "calc(100vw - 60px)",
                  }}
                >
                  {/* Photo */}
                  {hasImage && (
                    <div style={{ position: "relative", height: "120px", overflow: "hidden", background: "#0d0d14" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={point.image_url!}
                        alt={point.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={() => setImgErrors((prev) => new Set([...prev, idx]))}
                      />
                      {point.gallery && point.gallery.length > 1 && (
                        <div style={{ position: "absolute", bottom: "6px", right: "6px", background: "rgba(0,0,0,0.7)", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", color: "#fff" }}>
                          📸 {point.gallery.length} fotos
                        </div>
                      )}
                      <div style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(0,0,0,0.75)", borderRadius: "8px", padding: "3px 10px", fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                        {formatPrice(point.price)}
                      </div>
                      {/* Distance badge */}
                      {distKm !== undefined && (
                        <div style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(34,197,94,0.85)", borderRadius: "6px", padding: "2px 8px", fontSize: "10px", fontWeight: 700, color: "#fff" }}>
                          📍 {distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div style={{ padding: "12px 14px" }}>
                    <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "2px", lineHeight: "1.3" }}>
                      {point.title}
                    </p>

                    {!hasImage && (
                      <>
                        <p style={{ fontSize: "16px", fontWeight: 700, color: colorMap[point.type], marginTop: "4px" }}>
                          {formatPrice(point.price)}
                        </p>
                        {distKm !== undefined && (
                          <p style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600, marginTop: "2px" }}>
                            📍 {distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`} de ti
                          </p>
                        )}
                      </>
                    )}

                    {/* Location + Type */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", fontSize: "10px", color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
                      {point.city && <span>📍 {point.city}</span>}
                      {point.property_type && (
                        <span style={{ background: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: "4px" }}>
                          {typeLabels[point.property_type] || point.property_type}
                        </span>
                      )}
                      <span style={{ color: colorMap[point.type], fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {point.type === "own" ? "Propia" : point.type === "opportunity" ? "⚡ Oportunidad" : "Mercado"}
                      </span>
                    </div>

                    {/* Metrics Row */}
                    {(point.bedrooms || point.area_m2 || point.price_per_m2) && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "10px", fontSize: "11px", flexWrap: "wrap" }}>
                        {point.bedrooms !== undefined && point.bedrooms > 0 && (
                          <div style={{ background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: "6px", color: "rgba(255,255,255,0.7)" }}>
                            🛏️ {point.bedrooms}
                          </div>
                        )}
                        {point.area_m2 && (
                          <div style={{ background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: "6px", color: "rgba(255,255,255,0.7)" }}>
                            📐 {point.area_m2}m²
                          </div>
                        )}
                        {point.price_per_m2 && (
                          <div style={{ background: "rgba(255,255,255,0.06)", padding: "4px 8px", borderRadius: "6px", color: "rgba(255,255,255,0.7)" }}>
                            💲 ${point.price_per_m2}/m²
                          </div>
                        )}
                      </div>
                    )}

                    {/* Opportunity Score Bar */}
                    {point.opportunity_score !== undefined && point.opportunity_score !== null && point.opportunity_score > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "4px" }}>
                          <span style={{ color: "rgba(255,255,255,0.5)" }}>Score de Oportunidad</span>
                          <span style={{ fontWeight: 700, color: scoreColor }}>{point.opportunity_score}/100</span>
                        </div>
                        <div style={{ height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${point.opportunity_score}%`, borderRadius: "3px", background: scoreColor, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    )}

                    {/* Days on Market */}
                    {point.days_on_market !== undefined && point.days_on_market > 0 && (
                      <div style={{ marginTop: "8px", fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                        ⏱️ {point.days_on_market} días en mercado
                      </div>
                    )}

                    {/* Action button */}
                    {point.id && point.type === "own" && (
                      <Link
                        href={`/dashboard/properties/${point.id}`}
                        style={{
                          display: "block", marginTop: "10px", textAlign: "center", padding: "6px 0",
                          borderRadius: "8px", background: "linear-gradient(135deg, #d4a853, #c49a3c)",
                          color: "#16161f", fontSize: "11px", fontWeight: 700, textDecoration: "none",
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

      {/* GPS Button */}
      <LocateButton onLocate={handleLocate} isLocating={isLocating} isActive={!!userLocation} />

      {/* Active Location Badge */}
      {userLocation && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "12px",
            zIndex: 1000,
            background: "rgba(22,163,74,0.9)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "10px",
            fontSize: "11px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff", animation: "pulse-ring 2s ease infinite" }} />
          GPS Activo
        </div>
      )}
    </div>
  );
}
