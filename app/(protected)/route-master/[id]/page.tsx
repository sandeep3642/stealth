"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, DirectionsRenderer } from "@react-google-maps/api";
import { Plus, Route, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { useGoogleMapsSdk } from "@/hooks/useGoogleMapsSdk";
import type {
  DropdownOption,
  RouteMasterFormData,
} from "@/interfaces/routeMaster.interface";
import {
  getAllAccounts,
  getGeofenceDropdownByAccount,
} from "@/services/commonServie";
import {
  getRouteMasterById,
  saveRouteMaster,
  updateRouteMaster,
} from "@/services/routeMasterService";
import { getGeofenceById } from "@/services/geofenceService";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

interface SegmentSummary {
  from: string;
  to: string;
  distanceText: string;
  durationText: string;
}

interface GeofenceLatLng {
  lat: number;
  lng: number;
}

const toOptions = (response: any): DropdownOption[] => {
  const data = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  return data.map((item: any) => ({
    id: Number(item?.id ?? item?.value ?? 0),
    value: String(item?.value ?? item?.name ?? item?.label ?? item?.id ?? ""),
  }));
};

const getUserData = () => {
  if (typeof window === "undefined") return { accountId: 0, userId: 0 };
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      accountId: Number(user?.accountId || 0),
      userId: Number(user?.id || user?.userId || 0),
    };
  } catch {
    return { accountId: 0, userId: 0 };
  }
};

