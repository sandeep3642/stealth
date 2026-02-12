"use client";

import React, { useEffect, useMemo, useState } from "react";
import FleetMap from "@/components/maps/FleetMap";
import type { Vehicle, RoutePoint } from "@/lib/mapTypes";
import { getLiveTrackingData } from "@/services/liveTrackingService";
import { useRouter } from "next/navigation";

// Helper: safely convert to number
function toNum(value: any): number | undefined {
  if (value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

// Normalize vehicle data
function normalizeVehicle(item: any): Vehicle | null {
  const lat = toNum(item.latitude) ?? toNum(item.lat) ?? toNum(item.Latitude) ?? toNum(item.Lat) ?? toNum(item.LAT);
  const lng = toNum(item.longitude) ?? toNum(item.lng) ?? toNum(item.lon) ?? toNum(item.Longitude) ?? toNum(item.Lng) ?? toNum(item.LNG);
  if (lat === undefined || lng === undefined || (lat === 0 && lng === 0)) return null;
  const id = item.vehicleNo || item.deviceNo || item.imei || item.id || item.deviceId || `${lat},${lng}`;
  return {
    id,
    name: id,
    lat,
    lng,
    speed: toNum(item.speed ?? item.Speed),
    heading: toNum(item.direction ?? item.heading ?? item.Dir ?? item.bearing),
    timestamp: item.gpsDate ?? item.timestamp ?? item.gpsTime,
    status: item.ignition ? "ignition-on" : "ignition-off",
    ...item,
  };
}

// Fetch vehicles
async function fetchVehicles(): Promise<Vehicle[]> {
  const redisKey = "dashboard::HR29CA6032";
  try {
    let data = await getLiveTrackingData(redisKey);
    if (data && typeof data === "object" && "ok" in data && "data" in data) data = data.data;
    if (data && typeof data === "object" && data.value && typeof data.value === "string") {
      try { data = JSON.parse(data.value); } catch { return []; }
    }
    const arr = Array.isArray(data) ? data : [data];
    return arr.map(normalizeVehicle).filter((v) => v !== null) as Vehicle[];
  } catch {
    return [];
  }
}

// Fetch route
async function fetchRoute(vehicleId: string): Promise<RoutePoint[]> {
  const baseUrl = process.env.NEXT_PUBLIC_VTS_API_BASE_URL || "http://localhost:57678";
  const res = await fetch(`${baseUrl}/api/vehicles/${encodeURIComponent(vehicleId)}/route`, { cache: "no-store" });
  return await res.json();
}

// Status categories
const STATUS_CATEGORIES = [
  { key: "all", label: "All", icon: "🚗" },
  { key: "moving", label: "Moving", icon: "➡️" },
  { key: "idling", label: "Idling", icon: "🕒" },
  { key: "parked", label: "Parked", icon: "🅿️" },
  { key: "offline", label: "Offline", icon: "⛔" },
  { key: "breakdown", label: "Breakdown", icon: "🔧" },
  { key: "expired", label: "Expired", icon: "⏰" },
];

function getStatusCounts(vehicles: Vehicle[]) {
  const counts: Record<string, number> = {
    all: vehicles.length,
    moving: 0,
    idling: 0,
    parked: 0,
    offline: 0,
    breakdown: 0,
    expired: 0,
  };
  vehicles.forEach((v) => {
    if (v.status === "moving") counts.moving++;
    else if (v.status === "idling") counts.idling++;
    else if (v.status === "parked") counts.parked++;
    else if (v.status === "offline") counts.offline++;
    else if (v.status === "breakdown") counts.breakdown++;
    else if (v.status === "expired") counts.expired++;
  });
  return counts;
}

export default function LiveTrackingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchVehicles().then(setVehicles);
  }, []);

  const filteredVehicles = useMemo(() => {
    let list = vehicles;
    if (filter !== "all") list = list.filter((v) => v.status === filter);
    if (search) list = list.filter((v) => v.name?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [vehicles, filter, search]);

  const statusCounts = useMemo(() => getStatusCounts(vehicles), [vehicles]);

  // Select first vehicle by default
  useEffect(() => {
    if (!selected && filteredVehicles.length) setSelected(filteredVehicles[0]);
  }, [filteredVehicles, selected]);

  return (
    <div style={{ padding: 24, fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <button onClick={() => router.back()} style={{ color: "#7c3aed", background: "none", border: "none", fontWeight: 600, marginRight: 16, cursor: "pointer" }}>&larr; Back to Fleet</button>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>FLEET INTELLIGENCE</h1>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {/* Left: Info Card */}
        <div style={{ width: 340, background: "#18181b", color: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px #0001", minHeight: 420 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#00ffb3" }}>LIVE TRACKING</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{selected?.name || "-"}</div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>ACTUAL SPEED</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#00ffb3", marginBottom: 8 }}>{selected?.speed ?? "-"} <span style={{ fontSize: 20 }}>KM/H</span></div>
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: "#aaa" }}>HEADING</div>
              <div style={{ fontWeight: 700 }}>{selected?.heading ?? "-"}&deg;</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#aaa" }}>ODOMETER</div>
              <div style={{ fontWeight: 700 }}>{selected?.odometer ?? "-"} KM</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 4 }}>LAST POSITIONS</div>
          <div style={{ fontSize: 13, background: "#23232a", borderRadius: 8, padding: 8, minHeight: 60, maxHeight: 80, overflowY: "auto" }}>
            {selected?.lastPositions?.slice?.(0, 3)?.map?.((pos: any, idx: number) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "#b3b3b3", fontSize: 13 }}>
                <span>{pos.lat}, {pos.lng}</span>
                <span>{pos.timeAgo || "-"}</span>
              </div>
            )) || <div>-</div>}
          </div>
        </div>
        {/* Right: Main Content */}
        <div style={{ flex: 1 }}>
          {/* Status Summary Bar */}
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            {STATUS_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                style={{
                  background: filter === cat.key ? "#ede9fe" : "#fff",
                  color: filter === cat.key ? "#7c3aed" : "#222",
                  border: "none",
                  borderRadius: 12,
                  padding: "8px 18px",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: filter === cat.key ? "0 2px 8px #7c3aed22" : undefined,
                  cursor: "pointer",
                  outline: "none",
                  transition: "all .15s"
                }}
              >
                <span style={{ marginRight: 6 }}>{cat.icon}</span>
                {cat.label} <span style={{ marginLeft: 4, fontWeight: 600 }}>{statusCounts[cat.key]}</span>
              </button>
            ))}
          </div>
          {/* Search and Filter Bar */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16, gap: 12 }}>
            <input
              type="text"
              placeholder="Search plate or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 15, width: 260 }}
            />
            <button style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Filter</button>
            <div style={{ flex: 1 }} />
            <button style={{ background: "#00ffb3", color: "#18181b", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>LIVE STREAM ACTIVE</button>
          </div>
          {/* Map Section */}
          <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px #0001" }}>
            <FleetMap
              fetchVehicles={async () => filteredVehicles}
              fetchRoute={fetchRoute}
              pollMs={3000}
              height="60vh"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
