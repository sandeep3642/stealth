"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@/context/ThemeContext";

// Static fleet data
const fleetData = [
  {
    id: 1,
    name: "HR 26 BY 1234",
    vehicleNumber: "V-1221",
    status: "MOVING",
    velocity: 65,
    ignition: "ON",
    driver: "Vikram Rathore",
    lastUpdate: "Live",
    position: [28.4595, 77.0266], // Gurgaon
  },
  {
    id: 2,
    name: "DL 1C ZA 5678",
    vehicleNumber: "V-6532",
    status: "BREAKDOWN",
    velocity: 0,
    ignition: "OFF",
    driver: "John Doe",
    lastUpdate: "10m ago",
    position: [28.367, 77.313], // Near Sector 1
  },
  {
    id: 3,
    name: "UP 16 AK 9999",
    vehicleNumber: "V-1122",
    status: "EXPIRED",
    velocity: 0,
    ignition: "OFF",
    driver: "Rahul Kumar",
    lastUpdate: "2h ago",
    position: [28.5355, 77.391], // East of Gurgaon
  },
  {
    id: 4,
    name: "HR 55 DD 4422",
    vehicleNumber: "V-2345",
    status: "MOVING",
    velocity: 80,
    ignition: "ON",
    driver: "Sandeep Singh",
    lastUpdate: "Live",
    position: [28.3949, 76.9635], // South Gurgaon
  },
  {
    id: 5,
    name: "DL 4S BR 1111",
    vehicleNumber: "V-8899",
    status: "OFFLINE",
    velocity: 0,
    ignition: "OFF",
    driver: "Amit Sharma",
    lastUpdate: "1h ago",
    position: [28.4517, 77.0727], // Central Gurgaon
  },
  {
    id: 6,
    name: "HR 26 CX 7788",
    vehicleNumber: "V-5544",
    status: "PARKED",
    velocity: 0,
    ignition: "OFF",
    driver: "Ravi Verma",
    lastUpdate: "30m ago",
    position: [28.4089, 77.3178], // East area
  },
  {
    id: 7,
    name: "DL 3C AB 2233",
    vehicleNumber: "V-9911",
    status: "IDLING",
    velocity: 0,
    ignition: "ON",
    driver: "Suresh Yadav",
    lastUpdate: "Live",
    position: [28.5244, 77.2066], // North area
  },
];

const getStatusColor = (status) => {
  const colors = {
    MOVING: "#10b981",
    BREAKDOWN: "#ef4444",
    EXPIRED: "#6b7280",
    OFFLINE: "#64748b",
    PARKED: "#3b82f6",
    IDLING: "#f59e0b",
  };
  return colors[status] || "#6b7280";
};

const getStatusIcon = (status) => {
  const icons = {
    MOVING: "→",
    BREAKDOWN: "⚠",
    EXPIRED: "✕",
    OFFLINE: "○",
    PARKED: "◼",
    IDLING: "⊙",
  };
  return icons[status] || "○";
};

export default function FleetDashboard() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const { isDark } = useTheme();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Calculate status counts
  const statusCounts = fleetData.reduce((acc, vehicle) => {
    acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: "ALL", count: fleetData.length, icon: "🚗" },
    { label: "MOVING", count: statusCounts.MOVING || 0, icon: "→" },
    { label: "IDLING", count: statusCounts.IDLING || 0, icon: "⊙" },
    { label: "PARKED", count: statusCounts.PARKED || 0, icon: "◼" },
    { label: "OFFLINE", count: statusCounts.OFFLINE || 0, icon: "○" },
    { label: "BREAKDOWN", count: statusCounts.BREAKDOWN || 0, icon: "⚠" },
    { label: "EXPIRED", count: statusCounts.EXPIRED || 0, icon: "✕" },
  ];

  const filteredFleet =
    filterStatus === "ALL"
      ? fleetData
      : fleetData.filter((v) => v.status === filterStatus);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView([28.4595, 77.0266], 11);

    // Add tile layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© CARTO",
        maxZoom: 19,
      },
    ).addTo(map);

    // Add zoom control to top right
    L.control.zoom({ position: "topright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for filtered vehicles
    filteredFleet.forEach((vehicle) => {
      const color = getStatusColor(vehicle.status);
      const icon = getStatusIcon(vehicle.status);

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div class="marker-container" style="
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <div style="
              width: 36px;
              height: 36px;
              background: ${color};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 18px;
              font-weight: 700;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              border: 3px solid white;
              transition: all 0.3s ease;
            ">
              ${icon}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker(vehicle.position, { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .on("click", () => setSelectedVehicle(vehicle));

      markersRef.current.push(marker);
    });
  }, [filteredFleet]);

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      {/* Header */}
      <header className={` ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                FLEET INTELLIGENCE
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Operations</span>
                <span className="text-gray-300">›</span>
                <span className="text-gray-700 font-medium">
                  Live Fleet Hub
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search plate or ID..."
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            Filter
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-sm">
          {/* Status tabs */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-4 gap-2">
              {stats.slice(0, 4).map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => setFilterStatus(stat.label)}
                  className={`p-3 rounded-lg transition-all text-left ${
                    filterStatus === stat.label
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="text-xs font-medium opacity-90 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold">{stat.count}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {stats.slice(4).map((stat) => (
                <button
                  key={stat.label}
                  onClick={() => setFilterStatus(stat.label)}
                  className={`p-3 rounded-lg transition-all text-left ${
                    filterStatus === stat.label
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="text-xs font-medium opacity-90 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold">{stat.count}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle list */}
          <div className="flex-1 overflow-y-auto">
            {filteredFleet.map((vehicle, index) => (
              <div
                key={vehicle.id}
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView(vehicle.position, 14);
                  }
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedVehicle?.id === vehicle.id
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : ""
                }`}
                style={{
                  animation: `slideInLeft 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                      style={{
                        backgroundColor: getStatusColor(vehicle.status),
                      }}
                    >
                      {getStatusIcon(vehicle.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">
                        {vehicle.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {vehicle.vehicleNumber}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                    style={{ backgroundColor: getStatusColor(vehicle.status) }}
                  >
                    {vehicle.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <span className="text-blue-600">⚡</span>
                      VELOCITY
                    </div>
                    <div className="font-bold text-gray-900 flex items-center gap-1">
                      <span className="text-blue-600">↑</span>
                      {vehicle.velocity} KM/H
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <span
                        className={
                          vehicle.ignition === "ON"
                            ? "text-green-500"
                            : "text-gray-400"
                        }
                      >
                        🔑
                      </span>
                      IGNITION
                    </div>
                    <div
                      className={`font-bold flex items-center gap-2 ${vehicle.ignition === "ON" ? "text-green-600" : "text-gray-500"}`}
                    >
                      {vehicle.ignition === "ON" && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      )}
                      {vehicle.ignition}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {vehicle.driver}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {vehicle.lastUpdate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />

          {/* Map overlay info */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-[1000]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-900">
                Live Tracking Active
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Monitoring {filteredFleet.length}{" "}
              {filteredFleet.length === 1 ? "vehicle" : "vehicles"} in real-time
            </p>
          </div>

          {/* Attribution */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 z-[1000] shadow-md">
            <a
              href="https://leafletjs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600"
            >
              Leaflet
            </a>
            {" | "}
            <a
              href="https://carto.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600"
            >
              © CARTO
            </a>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .custom-marker {
          background: transparent;
          border: none;
        }

        .marker-container:hover > div {
          transform: scale(1.15);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        .leaflet-container {
          font-family: inherit;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
        }

        .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
