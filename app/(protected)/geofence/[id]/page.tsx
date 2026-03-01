"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useTheme } from "@/context/ThemeContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Save, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import GeofenceMap from "@/components/GeofenceMap";
import PageHeader from "@/components/PageHeader";
import MapLocationPicker from "@/components/MapLocationPicker";
import type {
  GeofenceZone,
  GeometryType,
  ZoneClassification,
  ZoneStatus,
} from "@/interfaces/geofence.interface";
import {
  createGeofence,
  getGeofenceById,
  updateGeofence,
} from "@/services/geofenceService";
import { getAllAccounts } from "@/services/commonServie";
import {
  getGoogleMapsApiKey,
  GOOGLE_MAPS_LIBRARIES,
  GOOGLE_MAPS_SCRIPT_ID,
} from "@/hooks/googleMapsConfig";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

const CLASSIFICATIONS: ZoneClassification[] = [
  "Warehouse",
  "Port",
  "Client Site",
  "Depot",
  "Restricted Area",
];

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

export default function GeofenceDetailPage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const isCreateMode = id === "0";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [accounts, setAccounts] = useState<{ id: number; value: string }[]>([]);
  const [drawingKey, setDrawingKey] = useState(0);

  const [accountId, setAccountId] = useState(0);
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [classification, setClassification] =
    useState<ZoneClassification>("Warehouse");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [geometry, setGeometry] = useState<GeometryType>("polygon");
  const [status, setStatus] = useState<ZoneStatus>("enabled");
  const [radius, setRadius] = useState(100);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [paths, setPaths] = useState<{ lat: number; lng: number }[]>([]);

  // shapeDrawn: true means we have valid shape data (either loaded or drawn)
  const [shapeDrawn, setShapeDrawn] = useState(false);
  // isRedrawing: true means drawing tool is active (create mode always, edit mode when user clicks Redraw)
  const [isRedrawing, setIsRedrawing] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: GOOGLE_MAPS_SCRIPT_ID,
    googleMapsApiKey: getGoogleMapsApiKey(),
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const onMapLoad = useCallback((m: google.maps.Map) => setMap(m), []);

  // ─── Fetch accounts ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await getAllAccounts();
        const list = Array.isArray(response?.data) ? response.data : [];
        setAccounts(list);

        let userAccountId = 0;
        if (typeof window !== "undefined") {
          try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            userAccountId = Number(user?.accountId || 0);
          } catch {
            userAccountId = 0;
          }
        }

        if (userAccountId > 0) {
          setAccountId(userAccountId);
        } else if (list.length > 0) {
          setAccountId(Number(list[0].id || 0));
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  // ─── Load existing zone ───────────────────────────────────────────────────
  useEffect(() => {
    const loadZone = async () => {
      if (isCreateMode) {
        const geometryFromQuery = searchParams.get("geometry");
        if (geometryFromQuery === "circle" || geometryFromQuery === "polygon") {
          setGeometry(geometryFromQuery);
        }
        setCenter(DEFAULT_CENTER);
        setIsRedrawing(true); // start in drawing mode for create
        setLoading(false);
        return;
      }

      try {
        const response = await getGeofenceById(id);
        if (!response?.success) {
          toast.error(response?.message || "Failed to load geofence");
          setLoading(false);
          return;
        }

        const zone =
          response?.data?.zone || response?.data?.geofence || response?.data;
        const coordinates = Array.isArray(zone?.coordinates)
          ? zone.coordinates
          : [];
        const first = coordinates[0];
        const loadedGeometry: GeometryType =
          zone?.geometryType === "POLYGON" ? "polygon" : "circle";

        setAccountId((prev) => Number(zone?.accountId || prev || 0));
        setCode(String(zone?.uniqueCode || ""));
        setDisplayName(String(zone?.displayName || ""));
        setClassification(
          String(zone?.classificationCode || "Warehouse") as ZoneClassification,
        );
        setColor(zone?.colorTheme || PRESET_COLORS[0]);
        setGeometry(loadedGeometry);
        setStatus(zone?.status === "ENABLED" ? "enabled" : "disabled");
        setRadius(Number(zone?.radiusM || 100));
        setCenter(
          first
            ? { lat: Number(first.latitude), lng: Number(first.longitude) }
            : null,
        );
        setPaths(
          coordinates.map((coord: { latitude: number; longitude: number }) => ({
            lat: Number(coord.latitude),
            lng: Number(coord.longitude),
          })),
        );
        setShapeDrawn(true);
        setIsRedrawing(false); // edit mode starts in view mode, not drawing
      } catch (error) {
        console.error("Error loading geofence:", error);
        toast.error("Error loading geofence");
      } finally {
        setLoading(false);
      }
    };

    loadZone();
  }, [id, isCreateMode, searchParams]);

  // ─── When geometry type changes, reset drawing state ─────────────────────
  useEffect(() => {
    if (isCreateMode) {
      setPaths([]);
      setCenter(null); // ← ADD
      setShapeDrawn(false);
      setIsRedrawing(true);
      setDrawingKey((prev) => prev + 1);
    } else if (isRedrawing) {
      setPaths([]);
      setCenter(null); // ← ADD
      setShapeDrawn(false);
      setDrawingKey((prev) => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry]);

  // ─── Drawing complete handlers ────────────────────────────────────────────
  const handlePolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    const newPaths = polygon
      .getPath()
      .getArray()
      .map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }));

    setPaths(newPaths);

    if (newPaths.length > 0) {
      const lat = newPaths.reduce((s, p) => s + p.lat, 0) / newPaths.length;
      const lng = newPaths.reduce((s, p) => s + p.lng, 0) / newPaths.length;
      setCenter({ lat, lng });
    }

    setShapeDrawn(true);
    setIsRedrawing(false);
    polygon.setMap(null);
  }, []);

  const handleCircleComplete = useCallback((circle: google.maps.Circle) => {
    const c = circle.getCenter();
    if (c) setCenter({ lat: c.lat(), lng: c.lng() });
    setRadius(Math.round(circle.getRadius()));
    setShapeDrawn(true);
    setIsRedrawing(false);
    circle.setMap(null);
  }, []);

  // Store original shape data for cancel restoration
  const [originalShape, setOriginalShape] = useState<{
    center: { lat: number; lng: number } | null;
    paths: { lat: number; lng: number }[];
    radius: number;
  } | null>(null);

  const handleStartRedraw = useCallback(() => {
    // Save current shape before clearing
    setOriginalShape({ center, paths, radius });
    setPaths([]);
    setCenter(null);
    setRadius(0);
    setShapeDrawn(false);
    setIsRedrawing(true);
    setDrawingKey((prev) => prev + 1);
  }, [center, paths, radius]);

  const handleCancelRedraw = useCallback(() => {
    if (originalShape) {
      // Restore the saved shape
      setCenter(originalShape.center);
      setPaths(originalShape.paths);
      setRadius(originalShape.radius);
      setShapeDrawn(true);
    }
    setIsRedrawing(false);
    setOriginalShape(null);
  }, [originalShape]);

  // ─── Preview zone for map rendering ──────────────────────────────────────
  const previewZone: GeofenceZone = useMemo(
    () => ({
      id: id || "preview",
      code,
      displayName: displayName || "New Geofence",
      classification,
      geometry,
      status,
      color,
      center: geometry === "circle" ? center || undefined : undefined,
      radius: geometry === "circle" ? radius : undefined,
      paths: geometry === "polygon" && paths.length > 0 ? paths : undefined,
    }),
    [
      id,
      code,
      displayName,
      classification,
      geometry,
      status,
      color,
      center,
      radius,
      paths,
    ],
  );

  // ─── Save handler ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!accountId) {
      toast.error("Please select an account");
      return;
    }
    if (!code.trim() || !displayName.trim()) {
      toast.error("Unique code and display name are required");
      return;
    }
    if (!shapeDrawn) {
      toast.error(
        geometry === "polygon"
          ? "Please draw a polygon on the map before saving"
          : "Please draw a circle on the map before saving",
      );
      return;
    }
    if (isRedrawing) {
      toast.error("Please finish drawing your shape on the map before saving");
      return;
    }

    setSaving(true);
    try {
      const classificationCode = classification
        .toUpperCase()
        .replace(/\s+/g, "_");
      const geometryType = geometry === "polygon" ? "POLYGON" : "CIRCLE";

      const coordinates =
        geometry === "polygon"
          ? paths.map((point) => ({
              latitude: point.lat,
              longitude: point.lng,
            }))
          : center
            ? [{ latitude: center.lat, longitude: center.lng }]
            : [];

      if (coordinates.length === 0) {
        toast.error("Please draw your geofence on the map before saving");
        setSaving(false);
        return;
      }

      const payload = {
        accountId: Number(accountId),
        uniqueCode: code.trim(),
        displayName: displayName.trim(),
        description: "",
        classificationCode,
        classificationLabel: classification,
        geometryType,
        radiusM: geometry === "circle" ? Number(radius || 0) : 0,
        coordinatesJson: JSON.stringify(coordinates),
        coordinates,
        colorTheme: color,
        opacity: 0.6,
        isEnabled: status === "enabled",
      };

      const response = isCreateMode
        ? await createGeofence(payload)
        : await updateGeofence(id, payload);

      if (response?.success) {
        toast.success(
          isCreateMode
            ? "Geofence created successfully"
            : "Geofence updated successfully",
        );
        router.push("/geofence");
      } else {
        toast.error(response?.message || "Failed to save geofence");
      }
    } catch (error) {
      console.error("Error saving geofence:", error);
      toast.error("Error saving geofence");
    } finally {
      setSaving(false);
    }
  };

  // ─── Style helpers ────────────────────────────────────────────────────────
  const inputCls = `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
    isDark
      ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
  }`;
  const labelCls = `block text-[10px] font-bold tracking-widest mb-1.5 ${
    isDark ? "text-gray-400" : "text-gray-500"
  }`;

  if (loading) {
    return (
      <div
        className={`${isDark ? "dark" : ""} flex items-center justify-center h-screen`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading zone...</p>
        </div>
      </div>
    );
  }

  const showDrawingTool = isRedrawing && map;

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title={isCreateMode ? "Create Geofence" : "Edit Geofence"}
          subtitle={
            isCreateMode
              ? "Create new geofence with identity and geometry rules."
              : "Update geofence identity and operational settings."
          }
          breadcrumbs={[
            { label: "Configurations" },
            { label: "Geofence Library", href: "/geofence" },
            { label: isCreateMode ? "Create" : code || "Edit" },
          ]}
          showButton={true}
          buttonText={
            saving
              ? "Saving..."
              : isCreateMode
                ? "Create Geofence"
                : "Save Changes"
          }
          buttonIcon={saving ? undefined : <Save className="w-4 h-4" />}
          onButtonClick={handleSave}
          showExportButton={false}
          showFilterButton={false}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* ── Sidebar ── */}
          <aside
            className={`w-[420px] flex-shrink-0 flex flex-col border-r overflow-y-auto ${
              isDark
                ? "bg-background border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="px-5 py-5 space-y-6">
              {/* Identity */}
              <section>
                <h3
                  className={`text-[10px] font-bold tracking-widest mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  IDENTITY & REGISTRY
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>ACCOUNT</label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(Number(e.target.value))}
                      className={inputCls}
                    >
                      <option value={0}>Select account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.value}
                        </option>
                      ))}
                    </select>
                  </div>
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
                  <div>
                    <label className={labelCls}>LOCATION (CENTER)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Latitude"
                        value={center?.lat ?? ""}
                        onChange={(e) =>
                          setCenter((prev) => ({
                            lat: Number(e.target.value || 0),
                            lng: prev?.lng ?? DEFAULT_CENTER.lng,
                          }))
                        }
                        className={inputCls}
                      />
                      <input
                        type="number"
                        step="0.000001"
                        placeholder="Longitude"
                        value={center?.lng ?? ""}
                        onChange={(e) =>
                          setCenter((prev) => ({
                            lat: prev?.lat ?? DEFAULT_CENTER.lat,
                            lng: Number(e.target.value || 0),
                          }))
                        }
                        className={inputCls}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLocationPickerOpen(true)}
                      className={`mt-2 px-3 py-2 rounded-lg text-xs font-semibold border ${
                        isDark
                          ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Pick on Map
                    </button>
                  </div>
                </div>
              </section>

              {/* Zone Config */}
              <section>
                <h3
                  className={`text-[10px] font-bold tracking-widest mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  ZONE CONFIG
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>CLASSIFICATION</label>
                    <select
                      value={classification}
                      onChange={(e) =>
                        setClassification(e.target.value as ZoneClassification)
                      }
                      className={inputCls}
                    >
                      {CLASSIFICATIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>GEOMETRY TYPE</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["circle", "polygon"] as GeometryType[]).map((item) => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setGeometry(item)}
                          className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                            geometry === item
                              ? "border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-950"
                              : isDark
                                ? "border-gray-700 text-gray-300 hover:border-gray-500"
                                : "border-gray-200 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {item.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    {!isCreateMode && (
                      <p
                        className={`mt-1.5 text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        Changing geometry type will require you to redraw the
                        shape.
                      </p>
                    )}
                  </div>

                  {geometry === "circle" && (
                    <div>
                      <label className={labelCls}>RADIUS (M)</label>
                      <input
                        type="number"
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value || 0))}
                        className={inputCls}
                      />
                    </div>
                  )}

                  <div>
                    <label className={labelCls}>STATUS</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ZoneStatus)}
                      className={inputCls}
                    >
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelCls}>COLOR THEME</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((item) => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setColor(item)}
                          className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                          style={{
                            background: item,
                            boxShadow:
                              color === item
                                ? `0 0 0 2px white, 0 0 0 4px ${item}`
                                : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Drawing / Shape status panel */}
              <section>
                <div
                  className={`rounded-lg p-3 text-xs border space-y-2 ${
                    isRedrawing
                      ? isDark
                        ? "bg-amber-950 border-amber-800 text-amber-300"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                      : shapeDrawn
                        ? isDark
                          ? "bg-green-950 border-green-800 text-green-400"
                          : "bg-green-50 border-green-200 text-green-700"
                        : isDark
                          ? "bg-indigo-950 border-indigo-800 text-indigo-400"
                          : "bg-indigo-50 border-indigo-200 text-indigo-700"
                  }`}
                >
                  {isRedrawing ? (
                    <>
                      <p>
                        🖊️ Drawing mode active — click on the map to draw your{" "}
                        <strong>
                          {geometry === "circle" ? "circle" : "polygon"}
                        </strong>
                        .{" "}
                        {geometry === "polygon"
                          ? "Click to add points, double-click to finish."
                          : "Click center then drag to set radius."}
                      </p>
                      {!isCreateMode && (
                        <button
                          type="button"
                          onClick={handleCancelRedraw}
                          className="underline font-semibold"
                        >
                          Cancel redraw
                        </button>
                      )}
                    </>
                  ) : shapeDrawn ? (
                    <div className="flex items-center justify-between">
                      <span>✅ Shape ready.</span>
                      <button
                        type="button"
                        onClick={handleStartRedraw}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                          isDark
                            ? "border-green-700 text-green-300 hover:bg-green-900"
                            : "border-green-400 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        <Pencil className="w-3 h-3" />
                        Redraw Shape
                      </button>
                    </div>
                  ) : (
                    <p>⚠️ No shape drawn yet. Click on the map to begin.</p>
                  )}
                </div>
              </section>
            </div>
          </aside>

          {/* ── Map ── */}
          <main className="flex-1 relative">
            {isLoaded ? (
              <>
                <GeofenceMap
                  key={isRedrawing ? "drawing" : "viewing"} // ← ADD THIS
                  zones={isRedrawing ? [] : [previewZone]}
                  isDark={isDark}
                  onMapLoad={onMapLoad}
                  zoom={13}
                  center={center || DEFAULT_CENTER}
                />

                {showDrawingTool && (
                  <DrawingManagerOverlay
                    key={drawingKey}
                    map={map}
                    geometry={geometry}
                    color={color}
                    onPolygonComplete={handlePolygonComplete}
                    onCircleComplete={handleCircleComplete}
                  />
                )}

                {/* Drawing mode indicator overlay on map */}
                {isRedrawing && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                    <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                      ✏️ Drawing mode — draw your {geometry} on the map
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
              </div>
            )}

            {/* Zoom controls */}
            <div className="absolute bottom-8 right-3 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => map?.setZoom((map.getZoom() ?? 13) + 1)}
                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-700 dark:text-gray-300 font-bold text-lg"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => map?.setZoom((map.getZoom() ?? 13) - 1)}
                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg shadow text-gray-700 dark:text-gray-300 font-bold text-lg"
              >
                -
              </button>
            </div>
          </main>
        </div>

        <MapLocationPicker
          isOpen={isLocationPickerOpen}
          onClose={() => setIsLocationPickerOpen(false)}
          onSelect={(loc) => setCenter({ lat: loc.lat, lng: loc.lng })}
          initialLocation={center || DEFAULT_CENTER}
          isDark={isDark}
          googleMapsApiKey={getGoogleMapsApiKey()}
        />
      </div>
    </div>
  );
}

// ─── DrawingManagerOverlay ────────────────────────────────────────────────
interface DrawingManagerOverlayProps {
  map: google.maps.Map;
  geometry: GeometryType;
  color: string;
  onPolygonComplete: (polygon: google.maps.Polygon) => void;
  onCircleComplete: (circle: google.maps.Circle) => void;
}

function DrawingManagerOverlay({
  map,
  geometry,
  color,
  onPolygonComplete,
  onCircleComplete,
}: DrawingManagerOverlayProps) {
  useEffect(() => {
    if (!map || typeof google === "undefined") return;

    const shapeOptions = {
      fillColor: color,
      strokeColor: color,
      fillOpacity: 0.35,
      strokeWeight: 2,
      editable: false,
      clickable: false,
    };

    const dm = new google.maps.drawing.DrawingManager({
      drawingMode:
        geometry === "circle"
          ? google.maps.drawing.OverlayType.CIRCLE
          : google.maps.drawing.OverlayType.POLYGON,
      drawingControl: false,
      polygonOptions: shapeOptions,
      circleOptions: shapeOptions,
    });

    dm.setMap(map);

    const polygonListener = google.maps.event.addListener(
      dm,
      "polygoncomplete",
      (polygon: google.maps.Polygon) => {
        onPolygonComplete(polygon);
        dm.setDrawingMode(null);
        dm.setMap(null);
      },
    );

    const circleListener = google.maps.event.addListener(
      dm,
      "circlecomplete",
      (circle: google.maps.Circle) => {
        onCircleComplete(circle);
        dm.setDrawingMode(null);
        dm.setMap(null);
      },
    );

    return () => {
      google.maps.event.removeListener(polygonListener);
      google.maps.event.removeListener(circleListener);
      dm.setMap(null);
    };
  }, [map, geometry, color, onPolygonComplete, onCircleComplete]);

  return null;
}
