"use client";

import React, { useCallback, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Layers, Settings } from "lucide-react";
import GeofenceMap from "@/components/GeofenceMap";
import type {
    GeofenceZone,
    GeometryType,
    ZoneClassification,
    ZoneStatus,
} from "@/interfaces/geofence.interface";

/* ──────────────────────────── constants ──────────────────────────── */

const LIBRARIES: ("drawing" | "geometry")[] = ["drawing", "geometry"];

const PRESET_COLORS = [
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
    "#ec4899", "#6b7280",
];

const CLASSIFICATIONS: ZoneClassification[] = [
    "Warehouse", "Port", "Client Site", "Depot", "Restricted Area",
];

// Replace with your real API service call
async function fetchZoneById(id: string): Promise<GeofenceZone | null> {
    const MOCK: Record<string, GeofenceZone> = {
        "1": {
            id: "1", code: "GF-001", displayName: "Main Logistics Hub",
            classification: "Warehouse", geometry: "circle", status: "enabled",
            color: "#6366f1", center: { lat: 28.7041, lng: 77.1025 }, radius: 3000,
        },
        "2": {
            id: "2", code: "GF-002", displayName: "Delhi Airport Zone",
            classification: "Port", geometry: "circle", status: "enabled",
            color: "#10b981", center: { lat: 28.5562, lng: 77.1 }, radius: 2500,
        },
        "3": {
            id: "3", code: "GF-003", displayName: "NH-48 Service Corridor",
            classification: "Client Site", geometry: "polygon", status: "disabled",
            color: "#ef4444",
            paths: [
                { lat: 28.45, lng: 77.02 }, { lat: 28.46, lng: 77.09 },
                { lat: 28.42, lng: 77.12 }, { lat: 28.41, lng: 77.05 },
            ],
        },
    };
    return MOCK[id] ?? null;
}

/* ──────────────────────────── component ──────────────────────────── */

