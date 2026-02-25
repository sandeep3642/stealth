"use client";

import React, { useCallback, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { Filter, Layers, Settings } from "lucide-react";
import GeofenceMap from "@/components/GeofenceMap";
import DefineNewZoneModal from "@/components/DefineNewZoneModal";
import type { GeofenceZone, ZoneStatus } from "@/interfaces/geofence.interface";

/* ──────────────────────── constants ──────────────────────── */

const LIBRARIES: ("drawing" | "geometry")[] = ["drawing", "geometry"];

const MOCK_ZONES: GeofenceZone[] = [
  {
    id: "1",
    code: "GF-001",
    displayName: "Main Logistics Hub",
    classification: "Warehouse",
    geometry: "circle",
    status: "enabled",
    color: "#6366f1",
    center: { lat: 28.7041, lng: 77.1025 },
    radius: 3000,
  },
  {
    id: "2",
    code: "GF-002",
    displayName: "Delhi Airport Zone",
    classification: "Port",
    geometry: "circle",
    status: "enabled",
    color: "#10b981",
    center: { lat: 28.5562, lng: 77.1 },
    radius: 2500,
  },
  {
    id: "3",
    code: "GF-003",
    displayName: "NH-48 Service Corridor",
    classification: "Client Site",
    geometry: "polygon",
    status: "disabled",
    color: "#ef4444",
    paths: [
      { lat: 28.45, lng: 77.02 },
      { lat: 28.46, lng: 77.09 },
      { lat: 28.42, lng: 77.12 },
      { lat: 28.41, lng: 77.05 },
    ],
  },
];

const STATUS_STYLE: Record<ZoneStatus, string> = {
  enabled: "bg-emerald-100 text-emerald-700",
  disabled: "bg-red-100 text-red-700",
};

/* ──────────────────────── component ──────────────────────── */

export default function GeofencePage() {
  const { isDark } = useTheme();
  const router = useRouter();

  const [zones, setZones] = useState<GeofenceZone[]>(MOCK_ZONES);
  const [searchQuery, setSearchQuery] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"circle" | "polygon">("polygon");
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    libraries: LIBRARIES,
  });

  const onMapLoad = useCallback((m: google.maps.Map) => setMap(m), []);

  const filtered = zones.filter((z) => {
    const q = (tableSearch || searchQuery).toLowerCase();
    return (
      z.displayName.toLowerCase().includes(q) ||
      z.code.toLowerCase().includes(q) ||
      z.classification.toLowerCase().includes(q)
    );
  });

  const handleSaveZone = (zone: GeofenceZone) => {
    setZones((prev) => [...prev, zone]);
    setIsModalOpen(false);
  };

  const openModal = (mode: "circle" | "polygon") => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className={`${isDark ? "dark" : ""} flex flex-col mt-10`}>
      {/* ── Top bar ── */}
      <header
        className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 ${
          isDark ? "bg-background border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <span
          className={`text-xl font-black tracking-tight ${isDark ? "text-foreground" : "text-gray-900"}`}
        >
          GEOFENCE INTELLIGENCE
        </span>

        <nav
          className={`hidden md:flex items-center gap-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
        >
          <button className="hover:underline" onClick={() => router.push("/")}>🏠</button>
          <span>›</span>
          <span>Configurations</span>
          <span>›</span>
          <span className={`font-semibold ${isDark ? "text-foreground" : "text-gray-800"}`}>
            Geofence Library
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <button
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isDark
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter Library
          </button>
          <button
            onClick={() => openModal("circle")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors"
          >
            ⊙ NEW CIRCLE
          </button>
          <button
            onClick={() => openModal("polygon")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${
              isDark
                ? "border-gray-300 text-gray-300 hover:bg-gray-800"
                : "border-gray-900 text-gray-900 hover:bg-gray-100"
            }`}
          >
            ⬠ NEW POLYGON
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Zone Registry ── */}
        <aside
          className={`w-[460px] flex-shrink-0 flex flex-col border-r ${
            isDark ? "bg-background border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          {/* Panel header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b ${
              isDark ? "border-gray-800" : "border-gray-100"
            }`}
          >
            <h2
              className={`text-sm font-black tracking-widest ${isDark ? "text-foreground" : "text-gray-900"}`}
            >
              ZONE REGISTRY
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {filtered.length} Records
            </span>
          </div>

          {/* Main search */}
          <div className={`px-4 py-3 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search registry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 text-sm rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
              />
            </div>
          </div>

          {/* Table toolbar */}
          <div
            className={`flex items-center gap-2 px-4 py-2 border-b text-xs ${
              isDark ? "border-gray-800 text-gray-400" : "border-gray-100 text-gray-500"
            }`}
          >
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search across all fields..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className={`w-full pl-7 pr-3 py-1.5 text-xs rounded border ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-foreground"
                    : "bg-white border-gray-200 text-gray-700"
                } focus:outline-none`}
              />
            </div>
            <span>VIEW</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className={`border rounded px-2 py-1 text-xs ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-foreground"
                  : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <button
              className={`flex items-center gap-1 border rounded px-2 py-1 text-xs ${
                isDark ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"
              }`}
            >
              ⊞ Columns ▾
            </button>
          </div>

          {/* Table head */}
          <div
            className={`grid grid-cols-3 px-4 py-2 text-[10px] font-black tracking-widest border-b ${
              isDark ? "text-gray-500 border-gray-800" : "text-gray-400 border-gray-100"
            }`}
          >
            <span>GEOFENCE IDENTITY</span>
            <span className="text-center">GEOMETRY</span>
            <span className="text-right">STATUS</span>
          </div>

          {/* Zone rows */}
          <div className="flex-1 overflow-y-auto">
            {filtered.slice(0, pageSize).map((zone) => (
              <div
                key={zone.id}
                className={`grid grid-cols-3 items-center px-4 py-3 border-b cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                  isDark ? "border-gray-800" : "border-gray-100"
                }`}
                onClick={() => {
                  if (map && zone.center) map.panTo(zone.center);
                  router.push(`/geofence/${zone.id}`);
                }}
              >
                {/* Identity */}
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: zone.color }}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${isDark ? "text-foreground" : "text-gray-900"}`}>
                      {zone.displayName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        {zone.code}
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {zone.classification.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Geometry icon */}
                <div className="flex justify-center">
                  <span className={`text-xl ${isDark ? "text-gray-500" : "text-gray-300"}`}>
                    {zone.geometry === "circle" ? "○" : "⬠"}
                  </span>
                </div>

                {/* Status */}
                <div className="flex justify-end">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${STATUS_STYLE[zone.status]}`}>
                    {zone.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <span className="text-4xl mb-2">🗺</span>
                <p className="text-sm">No zones found</p>
              </div>
            )}
          </div>

          {/* Pagination footer */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-t text-xs ${
              isDark ? "border-gray-800 text-gray-500" : "border-gray-100 text-gray-500"
            }`}
          >
            <span>
              SHOWING {Math.min(filtered.length, pageSize)} OF {zones.length} RECORDS
            </span>
            <div className="flex items-center gap-2">
              <span>PAGE 1 / {Math.ceil(filtered.length / pageSize) || 1}</span>
              <button className="w-7 h-7 rounded bg-indigo-600 text-white font-bold flex items-center justify-center">
                1
              </button>
            </div>
          </div>
        </aside>

        {/* ── Right: Map ── */}
        <main className="flex-1 relative">
          {isLoaded ? (
            <GeofenceMap zones={zones} isDark={isDark} onMapLoad={onMapLoad} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            </div>
          )}

          {/* Draw toolbar (top-left) */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg px-2 py-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white text-sm">
              ✦
            </button>
            <button
              onClick={() => openModal("circle")}
              title="New Circle"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 text-base"
            >
              ○
            </button>
            <button
              onClick={() => openModal("polygon")}
              title="New Polygon"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 text-base"
            >
              ⬠
            </button>
          </div>

          {/* Top-right utility buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500 dark:text-gray-300">
              ⤢
            </button>
            <button className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500 dark:text-gray-300">
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-8 right-3 flex flex-col gap-1">
            <button
              onClick={() => map?.setZoom((map.getZoom() ?? 11) + 1)}
              className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-700 dark:text-gray-300 font-bold text-lg"
            >
              +
            </button>
            <button
              onClick={() => map?.setZoom((map.getZoom() ?? 11) - 1)}
              className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-700 dark:text-gray-300 font-bold text-lg"
            >
              −
            </button>
          </div>

          {/* Settings FAB */}
          <button className="absolute bottom-8 right-14 w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </main>
      </div>

      {/* ── Create modal ── */}
      {isModalOpen && (
        <DefineNewZoneModal
          defaultGeometry={modalMode}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveZone}
          existingZonesCount={zones.length}
        />
      )}
    </div>
  );
}