const AddEditRouteMasterPage: React.FC = () => {
  const { isDark } = useTheme();
  const { isLoaded, loadError } = useGoogleMapsSdk();
  const router = useRouter();
  const params = useParams();
  const routeId = params?.id ? Number(params.id) : 0;
  const isEditMode = routeId > 0;

  const mapRef = useRef<google.maps.Map | null>(null);

  const [accounts, setAccounts] = useState<DropdownOption[]>([]);
  const [geofences, setGeofences] = useState<DropdownOption[]>([]);
  const [formData, setFormData] = useState<RouteMasterFormData>({
    accountId: 0,
    routeName: "",
    isGeofenceRelated: true,
    startGeofenceId: 0,
    endGeofenceId: 0,
    stopGeofenceIds: [],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [directionsResult, setDirectionsResult] =
    useState<google.maps.DirectionsResult | null>(null);
  const [segmentSummaries, setSegmentSummaries] = useState<SegmentSummary[]>(
    [],
  );

  const fetchGeofenceDropdown = async (accountId: number) => {
    const res = await getGeofenceDropdownByAccount(accountId);
    return toOptions(res);
  };

  const fetchAccounts = async () => {
    try {
      const response = await getAllAccounts();
      setAccounts(toOptions(response));
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchById = useCallback(async () => {
    try {
      setFetchingData(true);
      const response = await getRouteMasterById(routeId);
      const data =
        response?.data?.route || response?.data?.routeMaster || response?.data;

      if (!data) {
        toast.error("Route master not found");
        router.push("/route-master");
        return;
      }

      const parsedStops = Array.isArray(data?.stopGeofenceIds)
        ? data.stopGeofenceIds.map((value: any) => Number(value || 0))
        : Array.isArray(data?.stops)
          ? data.stops
              .map((item: any) =>
                Number(item?.geofenceId || item?.stopGeofenceId || 0),
              )
              .filter((item: number) => item > 0)
          : [];

      const nextFormData: RouteMasterFormData = {
        accountId: Number(data?.accountId || 0),
        routeName: String(data?.routeName || data?.name || ""),
        isGeofenceRelated: Boolean(data?.isGeofenceRelated ?? true),
        startGeofenceId: Number(data?.startGeofenceId || 0),
        endGeofenceId: Number(data?.endGeofenceId || 0),
        stopGeofenceIds: parsedStops,
        isActive: Boolean(data?.isActive ?? true),
      };

      setFormData(nextFormData);
      if (nextFormData.accountId > 0) {
        const geofenceOptions = await fetchGeofenceDropdown(nextFormData.accountId);
        setGeofences(geofenceOptions);
      }
    } catch (error) {
      console.error("Error fetching route by id:", error);
      toast.error("Failed to fetch route details");
      router.push("/route-master");
    } finally {
      setFetchingData(false);
    }
  }, [routeId, router]);

  useEffect(() => {
    const { accountId } = getUserData();
    fetchAccounts();
    if (!isEditMode) {
      setFormData((prev) => ({
        ...prev,
        accountId: prev.accountId || accountId,
      }));
    }
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode) {
      fetchById();
    }
  }, [isEditMode, fetchById]);

  useEffect(() => {
    const accountId = Number(formData.accountId || 0);
    if (!accountId) {
      setGeofences([]);
      return;
    }

    fetchGeofenceDropdown(accountId)
      .then((options) => setGeofences(options))
      .catch((error) => {
        console.error("Error fetching geofence dropdown:", error);
        toast.error("Failed to load geofence dropdown");
      });
  }, [formData.accountId]);

  const hasSelectedAccountInList = useMemo(
    () =>
      Number(formData.accountId) > 0 &&
      accounts.some((account) => Number(account.id) === Number(formData.accountId)),
    [accounts, formData.accountId],
  );

  const waypointIds = useMemo(() => {
    const stopIds = formData.stopGeofenceIds.filter((id) => id > 0);
    return [
      Number(formData.startGeofenceId || 0),
      ...stopIds,
      Number(formData.endGeofenceId || 0),
    ].filter((id) => id > 0);
  }, [formData.startGeofenceId, formData.stopGeofenceIds, formData.endGeofenceId]);

  const resolveGeofenceLatLng = useCallback(
    async (geofenceId: number): Promise<GeofenceLatLng | null> => {
      const response = await getGeofenceById(geofenceId);
      const zone =
        response?.data?.zone || response?.data?.geofence || response?.data;
      const coordinates = Array.isArray(zone?.coordinates)
        ? zone.coordinates
        : [];

      if (coordinates.length === 0) {
        return null;
      }

      const geometryType = String(zone?.geometryType || "").toUpperCase();
      if (geometryType === "POLYGON" && coordinates.length > 1) {
        const lat =
          coordinates.reduce(
            (sum: number, point: any) => sum + Number(point?.latitude || 0),
            0,
          ) / coordinates.length;
        const lng =
          coordinates.reduce(
            (sum: number, point: any) => sum + Number(point?.longitude || 0),
            0,
          ) / coordinates.length;
        return { lat, lng };
      }

      return {
        lat: Number(coordinates[0]?.latitude || 0),
        lng: Number(coordinates[0]?.longitude || 0),
      };
    },
    [],
  );

  const addStop = () => {
    setFormData((prev) => ({
      ...prev,
      stopGeofenceIds: [...prev.stopGeofenceIds, 0],
    }));
  };

  const removeStop = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stopGeofenceIds: prev.stopGeofenceIds.filter((_, idx) => idx !== index),
    }));
  };

  const updateStop = (index: number, value: number) => {
    setFormData((prev) => ({
      ...prev,
      stopGeofenceIds: prev.stopGeofenceIds.map((item, idx) =>
        idx === index ? value : item,
      ),
    }));
  };

  const calculateRoute = async () => {
    if (!isLoaded || !window.google) {
      toast.error("Google Maps SDK is not loaded");
      return;
    }
    if (!formData.startGeofenceId || !formData.endGeofenceId) {
      toast.error("Please select start and end geofence");
      return;
    }
    if (waypointIds.length < 2) {
      toast.error("Please select at least start and end geofence");
      return;
    }

    try {
      setPreviewLoading(true);
      const resolvedPoints = await Promise.all(
        waypointIds.map(async (id) => ({
          id,
          point: await resolveGeofenceLatLng(id),
        })),
      );
      const invalidPoint = resolvedPoints.find((item) => !item.point);
      if (invalidPoint) {
        toast.error(`Unable to resolve geofence coordinates for ID ${invalidPoint.id}`);
        setPreviewLoading(false);
        return;
      }

      const routePoints = resolvedPoints.map(
        (item) => item.point as google.maps.LatLngLiteral,
      );
      const directionsService = new window.google.maps.DirectionsService();

      const response = await directionsService.route({
        origin: routePoints[0],
        destination: routePoints[routePoints.length - 1],
        waypoints: routePoints.slice(1, -1).map((point) => ({
          location: point,
          stopover: true,
        })),
        optimizeWaypoints: false,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setDirectionsResult(response);
      const legs = response.routes?.[0]?.legs || [];
      setSegmentSummaries(
        legs.map((leg) => ({
          from: leg.start_address,
          to: leg.end_address,
          distanceText: leg.distance?.text || "-",
          durationText: leg.duration?.text || "-",
        })),
      );
    } catch (error) {
      console.error("Directions error:", error);
      toast.error("Unable to build route preview for selected points");
      setDirectionsResult(null);
      setSegmentSummaries([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current || !directionsResult?.routes?.[0]?.bounds) return;
    mapRef.current.fitBounds(directionsResult.routes[0].bounds);
  }, [directionsResult]);

  const validateForm = () => {
    if (!formData.accountId) {
      toast.error("Please select account");
      return false;
    }
    if (!formData.routeName.trim()) {
      toast.error("Please enter route name");
      return false;
    }
    if (!formData.startGeofenceId || !formData.endGeofenceId) {
      toast.error("Please select start and end geofence");
      return false;
    }
    if (formData.startGeofenceId === formData.endGeofenceId) {
      toast.error("Start and end geofence should be different");
      return false;
    }
    const hasInvalidStop = formData.stopGeofenceIds.some((id) => !id);
    if (hasInvalidStop) {
      toast.error("Please select geofence for each added stop");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const { userId } = getUserData();

    const payload = {
      accountId: Number(formData.accountId),
      routeName: formData.routeName.trim(),
      isGeofenceRelated: Boolean(formData.isGeofenceRelated),
      startGeofenceId: Number(formData.startGeofenceId),
      endGeofenceId: Number(formData.endGeofenceId),
      stopGeofenceIds: formData.stopGeofenceIds
        .map((id) => Number(id))
        .filter((id) => id > 0),
      isActive: Boolean(formData.isActive),
      ...(isEditMode
        ? { updatedBy: Number(userId || 0) }
        : { createdBy: Number(userId || 0) }),
    };

    try {
      setLoading(true);
      const response = isEditMode
        ? await updateRouteMaster(routeId, payload)
        : await saveRouteMaster(payload);

      if (response?.success || response?.statusCode === 200) {
        toast.success(
          response?.message ||
            (isEditMode ? "Route updated successfully" : "Route created successfully"),
        );
        router.push("/route-master");
      } else {
        toast.error(response?.message || "Failed to save route");
      }
    } catch (error) {
      console.error("Save route error:", error);
      toast.error("Error saving route");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
    isDark
      ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
  }`;
  const labelCls = `block text-[10px] font-bold tracking-widest mb-1.5 ${
    isDark ? "text-gray-400" : "text-gray-500"
  }`;
  const cardCls = `rounded-xl border p-5 ${
    isDark ? "border-gray-800 bg-gray-800/30" : "border-gray-200 bg-white"
  }`;

  if (fetchingData) {
    return (
      <div className={`${isDark ? "dark" : ""}`}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground">Loading route details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title={isEditMode ? "Edit Route Master" : "Create Route Master"}
          subtitle="Define start/end geofence points, optional stops, and preview route timing."
          breadcrumbs={[
            { label: "Fleet" },
            { label: "Route Master", href: "/route-master" },
            { label: isEditMode ? "Edit" : "Create" },
          ]}
          showButton={true}
          buttonText={loading ? "Saving..." : isEditMode ? "Update Route" : "Create Route"}
          buttonIcon={loading ? undefined : <Save className="w-4 h-4" />}
          onButtonClick={handleSave}
          showExportButton={false}
          showFilterButton={false}
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <section className={`${cardCls} space-y-4`}>
            <div>
              <label className={labelCls}>ACCOUNT</label>
              <select
                value={formData.accountId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    accountId: Number(e.target.value),
                    startGeofenceId: 0,
                    endGeofenceId: 0,
                    stopGeofenceIds: [],
                  }))
                }
                className={inputCls}
                disabled={loading}
              >
                <option value={0}>Select account</option>
                {!hasSelectedAccountInList && Number(formData.accountId) > 0 && (
                  <option value={formData.accountId}>
                    {`Selected Account (${formData.accountId})`}
                  </option>
                )}
                {accounts.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>ROUTE NAME</label>
              <input
                type="text"
                value={formData.routeName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, routeName: e.target.value }))
                }
                className={inputCls}
                placeholder="Enter route name"
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelCls}>GEOFENCE RELATED</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isGeofenceRelated: true }))
                  }
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                    formData.isGeofenceRelated
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                      : isDark
                        ? "border-gray-700 text-gray-300"
                        : "border-gray-200 text-gray-700"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isGeofenceRelated: false }))
                  }
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                    !formData.isGeofenceRelated
                      ? "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30"
                      : isDark
                        ? "border-gray-700 text-gray-300"
                        : "border-gray-200 text-gray-700"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <label className={labelCls}>START POINT (GEOFENCE)</label>
              <select
                value={formData.startGeofenceId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startGeofenceId: Number(e.target.value),
                  }))
                }
                className={inputCls}
                disabled={loading}
              >
                <option value={0}>Select start geofence</option>
                {geofences.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            {formData.stopGeofenceIds.map((stopId, index) => (
              <div key={`stop-${index}`}>
                <label className={labelCls}>{`STOP ${index + 1} (GEOFENCE)`}</label>
                <div className="flex gap-2">
                  <select
                    value={stopId}
                    onChange={(e) => updateStop(index, Number(e.target.value))}
                    className={inputCls}
                    disabled={loading}
                  >
                    <option value={0}>Select stop geofence</option>
                    {geofences.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeStop(index)}
                    className={`px-3 rounded-lg border ${
                      isDark
                        ? "border-gray-700 text-gray-300 hover:text-red-300"
                        : "border-gray-200 text-gray-700 hover:text-red-600"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addStop}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border ${
                isDark
                  ? "border-gray-700 text-indigo-400 hover:border-indigo-700"
                  : "border-gray-200 text-indigo-600 hover:border-indigo-300"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Stop
            </button>

            <div>
              <label className={labelCls}>END POINT (GEOFENCE)</label>
              <select
                value={formData.endGeofenceId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endGeofenceId: Number(e.target.value),
                  }))
                }
                className={inputCls}
                disabled={loading}
              >
                <option value={0}>Select end geofence</option>
                {geofences.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            {isEditMode && (
              <div>
                <label className={labelCls}>STATUS</label>
                <select
                  value={formData.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.value === "active",
                    }))
                  }
                  className={inputCls}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </section>

          <section className={`${cardCls} space-y-4`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3
                  className={`text-sm font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                >
                  Route Preview
                </h3>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Select points and click view route to draw map + timing
                </p>
              </div>
              <button
                type="button"
                onClick={calculateRoute}
                disabled={previewLoading || !isLoaded}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {previewLoading ? "Loading..." : "View Route"}
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-[340px]">
              {loadError ? (
                <div className="h-full flex items-center justify-center text-sm text-red-500">
                  Failed to load Google Maps SDK
                </div>
              ) : !isLoaded ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">
                  Loading map...
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={DEFAULT_CENTER}
                  zoom={6}
                  onLoad={(map) => {
                    mapRef.current = map;
                  }}
                  options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {directionsResult && (
                    <DirectionsRenderer
                      directions={directionsResult}
                      options={{
                        suppressMarkers: false,
                        polylineOptions: {
                          strokeColor: "#4f46e5",
                          strokeWeight: 5,
                          strokeOpacity: 0.9,
                        },
                      }}
                    />
                  )}
                </GoogleMap>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className={`px-4 py-3 border-b text-xs font-bold tracking-wider ${
                  isDark
                    ? "bg-gray-900 border-gray-700 text-gray-300"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
              >
                SEGMENT TRAVEL ESTIMATE
              </div>

              {segmentSummaries.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500">
                  No route preview available yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {segmentSummaries.map((segment, index) => (
                    <div
                      key={`segment-${index}`}
                      className="px-4 py-3 flex flex-col gap-1 text-sm"
                    >
                      <div className="font-semibold flex items-center gap-2">
                        <Route className="w-4 h-4 text-indigo-500" />
                        <span>{`Segment ${String.fromCharCode(65 + index)} -> ${String.fromCharCode(66 + index)}`}</span>
                      </div>
                      <p
                        className={`${isDark ? "text-gray-300" : "text-gray-700"} truncate`}
                      >
                        {segment.from} {"->"} {segment.to}
                      </p>
                      <p className="text-xs text-gray-500">
                        Distance: {segment.distanceText} | ETA: {segment.durationText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AddEditRouteMasterPage;
