"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type MapPoint = {
  lat: number;
  lng: number;
  title: string;
  price: number;
  type: "own" | "market" | "opportunity";
};

const colorMap = {
  own: "#d4a853",
  market: "#60a5fa",
  opportunity: "#f5a623",
};

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export default function MapView({ points }: { points: MapPoint[] }) {
  // Center on Ecuador by default
  const center: [number, number] = points.length > 0
    ? [points.reduce((s, p) => s + p.lat, 0) / points.length, points.reduce((s, p) => s + p.lng, 0) / points.length]
    : [-2.17, -79.92];

  return (
    <MapContainer
      center={center}
      zoom={8}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {points.map((point, idx) => (
        <CircleMarker
          key={idx}
          center={[point.lat, point.lng]}
          radius={point.type === "opportunity" ? 10 : 7}
          pathOptions={{
            color: colorMap[point.type],
            fillColor: colorMap[point.type],
            fillOpacity: point.type === "opportunity" ? 0.7 : 0.5,
            weight: 2,
          }}
        >
          <Popup>
            <div style={{ color: "#fff", background: "#16161f", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", minWidth: "150px" }}>
              <p style={{ fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>{point.title}</p>
              <p style={{ fontSize: "15px", fontWeight: 700, color: colorMap[point.type] }}>{formatPrice(point.price)}</p>
              <p style={{ fontSize: "10px", marginTop: "4px", opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {point.type === "own" ? "Tu inventario" : point.type === "opportunity" ? "⚡ Oportunidad" : "Mercado"}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
