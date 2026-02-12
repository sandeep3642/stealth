"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import {
  Activity,
  CarFront,
  CircleDotDashed,
  CircleX,
  Clock3,
  Filter,
  Gauge,
  Layers3,
  LocateFixed,
  Navigation,
  Search,
  Settings2,
  User,
  WifiOff,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useGoogleMapsSdk } from "@/hooks/useGoogleMapsSdk";
import {
  DEFAULT_FLEET_VEHICLES,
  getLiveTrackingBatch,
  getLiveTrackingByKey,
} from "@/services/liveTrackingService";

const POLL_MS = 15000;
const VEHICLE_LIST = DEFAULT_FLEET_VEHICLES.slice(0, 3);

const STATUS_META = {
  ALL: { color: "#4f46e5", icon: CarFront },
  MOVING: { color: "#0ea5a4", icon: Navigation },
  IDLING: { color: "#6366f1", icon: Activity },
  PARKED: { color: "#10b981", icon: LocateFixed },
  OFFLINE: { color: "#94a3b8", icon: WifiOff },
  BREAKDOWN: { color: "#ef4444", icon: Wrench },
  EXPIRED: { color: "#8b5cf6", icon: CircleX },
};

function getMarkerSvg(status, isActive) {
  const color = STATUS_META[status]?.color || "#64748b";
  const ring = isActive ? "#111827" : "#ffffff";

  return `data:image/svg+xml;utf-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 42 42">
      <circle cx="21" cy="21" r="17" fill="${color}" stroke="${ring}" stroke-width="4"/>
      <circle cx="21" cy="21" r="5.5" fill="white" fill-opacity="0.95"/>
    </svg>
  `)}`;
}

export default function FleetDashboard() {
  const mapRef = useRef(null);
  const [fleetData, setFleetData] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [popupVehicleId, setPopupVehicleId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFleetLoading, setIsFleetLoading] = useState(true);
  const [fleetError, setFleetError] = useState("");
  const { isLoaded, loadError, hasApiKey } = useGoogleMapsSdk();

  useEffect(() => {
    let cancelled = false;

    const loadFleet = async () => {
      try {
        setFleetError("");
        let vehicles = await getLiveTrackingBatch(VEHICLE_LIST);

        if (!vehicles.length) {
          const fallback = await Promise.all(
            VEHICLE_LIST.map((vehicleNo) =>
              getLiveTrackingByKey(vehicleNo).catch(() => null),
            ),
          );
          vehicles = fallback.filter(Boolean);
        }

        if (!vehicles.length) {
          throw new Error("No live vehicle data received");
        }

        if (!cancelled) {
          setFleetData(vehicles);
          setSelectedVehicleId((prev) => {
            if (prev && vehicles.some((v) => v.id === prev)) return prev;
            return vehicles[0]?.id || null;
          });
          setPopupVehicleId((prev) => {
            if (prev && vehicles.some((v) => v.id === prev)) return prev;
            return vehicles[0]?.id || null;
          });
        }
      } catch (error) {
        if (!cancelled) {
          setFleetError(error?.message || "Unable to fetch live tracking data");
        }
      } finally {
        if (!cancelled) setIsFleetLoading(false);
      }
    };

    loadFleet();
    const timer = setInterval(loadFleet, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const statusCounts = useMemo(
    () =>
      fleetData.reduce((acc, vehicle) => {
        acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
        return acc;
      }, {}),
    [fleetData],
  );

  const stats = useMemo(
    () => [
      { label: "ALL", count: fleetData.length },
      { label: "MOVING", count: statusCounts.MOVING || 0 },
      { label: "IDLING", count: statusCounts.IDLING || 0 },
      { label: "PARKED", count: statusCounts.PARKED || 0 },
      { label: "OFFLINE", count: statusCounts.OFFLINE || 0 },
      { label: "BREAKDOWN", count: statusCounts.BREAKDOWN || 0 },
      { label: "EXPIRED", count: statusCounts.EXPIRED || 0 },
    ],
    [fleetData.length, statusCounts],
  );

  const filteredFleet = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return fleetData.filter((vehicle) => {
      const byStatus = filterStatus === "ALL" || vehicle.status === filterStatus;
      const bySearch =
        !term ||
        vehicle.name?.toLowerCase().includes(term) ||
        vehicle.vehicleNumber?.toLowerCase().includes(term);
      return byStatus && bySearch;
    });
  }, [fleetData, filterStatus, searchTerm]);

  const selectedVehicle =
    fleetData.find((vehicle) => vehicle.id === selectedVehicleId) ||
    filteredFleet[0] ||
    fleetData[0] ||
    null;

  const popupVehicle =
    fleetData.find((vehicle) => vehicle.id === popupVehicleId) || null;

  const mapCenter = useMemo(
    () =>
      selectedVehicle
        ? { lat: selectedVehicle.position[0], lng: selectedVehicle.position[1] }
        : { lat: 28.4595, lng: 77.0266 },
    [selectedVehicle],
  );

  const mapOptions = useMemo(
    () => ({
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      zoomControl: true,
      clickableIcons: false,
    }),
    [],
  );

  const focusVehicle = (vehicle, openPopup = true) => {
    setSelectedVehicleId(vehicle.id);
    if (openPopup) setPopupVehicleId(vehicle.id);
    if (mapRef.current) {
      mapRef.current.panTo({
        lat: vehicle.position[0],
        lng: vehicle.position[1],
      });
      mapRef.current.setZoom(13);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-3 md:p-4">
      <header className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0f172a]">
            FLEET INTELLIGENCE
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500">
            <span>Operations</span>
            <span className="text-slate-300">›</span>
            <span className="text-slate-700">Live Fleet Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              type="text"
              placeholder="Search plate or ID..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        {stats.map((stat) => {
          const active = filterStatus === stat.label;
          const Icon = STATUS_META[stat.label]?.icon || CircleDotDashed;
          return (
            <button
              key={stat.label}
              type="button"
              onClick={() => setFilterStatus(stat.label)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? "border-indigo-200 bg-white shadow-sm"
                  : "border-transparent bg-[#ededf0] hover:bg-[#e8e9ed]"
              }`}
            >
              <div className="mb-1 flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="text-[12px] font-bold tracking-widest text-slate-600">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-black text-slate-800">{stat.count}</div>
            </button>
          );
        })}
      </div>

      <div className="grid min-h-[68vh] grid-cols-1 gap-3 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl bg-transparent">
          <div className="max-h-[68vh] space-y-3 overflow-y-auto pr-1">
            {isFleetLoading && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
                Loading vehicle data...
              </div>
            )}
            {!isFleetLoading && fleetError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-600">
                {fleetError}
              </div>
            )}
            {!isFleetLoading &&
              !fleetError &&
              filteredFleet.map((vehicle) => {
                const statusColor = STATUS_META[vehicle.status]?.color || "#64748b";
                const active = selectedVehicle?.id === vehicle.id;
                return (
                  <button
                    type="button"
                    key={vehicle.id}
                    onClick={() => focusVehicle(vehicle, true)}
                    className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                      active
                        ? "border-indigo-200 ring-2 ring-indigo-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: `${statusColor}22` }}
                        >
                          <CarFront className="h-5 w-5" style={{ color: statusColor }} />
                        </div>
                        <div>
                          <div className="text-lg font-black text-slate-900">
                            {vehicle.name}
                          </div>
                          <div className="text-sm font-semibold text-slate-400">
                            {vehicle.vehicleNumber}
                          </div>
                        </div>
                      </div>
                      <span
                        className="rounded-lg px-3 py-1 text-xs font-extrabold text-white"
                        style={{ backgroundColor: statusColor }}
                      >
                        {vehicle.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-y border-dashed border-slate-200 py-3">
                      <div>
                        <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <Gauge className="h-3.5 w-3.5" />
                          Velocity
                        </div>
                        <div className="text-lg font-black text-slate-900">
                          {vehicle.velocity} KM/H
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <Zap className="h-3.5 w-3.5" />
                          Ignition
                        </div>
                        <div
                          className={`text-lg font-black ${
                            vehicle.ignition === "ON"
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`}
                        >
                          {vehicle.ignition}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        {vehicle.driver}
                      </div>
                      <div className="flex items-center gap-1.5 text-[#7c3aed]">
                        <Clock3 className="h-4 w-4" />
                        {vehicle.lastUpdate}
                      </div>
                    </div>
                  </button>
                );
              })}
            {!isFleetLoading && !fleetError && filteredFleet.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500">
                No vehicles match your filter.
              </div>
            )}
          </div>
        </aside>

        <main className="relative min-h-[68vh] overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {!hasApiKey && (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm font-semibold text-red-600">
              Google Maps key missing in env. Set `NEXT_PUBLIC_GOOGLE_MAPS_KEY`.
            </div>
          )}

          {hasApiKey && loadError && (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm font-semibold text-red-600">
              Unable to load Google Maps SDK.
            </div>
          )}

          {hasApiKey && !loadError && !isLoaded && (
            <div className="flex h-full items-center justify-center p-8 text-sm font-semibold text-slate-500">
              Loading map...
            </div>
          )}

          {hasApiKey && !loadError && isLoaded && (
            <>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={12}
                options={mapOptions}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
              >
                {filteredFleet.map((vehicle) => (
                  <MarkerF
                    key={vehicle.id}
                    position={{
                      lat: vehicle.position[0],
                      lng: vehicle.position[1],
                    }}
                    icon={{
                      url: getMarkerSvg(
                        vehicle.status,
                        selectedVehicle?.id === vehicle.id,
                      ),
                    }}
                    onClick={() => focusVehicle(vehicle, true)}
                  />
                ))}
              </GoogleMap>

              <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white/95 px-4 py-2 shadow-lg">
                <div className="text-sm font-bold text-slate-900">Live Tracking Active</div>
                <div className="text-xs font-medium text-slate-500">
                  Monitoring {filteredFleet.length} vehicles
                </div>
              </div>

              {popupVehicle && (
                <div className="absolute left-1/2 top-6 w-[340px] max-w-[92%] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="text-[24px] font-black text-slate-900">
                        {popupVehicle.name}
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: STATUS_META[popupVehicle.status]?.color || "#64748b" }}
                      >
                        {popupVehicle.status}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPopupVehicleId(null)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-y border-dashed border-slate-200 py-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Driver
                      </div>
                      <div className="text-base font-black text-slate-900">
                        {popupVehicle.driver}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Velocity
                      </div>
                      <div className="text-base font-black text-slate-900">
                        {popupVehicle.velocity} KM/H
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute right-4 top-4 flex flex-col gap-2">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#6d28d9] text-white shadow-lg"
                >
                  <Settings2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg"
                >
                  <Layers3 className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