export default function GeofenceDetailPage() {
    const { isDark } = useTheme();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [zone, setZone] = useState<GeofenceZone | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    // Editable state
    const [code, setCode] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [classification, setClassification] = useState<ZoneClassification>("Warehouse");
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [geometry, setGeometry] = useState<GeometryType>("polygon");
    const [status, setStatus] = useState<ZoneStatus>("enabled");

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        libraries: LIBRARIES,
    });

    // Load zone once
    React.useEffect(() => {
        fetchZoneById(id).then((z) => {
            if (z) {
                setZone(z);
                setCode(z.code);
                setDisplayName(z.displayName);
                setClassification(z.classification);
                setColor(z.color);
                setGeometry(z.geometry);
                setStatus(z.status);
            }
            setLoading(false);
        });
    }, [id]);

    const onMapLoad = useCallback(
        (m: google.maps.Map) => {
            setMap(m);
            if (zone?.center) m.panTo(zone.center);
        },
        [zone],
    );

    const handleSave = async () => {
        setSaving(true);
        // TODO: call your updateGeofence(id, payload) service here
        await new Promise((r) => setTimeout(r, 800));
        setSaving(false);
        router.push("/geofence");
    };

    /* ── style helpers ── */
    const inputCls = `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${isDark
            ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
            : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
        }`;
    const labelCls = `block text-[10px] font-bold tracking-widest mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"
        }`;

    /* ── loading / not found ── */
    if (loading) {
        return (
            <div className={`${isDark ? "dark" : ""} flex items-center justify-center h-screen`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Loading zone…</p>
                </div>
            </div>
        );
    }

    if (!zone) {
        return (
            <div className={`${isDark ? "dark" : ""} flex items-center justify-center h-screen`}>
                <div className="text-center text-gray-400">
                    <p className="text-5xl mb-3">🗺</p>
                    <p className="font-semibold text-lg">Zone not found</p>
                    <button
                        onClick={() => router.push("/geofence")}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold"
                    >
                        Back to Library
                    </button>
                </div>
            </div>
        );
    }

    // Live preview zone with current edits
    const previewZone: GeofenceZone = {
        ...zone,
        code,
        displayName,
        classification,
        color,
        geometry,
        status,
    };

    /* ── main render ── */
    return (
        <div className={`${isDark ? "dark" : ""} flex flex-col mt-10`}>
            {/* ── Header ── */}
            <header
                className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 ${isDark ? "bg-background border-gray-800" : "bg-white border-gray-200"
                    }`}
            >
                {/* Left: back + title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/geofence")}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isDark ? "text-gray-400 hover:text-foreground" : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <span className={isDark ? "text-gray-700" : "text-gray-300"}>|</span>
                    <div>
                        <h1
                            className={`text-base font-black tracking-tight ${isDark ? "text-foreground" : "text-gray-900"}`}
                        >
                            {zone.displayName}
                        </h1>
                        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            {zone.code} · {zone.classification}
                        </p>
                    </div>
                </div>

                {/* Centre: breadcrumb */}
                <nav
                    className={`hidden md:flex items-center gap-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                >
                    <button onClick={() => router.push("/")}>🏠</button>
                    <span>›</span>
                    <button onClick={() => router.push("/geofence")}>Geofence Library</button>
                    <span>›</span>
                    <span className={`font-semibold ${isDark ? "text-foreground" : "text-gray-800"}`}>
                        {zone.code}
                    </span>
                </nav>

                {/* Right: actions */}
                <div className="flex items-center gap-2">
                    <button
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${isDark
                                ? "border-red-900 text-red-400 hover:bg-red-900/20"
                                : "border-red-200 text-red-600 hover:bg-red-50"
                            }`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </header>

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* ── Left: Edit form ── */}
                <aside
                    className={`w-[420px] flex-shrink-0 flex flex-col border-r overflow-y-auto ${isDark ? "bg-background border-gray-800" : "bg-white border-gray-200"
                        }`}
                >
                    <div className="px-5 py-5 space-y-6">
                        {/* ── Identity ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-gray-400 text-xs">ℹ</span>
                                <h3 className={`text-[10px] font-bold tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    IDENTITY &amp; REGISTRY
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>UNIQUE CODE</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>DISPLAY NAME</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ── Classification ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-gray-400 text-xs">◈</span>
                                <h3 className={`text-[10px] font-bold tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    ZONE CLASSIFICATION
                                </h3>
                            </div>
                            <select
                                value={classification}
                                onChange={(e) => setClassification(e.target.value as ZoneClassification)}
                                className={inputCls}
                            >
                                {CLASSIFICATIONS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1.5">
                                Used for automated trip reporting and safety rules.
                            </p>
                        </section>

                        {/* ── Color theme ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-gray-400 text-xs">◉</span>
                                <h3 className={`text-[10px] font-bold tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    GEOFENCE COLOR THEME
                                </h3>
                            </div>
                            <div
                                className={`flex flex-wrap gap-2 p-3 rounded-xl border border-dashed ${isDark ? "border-gray-700 bg-gray-800/40" : "border-gray-200 bg-gray-50"
                                    }`}
                            >
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className="w-10 h-10 rounded-xl transition-all hover:scale-110 active:scale-95"
                                        style={{
                                            background: c,
                                            boxShadow:
                                                color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                                        }}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* ── Geometry type ── */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-gray-400 text-xs">◈</span>
                                <h3 className={`text-[10px] font-bold tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                    GEOMETRY TYPE
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {(["circle", "polygon"] as GeometryType[]).map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setGeometry(g)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${geometry === g
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10"
                                                : isDark
                                                    ? "border-gray-700 hover:border-gray-600"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <span
                                            className={`text-xl ${geometry === g ? "text-indigo-500" : isDark ? "text-gray-400" : "text-gray-400"
                                                }`}
                                        >
                                            {g === "circle" ? "○" : "⬠"}
                                        </span>
                                        <div className="text-left">
                                            <p
                                                className={`text-xs font-bold uppercase ${geometry === g ? "text-indigo-600" : isDark ? "text-gray-300" : "text-gray-700"
                                                    }`}
                                            >
                                                {g}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {g === "circle" ? "RADIUS ZONE" : "CUSTOM AREA"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* ── Lifecycle status ── */}
                        <section>
                            <div
                                className={`flex items-center justify-between px-4 py-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"
                                    }`}
                            >
                                <div>
                                    <p className={`text-[10px] font-bold tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        LIFECYCLE STATUS
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        ENABLE ZONE FOR ACTIVE BEHAVIORAL MONITORING.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-[10px] font-bold ${status === "enabled" ? "text-emerald-600" : "text-gray-400"
                                            }`}
                                    >
                                        {status === "enabled" ? "ENABLED" : "DISABLED"}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setStatus((s) => (s === "enabled" ? "disabled" : "enabled"))
                                        }
                                        className={`relative w-10 h-6 rounded-full transition-colors ${status === "enabled"
                                                ? "bg-indigo-500"
                                                : isDark ? "bg-gray-700" : "bg-gray-300"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${status === "enabled" ? "translate-x-5" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ── Form footer ── */}
                    <div
                        className={`flex items-center gap-3 px-5 py-4 border-t mt-auto sticky bottom-0 ${isDark ? "border-gray-800 bg-background" : "border-gray-100 bg-white"
                            }`}
                    >
                        <button
                            onClick={() => router.push("/geofence")}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-colors ${isDark
                                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-[2] py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                        >
                            {saving && (
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </aside>

                {/* ── Right: Map preview ── */}
                <main className="flex-1 relative">
                    {isLoaded ? (
                        <GeofenceMap
                            zones={[previewZone]}
                            isDark={isDark}
                            onMapLoad={onMapLoad}
                            zoom={13}
                            center={zone.center ?? { lat: 28.6139, lng: 77.209 }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
                        </div>
                    )}

                    {/* Top-right tools */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <button className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500 dark:text-gray-300">
                            <Layers className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Zoom */}
                    <div className="absolute bottom-8 right-3 flex flex-col gap-1">
                        <button
                            onClick={() => map?.setZoom((map.getZoom() ?? 13) + 1)}
                            className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-700 dark:text-gray-300 font-bold text-lg"
                        >
                            +
                        </button>
                        <button
                            onClick={() => map?.setZoom((map.getZoom() ?? 13) - 1)}
                            className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-700 dark:text-gray-300 font-bold text-lg"
                        >
                            −
                        </button>
                    </div>

                    {/* Settings FAB */}
                    <button className="absolute bottom-8 right-14 w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* Live preview label */}
                    <div
                        className={`absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm shadow ${isDark ? "bg-gray-900/80 text-gray-300" : "bg-white/90 text-gray-700"
                            }`}
                    >
                        <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: color }}
                        />
                        LIVE PREVIEW
                    </div>
                </main>
            </div>
        </div>
    );
}