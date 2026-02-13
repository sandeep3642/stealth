"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, MarkerF, PolylineF } from "@react-google-maps/api";
import {
  ArrowLeft,
  Navigation,
  Gauge,
  Phone,
  User,
  Layers3,
  Settings,
  Maximize2,
  Zap,
  Activity,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useGoogleMapsSdk } from "@/hooks/useGoogleMapsSdk";
import { useRouter, useParams } from "next/navigation";

const POLL_INTERVAL = 5000; // 5 seconds
const API_BASE_URL = "http://fleetbharat.com:8080/api/redis/get";

interface Position {
  lat: number;
  lng: number;
  timestamp: string;
}

interface VehicleData {
  DeviceNo: string;
  Imei: string;
  Latitude: number;
  Longitude: number;
  Speed: number;
  Altitude: number;
  Direction: number;
  Rpm: number | null;
  Ignition: boolean;
  Ac: boolean;
  PowerCut: boolean;
  LowVoltage: boolean;
  DoorLock: boolean;
  DoorOpen: boolean;
  DeviceLock: boolean;
  FuelCut: boolean;
  GpsFixed: boolean;
  Collision: boolean;
  GpsDate: string;
  Sos: boolean;
  OverSpeed: boolean;
  Fatigue: boolean;
  Danger: boolean;
  GnssFault: boolean;
  GnssAntennaDisconnect: boolean;
  GnssAntennaShort: boolean;
  PowerUnderVoltage: boolean;
  PowerDown: boolean;
  PowerDisplayFault: boolean;
  TtsFault: boolean;
  Rollover: boolean;
  ReceivedAt: string | null;
  Id: string;
  VehicleNo: string;
}

