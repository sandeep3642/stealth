import { vtsApi } from "./apiService";
import axios from "axios";

const LIVE_TRACKING_BASE_URL =
  "/live-tracking-proxy";

const liveTrackingApi = axios.create({
  baseURL: LIVE_TRACKING_BASE_URL,
});

export const DEFAULT_FLEET_VEHICLES = [
  "AP11AA1111",
  "HR29CA6032",
  "DL8CAF5031",
];

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asString(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function pickFirst(obj, keys) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return undefined;
}

function normalizeStatus(rawStatus, speed, ignition) {
  const status = asString(rawStatus).toUpperCase().replaceAll("-", "_");
  const ign = asString(ignition).toUpperCase();

  if (status.includes("BREAK")) return "BREAKDOWN";
  if (status.includes("EXPIRE")) return "EXPIRED";
  if (status.includes("OFFLINE") || status.includes("NO_SIGNAL")) return "OFFLINE";
  if (status.includes("PARK")) return "PARKED";
  if (status.includes("IDL")) return "IDLING";
  if (status.includes("MOVE") || status.includes("RUN")) return "MOVING";

  if (speed > 0) return "MOVING";
  if (ign === "ON" || ign === "1" || ign === "TRUE") return "IDLING";
  return "PARKED";
}

function normalizeLiveTrackingRecord(record, fallbackVehicleNo = "", idx = 0) {
  const lat = asNumber(
    pickFirst(record, ["lat", "latitude", "gpsLat", "gpsLatitude", "y"]),
  );
  const lng = asNumber(
    pickFirst(record, ["lng", "lon", "longitude", "gpsLng", "gpsLongitude", "x"]),
  );

  if (lat === null || lng === null) return null;

  const vehicleNo = asString(
    pickFirst(record, [
      "vehicleNo",
      "vehicleNumber",
      "registrationNo",
      "registrationNumber",
      "vehicle",
      "vehicleno",
    ]),
  ) || fallbackVehicleNo;

  const speed =
    asNumber(pickFirst(record, ["speed", "speedKmph", "velocity", "spd"])) ?? 0;
  const ignitionRaw = pickFirst(record, ["ignition", "ignitionStatus", "ign"]);
  const ignition = (() => {
    const value = asString(ignitionRaw).toUpperCase();
    if (value === "1" || value === "ON" || value === "TRUE") return "ON";
    if (value === "0" || value === "OFF" || value === "FALSE") return "OFF";
    return speed > 0 ? "ON" : "OFF";
  })();

  const status = normalizeStatus(
    pickFirst(record, ["status", "vehicleStatus", "state"]),
    speed,
    ignition,
  );

  return {
    id: vehicleNo || `vehicle-${idx}`,
    name: vehicleNo || `Vehicle ${idx + 1}`,
    vehicleNumber: vehicleNo || `Vehicle ${idx + 1}`,
    status,
    velocity: Math.round(speed),
    ignition,
    driver:
      asString(pickFirst(record, ["driverName", "driver", "driverFullName"])) ||
      "Unknown Driver",
    lastUpdate:
      asString(pickFirst(record, ["lastUpdate", "updatedAt", "timestamp", "gpsTime"])) ||
      "Live",
    position: [lat, lng],
    raw: record,
  };
}

export async function getLiveTrackingBatch(vehicleNos = DEFAULT_FLEET_VEHICLES) {
  const list = vehicleNos.filter(Boolean);
  if (!list.length) return [];

  const { data } = await liveTrackingApi.get("/api/live-tracking/batch", {
    params: { vehicleNos: list.join(",") },
  });

  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.vehicles)
        ? data.vehicles
        : [];

  return rows
    .map((row, index) => normalizeLiveTrackingRecord(row, list[index] || "", index))
    .filter(Boolean);
}

export async function getLiveTrackingByKey(vehicleNo) {
  const key = `dashboard::${vehicleNo}`;
  const { data } = await liveTrackingApi.get("/api/live-tracking", {
    params: { key },
  });
  const payload =
    data?.data && typeof data.data === "object" && !Array.isArray(data.data)
      ? data.data
      : data;
  return normalizeLiveTrackingRecord(payload, vehicleNo);
}

// Fetch live tracking data for a specific Redis key
export const getLiveTrackingData = async (key) => {
  if (!key) throw new Error("Redis key is required");
  try {
    const res = await vtsApi.get("/api/redis/get", {
      params: { key },
    });
    return res.data;
  } catch (err) {
    if (err.response) {
      console.error("[getLiveTrackingData] Error Response:", err.response);
    } else {
      console.error("[getLiveTrackingData] Error:", err);
    }
    throw err;
  }
};