export default function LiveTracking() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params?.id as string;
  const mapRef = useRef<google.maps.Map | null>(null);

  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [positionHistory, setPositionHistory] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const { isLoaded, loadError, hasApiKey } = useGoogleMapsSdk();

  useEffect(() => {
    if (!vehicleId) return;

    let cancelled = false;

    const fetchVehicleData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}?key=dashboard::${vehicleId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch vehicle data");
        }

        const data = await response.json();
        const parsedValue: VehicleData = JSON.parse(data.value);

        console.log("parsedValue", parsedValue);

        if (!cancelled) {
          setVehicleData(parsedValue);

          // Add to position history
          if (parsedValue?.Latitude && parsedValue?.Longitude) {
            setPositionHistory((prev) => {
              const newHistory = [
                ...prev,
                {
                  lat: parsedValue.Latitude,
                  lng: parsedValue.Longitude,
                  timestamp: parsedValue.GpsDate,
                },
              ];
              return newHistory.slice(-50);
            });
          }

          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to fetch vehicle data",
          );
          setLoading(false);
        }
      }
    };

    fetchVehicleData();
    const interval = setInterval(fetchVehicleData, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [vehicleId]);

  const lat = Number(vehicleData?.Latitude);
  const lng = Number(vehicleData?.Longitude);

  const mapCenter =
    lat && lng && isFinite(lat) && isFinite(lng)
      ? { lat, lng }
      : { lat: 28.4595, lng: 77.0266 };

  const mapOptions = {
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    zoomControl: true,
    clickableIcons: false,
    styles: [
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ color: "#e8f0e8" }],
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#c3e6f4" }],
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }],
      },
      {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#666666" }],
      },
    ],
  };

  const pathCoordinates = positionHistory.map((pos) => ({
    lat: pos.lat,
    lng: pos.lng,
  }));

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatus = () => {
    if (!vehicleData) return "UNKNOWN";
    if (vehicleData.Speed > 5) return "MOVING";
    if (vehicleData.Ignition) return "IDLING";
    return "PARKED";
  };

  if (!vehicleId) {
    return (
      <div className="flex items-center justify-center bg-gray-100 p-8">
        <div className="text-lg font-semibold text-red-600">
          Vehicle ID not found
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-100 sm:p-2 md:p-2">
      {/* Desktop Layout */}
      <div className="hidden h-full gap-3 lg:flex" style={{ height: "calc(100vh - 120px)" }}>
        {/* Left Panel - Desktop */}
        <aside className="flex w-full max-w-sm flex-col overflow-y-auto rounded-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 lg:w-[360px]">
          {/* Header */}
          <div className="border-b border-gray-700/50 p-4">
            <button
              onClick={() => router.push("/fleet")}
              className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-400 transition hover:text-emerald-300"
            >
              <ArrowLeft className="h-3 w-3" />
              BACK TO FLEET
            </button>

            <div className="flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Live Tracking
                  </span>
                </div>
                <h1 className="text-xl font-black text-white">
                  {loading ? "Loading..." : vehicleData?.VehicleNo || vehicleId}
                </h1>
              </div>
              <button className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400 transition hover:bg-emerald-500/20">
                <Navigation className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Speed Display */}
          <div className="border-b border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-transparent p-4">
            <div className="text-center">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Actual Speed
              </div>
              <div className="relative inline-flex items-baseline">
                <span className="text-5xl font-black tabular-nums tracking-tight text-emerald-400">
                  {loading ? "--" : Math.round(vehicleData?.Speed || 0)}
                </span>
                <span className="ml-2 text-base font-bold text-gray-500">
                  KM/H
                </span>
              </div>
              {/* Speed Bar */}
              <div className="mx-auto mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(((vehicleData?.Speed || 0) / 120) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 border-b border-gray-700/50 p-4">
            <div className="rounded-lg bg-gray-800/50 p-3 backdrop-blur-sm">
              <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                <Navigation className="h-3 w-3" />
                Heading
              </div>
              <div className="text-lg font-black text-white">
                {loading ? "--" : `${vehicleData?.Direction || 0}°`}
              </div>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-3 backdrop-blur-sm">
              <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                <Gauge className="h-3 w-3" />
                Altitude
              </div>
              <div className="text-lg font-black text-white">
                {loading ? "--" : `${vehicleData?.Altitude || 0}M`}
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="border-b border-gray-700/50 p-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Vehicle Status
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`flex items-center gap-2 rounded-lg p-2 ${vehicleData?.Ignition ? "bg-emerald-500/10" : "bg-gray-800/50"}`}
              >
                <Zap
                  className={`h-3.5 w-3.5 ${vehicleData?.Ignition ? "text-emerald-400" : "text-gray-500"}`}
                />
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Ignition
                  </div>
                  <div
                    className={`text-xs font-black ${vehicleData?.Ignition ? "text-emerald-400" : "text-gray-500"}`}
                  >
                    {vehicleData?.Ignition ? "ON" : "OFF"}
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 rounded-lg p-2 ${vehicleData?.Ac ? "bg-blue-500/10" : "bg-gray-800/50"}`}
              >
                <Activity
                  className={`h-3.5 w-3.5 ${vehicleData?.Ac ? "text-blue-400" : "text-gray-500"}`}
                />
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    AC
                  </div>
                  <div
                    className={`text-xs font-black ${vehicleData?.Ac ? "text-blue-400" : "text-gray-500"}`}
                  >
                    {vehicleData?.Ac ? "ON" : "OFF"}
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 rounded-lg p-2 ${vehicleData?.DoorLock ? "bg-red-500/10" : "bg-emerald-500/10"}`}
              >
                {vehicleData?.DoorLock ? (
                  <Lock className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                )}
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    Door
                  </div>
                  <div
                    className={`text-xs font-black ${vehicleData?.DoorLock ? "text-red-400" : "text-emerald-400"}`}
                  >
                    {vehicleData?.DoorLock ? "LOCKED" : "UNLOCKED"}
                  </div>
                </div>
              </div>

              <div
                className={`flex items-center gap-2 rounded-lg p-2 ${vehicleData?.GpsFixed ? "bg-emerald-500/10" : "bg-yellow-500/10"}`}
              >
                <Navigation
                  className={`h-3.5 w-3.5 ${vehicleData?.GpsFixed ? "text-emerald-400" : "text-yellow-400"}`}
                />
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    GPS
                  </div>
                  <div
                    className={`text-xs font-black ${vehicleData?.GpsFixed ? "text-emerald-400" : "text-yellow-400"}`}
                  >
                    {vehicleData?.GpsFixed ? "FIXED" : "SEARCHING"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {vehicleData &&
            (vehicleData.OverSpeed ||
              vehicleData.Sos ||
              vehicleData.Collision ||
              vehicleData.LowVoltage) && (
              <div className="border-b border-gray-700/50 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  Active Alerts
                </div>
                <div className="space-y-1.5">
                  {vehicleData.OverSpeed && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400">
                      ⚠️ Over Speed Detected
                    </div>
                  )}
                  {vehicleData.Sos && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400">
                      🆘 SOS Alert Active
                    </div>
                  )}
                  {vehicleData.Collision && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400">
                      💥 Collision Detected
                    </div>
                  )}
                  {vehicleData.LowVoltage && (
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1.5 text-xs font-semibold text-yellow-400">
                      🔋 Low Battery Voltage
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Last Positions */}
          <div className="border-b border-gray-700/50 p-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Last Positions
            </div>
            <div className="space-y-1.5">
              {positionHistory
                .slice(-3)
                .reverse()
                .map((pos, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-gray-800/30 px-3 py-2 text-xs backdrop-blur-sm"
                  >
                    <div className="font-mono text-gray-300">
                      {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
                    </div>
                    <div
                      className={`text-[10px] font-semibold ${idx === 0 ? "text-emerald-400" : "text-gray-500"}`}
                    >
                      {idx === 0 ? "Now" : formatDate(pos.timestamp)}
                    </div>
                  </div>
                ))}
              {positionHistory.length === 0 && !loading && (
                <div className="py-3 text-center text-xs text-gray-500">
                  No position data yet
                </div>
              )}
            </div>
          </div>

          {/* Device Info */}
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Device Info
              </span>
              <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                {getStatus()}
              </span>
            </div>
            <div className="rounded-lg bg-gray-800/50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                  <User className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {loading
                      ? "Loading..."
                      : vehicleData?.DeviceNo || "Unknown"}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    IMEI: {vehicleData?.Imei || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-gray-700/50 pt-2">
                <div className="text-[10px] text-gray-400">
                  Last Update:{" "}
                  {vehicleData?.GpsDate
                    ? formatDate(vehicleData.GpsDate)
                    : "N/A"}
                </div>
                <button className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-400 transition hover:bg-emerald-500/20">
                  <Phone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Map Section - Desktop */}
        <main className="relative flex-1 overflow-hidden rounded-lg">
          {!hasApiKey && (
            <div className="flex h-full items-center justify-center rounded-lg bg-white p-8 text-center text-sm font-semibold text-red-600">
              Google Maps key missing. Set `NEXT_PUBLIC_GOOGLE_MAPS_KEY`.
            </div>
          )}

          {hasApiKey && loadError && (
            <div className="flex h-full items-center justify-center rounded-lg bg-white p-8 text-center text-sm font-semibold text-red-600">
              Unable to load Google Maps SDK.
            </div>
          )}

          {hasApiKey && !loadError && !isLoaded && (
            <div className="flex h-full items-center justify-center rounded-lg bg-white p-8 text-sm font-semibold text-gray-500">
              Loading map...
            </div>
          )}

          {hasApiKey && !loadError && isLoaded && (
            <>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={14}
                options={mapOptions}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
              >
                {/* Vehicle Marker with Car Icon */}
                {vehicleData && (
                  <MarkerF
                    position={{
                      lat: vehicleData.Latitude,
                      lng: vehicleData.Longitude,
                    }}
                    icon={{
                      url: `data:image/svg+xml;utf-8,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
                        <g transform="translate(32, 32)">
                          <!-- Outer glow -->
                          <circle cx="0" cy="0" r="28" fill="#10b981" opacity="0.15"/>
                          <circle cx="0" cy="0" r="20" fill="#10b981" opacity="0.25"/>
                          
                          <!-- Rotate the car based on direction -->
                          <g transform="rotate(${vehicleData.Direction})">
                            <!-- Car shadow -->
                            <ellipse cx="0" cy="2" rx="14" ry="6" fill="#000000" opacity="0.2"/>
                            
                            <!-- Car body -->
                            <rect x="-12" y="-7" width="24" height="14" rx="2.5" fill="#10b981" stroke="#059669" stroke-width="1"/>
                            
                            <!-- Car cabin/top -->
                            <path d="M -8,-7 L -8,-11 L -3,-13 L 6,-13 L 11,-11 L 11,-7 Z" fill="#059669" stroke="#047857" stroke-width="0.8"/>
                            
                            <!-- Windshield (front) -->
                            <path d="M 6,-13 L 11,-11 L 11,-7 L 8,-7 Z" fill="#6ee7b7" opacity="0.7"/>
                            
                            <!-- Side windows -->
                            <path d="M -8,-11 L -3,-13 L 3,-13 L 3,-7 L -8,-7 Z" fill="#6ee7b7" opacity="0.5"/>
                            
                            <!-- Wheels -->
                            <circle cx="-8" cy="-8" r="2.5" fill="#1f2937" stroke="#111827" stroke-width="0.5"/>
                            <circle cx="-8" cy="8" r="2.5" fill="#1f2937" stroke="#111827" stroke-width="0.5"/>
                            <circle cx="8" cy="-8" r="2.5" fill="#1f2937" stroke="#111827" stroke-width="0.5"/>
                            <circle cx="8" cy="8" r="2.5" fill="#1f2937" stroke="#111827" stroke-width="0.5"/>
                            
                            <!-- Wheel rims -->
                            <circle cx="-8" cy="-8" r="1.2" fill="#4b5563"/>
                            <circle cx="-8" cy="8" r="1.2" fill="#4b5563"/>
                            <circle cx="8" cy="-8" r="1.2" fill="#4b5563"/>
                            <circle cx="8" cy="8" r="1.2" fill="#4b5563"/>
                            
                            <!-- Headlights -->
                            <circle cx="13" cy="-4" r="1" fill="#fef3c7"/>
                            <circle cx="13" cy="4" r="1" fill="#fef3c7"/>
                            
                            <!-- Direction arrow pointing forward -->
                            <path d="M 16,0 L 22,0 M 22,0 L 19,-3 M 22,0 L 19,3" 
                                  stroke="#10b981" 
                                  stroke-width="2.5" 
                                  fill="none" 
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                          </g>
                        </g>
                      </svg>
                    `)}`,
                      anchor: new google.maps.Point(32, 32),
                      scaledSize: new google.maps.Size(64, 64),
                    }}
                  />
                )}

                {/* Path Trail with Dotted Line */}
                {pathCoordinates.length > 1 && (
                  <PolylineF
                    path={pathCoordinates}
                    options={{
                      strokeColor: "#10b981",
                      strokeOpacity: 0,
                      strokeWeight: 0,
                      icons: [
                        {
                          icon: {
                            path: "M 0,-1 0,1",
                            strokeOpacity: 0.8,
                            strokeWeight: 4,
                            scale: 2,
                          },
                          offset: "0",
                          repeat: "12px",
                        },
                      ],
                      geodesic: true,
                    }}
                  />
                )}
              </GoogleMap>

              {/* Live Stream Badge */}
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 shadow-xl">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Live Stream Active
                </span>
                <Maximize2 className="h-3.5 w-3.5 text-white" />
              </div>

              {/* Map Controls */}
              <div className="absolute right-4 top-16 flex flex-col gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition hover:bg-purple-700">
                  <Settings className="h-4 w-4" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition hover:bg-gray-50">
                  <Layers3 className="h-4 w-4" />
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-xl">
                  {error}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="flex h-full flex-col lg:hidden">
        {/* Map Section - Mobile (Full Height) */}
        <div className="relative flex-1">
          {!hasApiKey && (
            <div className="flex h-full items-center justify-center bg-white p-4 text-center text-sm font-semibold text-red-600">
              Google Maps key missing. Set `NEXT_PUBLIC_GOOGLE_MAPS_KEY`.
            </div>
          )}

          {hasApiKey && loadError && (
            <div className="flex h-full items-center justify-center bg-white p-4 text-center text-sm font-semibold text-red-600">
              Unable to load Google Maps SDK.
            </div>
          )}

          {hasApiKey && !loadError && !isLoaded && (
            <div className="flex h-full items-center justify-center bg-white p-4 text-sm font-semibold text-gray-500">
              Loading map...
            </div>
          )}

          {hasApiKey && !loadError && isLoaded && (
            <>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={mapCenter}
                zoom={14}
                options={mapOptions}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
              >
                {/* Vehicle Marker */}
                {vehicleData && (
                  <MarkerF
                    position={{
                      lat: vehicleData.Latitude,
                      lng: vehicleData.Longitude,
                    }}
                    icon={{
                      url: `data:image/svg+xml;utf-8,${encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
                        <g transform="translate(32, 32)">
                          <circle cx="0" cy="0" r="28" fill="#10b981" opacity="0.15"/>
                          <circle cx="0" cy="0" r="20" fill="#10b981" opacity="0.25"/>
                          <g transform="rotate(${vehicleData.Direction})">
                            <ellipse cx="0" cy="2" rx="14" ry="6" fill="#000000" opacity="0.2"/>
                            <rect x="-12" y="-7" width="24" height="14" rx="2.5" fill="#10b981" stroke="#059669" stroke-width="1"/>
                            <path d="M -8,-7 L -8,-11 L -3,-13 L 6,-13 L 11,-11 L 11,-7 Z" fill="#059669" stroke="#047857" stroke-width="0.8"/>
                            <path d="M 6,-13 L 11,-11 L 11,-7 L 8,-7 Z" fill="#6ee7b7" opacity="0.7"/>
                            <path d="M -8,-11 L -3,-13 L 3,-13 L 3,-7 L -8,-7 Z" fill="#6ee7b7" opacity="0.5"/>
                            <circle cx="-8" cy="-8" r="2.5" fill="#1f2937" stroke="#111827" stroke-width="0.5"/>
                            <circle cx="-8" cy="8" r="2.5" fill="#1f2937" stroke="#111827" stroke-width="0.5"/>
                            <circle cx="8" cy="-8" r="2.5" fill="#1f2937" stroke="#111827" stroke-width="0.5"/>
                            <circle cx="8" cy="8" r="2.5" fill="#1f2937" stroke="#111827" stroke-width="0.5"/>
                            <circle cx="-8" cy="-8" r="1.2" fill="#4b5563"/>
                            <circle cx="-8" cy="8" r="1.2" fill="#4b5563"/>
                            <circle cx="8" cy="-8" r="1.2" fill="#4b5563"/>
                            <circle cx="8" cy="8" r="1.2" fill="#4b5563"/>
                            <circle cx="13" cy="-4" r="1" fill="#fef3c7"/>
                            <circle cx="13" cy="4" r="1" fill="#fef3c7"/>
                            <path d="M 16,0 L 22,0 M 22,0 L 19,-3 M 22,0 L 19,3" 
                                  stroke="#10b981" 
                                  stroke-width="2.5" 
                                  fill="none" 
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                          </g>
                        </g>
                      </svg>
                    `)}`,
                      anchor: new google.maps.Point(32, 32),
                      scaledSize: new google.maps.Size(64, 64),
                    }}
                  />
                )}

                {/* Path Trail */}
                {pathCoordinates.length > 1 && (
                  <PolylineF
                    path={pathCoordinates}
                    options={{
                      strokeColor: "#10b981",
                      strokeOpacity: 0,
                      strokeWeight: 0,
                      icons: [
                        {
                          icon: {
                            path: "M 0,-1 0,1",
                            strokeOpacity: 0.8,
                            strokeWeight: 4,
                            scale: 2,
                          },
                          offset: "0",
                          repeat: "12px",
                        },
                      ],
                      geodesic: true,
                    }}
                  />
                )}
              </GoogleMap>

              {/* Back Button - Mobile */}
              <button
                onClick={() => router.push("/fleet")}
                className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-lg transition hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Fleet</span>
              </button>

              {/* Live Badge - Mobile */}
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 shadow-xl">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white"></div>
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Live
                </span>
              </div>

              {/* Quick Stats - Mobile Floating */}
              <div className="absolute left-4 right-4 top-20 rounded-lg bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {loading ? "Loading..." : vehicleData?.VehicleNo || vehicleId}
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400">
                        {loading ? "--" : Math.round(vehicleData?.Speed || 0)}
                      </span>
                      <span className="text-xs font-bold text-gray-500">KM/H</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div
                      className={`rounded-lg px-2 py-1 ${vehicleData?.Ignition ? "bg-emerald-500/20" : "bg-gray-700/50"}`}
                    >
                      <Zap
                        className={`h-4 w-4 ${vehicleData?.Ignition ? "text-emerald-400" : "text-gray-500"}`}
                      />
                    </div>
                    <div
                      className={`rounded-lg px-2 py-1 ${vehicleData?.GpsFixed ? "bg-emerald-500/20" : "bg-yellow-500/20"}`}
                    >
                      <Navigation
                        className={`h-4 w-4 ${vehicleData?.GpsFixed ? "text-emerald-400" : "text-yellow-400"}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display - Mobile */}
              {error && (
                <div className="absolute left-4 right-4 top-40 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white shadow-xl">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Sheet - Mobile */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl transition-transform duration-300 ${
            isPanelExpanded ? "translate-y-0" : "translate-y-[calc(100%-120px)]"
          }`}
          style={{ maxHeight: "80vh" }}
        >
          {/* Handle */}
          <button
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            className="flex w-full items-center justify-center py-3"
          >
            <div className="h-1 w-12 rounded-full bg-gray-600"></div>
          </button>

          {/* Collapsed View */}
          <div
            className="cursor-pointer border-b border-gray-700/50 px-4 pb-4"
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Live Tracking
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-black text-white">
                  {loading ? "Loading..." : vehicleData?.VehicleNo || vehicleId}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
                  {getStatus()}
                </span>
                {isPanelExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(80vh - 100px)" }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-700/50 p-4">
              <div className="rounded-lg bg-gray-800/50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  <Navigation className="h-3 w-3" />
                  Heading
                </div>
                <div className="text-lg font-black text-white">
                  {loading ? "--" : `${vehicleData?.Direction || 0}°`}
                </div>
              </div>

              <div className="rounded-lg bg-gray-800/50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  <Gauge className="h-3 w-3" />
                  Altitude
                </div>
                <div className="text-lg font-black text-white">
                  {loading ? "--" : `${vehicleData?.Altitude || 0}M`}
                </div>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="border-b border-gray-700/50 p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Vehicle Status
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`flex items-center gap-2 rounded-lg p-2 ${vehicleData?.Ignition ? "bg-emerald-500/10" : "bg-gray-800/50"}`}
                >
                  <Zap
                    className={`h-3.5 w-3.5 ${vehicleData?.Ignition ? "text-emerald-400" : "text-gray-500"}`}
                  />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Ignition
                    </div>
                    <div
                      className={`text-xs font-black ${vehicleData?.Ignition ? "text-emerald-400" : "text-gray-500"}`}
                    >
                      {vehicleData?.Ignition ? "ON" : "OFF"}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-lg p-2 ${vehicleData?.Ac ? "bg-blue-500/10" : "bg-gray-800/50"}`}
                >
                  <Activity
                    className={`h-3.5 w-3.5 ${vehicleData?.Ac ? "text-blue-400" : "text-gray-500"}`}
                  />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      AC
                    </div>
                    <div
                      className={`text-xs font-black ${vehicleData?.Ac ? "text-blue-400" : "text-gray-500"}`}
                    >
                      {vehicleData?.Ac ? "ON" : "OFF"}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-lg p-2 ${vehicleData?.DoorLock ? "bg-red-500/10" : "bg-emerald-500/10"}`}
                >
                  {vehicleData?.DoorLock ? (
                    <Lock className="h-3.5 w-3.5 text-red-400" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      Door
                    </div>
                    <div
                      className={`text-xs font-black ${vehicleData?.DoorLock ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {vehicleData?.DoorLock ? "LOCKED" : "UNLOCKED"}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 rounded-lg p-2 ${vehicleData?.GpsFixed ? "bg-emerald-500/10" : "bg-yellow-500/10"}`}
                >
                  <Navigation
                    className={`h-3.5 w-3.5 ${vehicleData?.GpsFixed ? "text-emerald-400" : "text-yellow-400"}`}
                  />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      GPS
                    </div>
                    <div
                      className={`text-xs font-black ${vehicleData?.GpsFixed ? "text-emerald-400" : "text-yellow-400"}`}
                    >
                      {vehicleData?.GpsFixed ? "FIXED" : "SEARCHING"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {vehicleData &&
              (vehicleData.OverSpeed ||
                vehicleData.Sos ||
                vehicleData.Collision ||
                vehicleData.LowVoltage) && (
                <div className="border-b border-gray-700/50 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    Active Alerts
                  </div>
                  <div className="space-y-1.5">
                    {vehicleData.OverSpeed && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400">
                        ⚠️ Over Speed Detected
                      </div>
                    )}
                    {vehicleData.Sos && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400">
                        🆘 SOS Alert Active
                      </div>
                    )}
                    {vehicleData.Collision && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-semibold text-red-400">
                        💥 Collision Detected
                      </div>
                    )}
                    {vehicleData.LowVoltage && (
                      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1.5 text-xs font-semibold text-yellow-400">
                        🔋 Low Battery Voltage
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Last Positions */}
            <div className="border-b border-gray-700/50 p-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Last Positions
              </div>
              <div className="space-y-1.5">
                {positionHistory
                  .slice(-3)
                  .reverse()
                  .map((pos, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-gray-800/30 px-3 py-2 text-xs"
                    >
                      <div className="font-mono text-gray-300">
                        {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
                      </div>
                      <div
                        className={`text-[10px] font-semibold ${idx === 0 ? "text-emerald-400" : "text-gray-500"}`}
                      >
                        {idx === 0 ? "Now" : formatDate(pos.timestamp)}
                      </div>
                    </div>
                  ))}
                {positionHistory.length === 0 && !loading && (
                  <div className="py-3 text-center text-xs text-gray-500">
                    No position data yet
                  </div>
                )}
              </div>
            </div>

            {/* Device Info */}
            <div className="p-4 pb-6">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Device Info
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                    <User className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {loading ? "Loading..." : vehicleData?.DeviceNo || "Unknown"}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      IMEI: {vehicleData?.Imei || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-700/50 pt-2">
                  <div className="text-[10px] text-gray-400">
                    Last Update:{" "}
                    {vehicleData?.GpsDate ? formatDate(vehicleData.GpsDate) : "N/A"}
                  </div>
                  <button className="rounded-full bg-emerald-500/10 p-1.5 text-emerald-400 transition hover:bg-emerald-500/20">
                    <Phone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}