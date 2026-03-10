"use client";

import { DirectionsRenderer, GoogleMap } from "@react-google-maps/api";
import { Plus, Route, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { useGoogleMapsSdk } from "@/hooks/useGoogleMapsSdk";
import type {
  DropdownOption,
  RouteMasterFormData,
} from "@/interfaces/routeMaster.interface";
import { getAccountHierarchy } from "@/services/accountService";
import {
  getFormRightForPath,
  getGeofenceDropdownByAccount,
} from "@/services/commonServie";
import { getGeofenceById } from "@/services/geofenceService";
import {
  getRouteMasterById,
  saveRouteMaster,
  updateRouteMaster,
} from "@/services/routeMasterService";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

interface SegmentSummary {
  from: string;
  to: string;
  startAddress: string;
  endAddress: string;
  distanceKm: number;
  travelTimeMin: number;
}

interface GeofenceLatLng {
  lat: number;
  lng: number;
}

const toKm = (distanceMetres: number | string): number =>
  Number(distanceMetres || 0) / 1000;

const toMinutes = (durationSeconds: number | string): number =>
  Number(durationSeconds || 0) / 60;

const getEncodedPathFromDirections = (
  response: google.maps.DirectionsResult,
): string => {
  const route = response?.routes?.[0];
  const overviewPolyline = route?.overview_polyline;
  const fromOverview =
    typeof overviewPolyline === "string"
      ? overviewPolyline.trim()
      : String(
          (overviewPolyline as { points?: string } | undefined)?.points || "",
        ).trim();
  if (fromOverview) return fromOverview;

  const canEncode = Boolean(window?.google?.maps?.geometry?.encoding?.encodePath);
  if (!canEncode) return "";

  const overviewPath = Array.isArray(route?.overview_path) ? route.overview_path : [];
  if (overviewPath.length > 1) {
    return window.google.maps.geometry.encoding.encodePath(overviewPath);
  }

  const legs = Array.isArray(route?.legs) ? route.legs : [];
  const stepPath = legs.flatMap((leg) =>
    Array.isArray(leg?.steps)
      ? leg.steps.flatMap((step) => (Array.isArray(step?.path) ? step.path : []))
      : [],
  );
  if (stepPath.length > 1) {
    return window.google.maps.geometry.encoding.encodePath(stepPath);
  }

  return "";
};

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
  const t = useTranslations("pages.routeMaster.detail");
  const params = useParams();
  const routeId = params?.id ? Number(params.id) : 0;
  const isEditMode = routeId > 0;
  const pageRight = getFormRightForPath("/route-master");
  const canRead = pageRight ? Boolean(pageRight.canRead) : true;
  const canSaveAction = pageRight
    ? isEditMode
      ? Boolean(pageRight.canUpdate)
      : Boolean(pageRight.canWrite)
    : true;

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
  const [storedStopDetails, setStoredStopDetails] = useState<
    { fromGeoId: number; toGeoId: number; distance: string; time: string }[]
  >([]);

  // Stores Google Maps derived data to be sent on save/update
  const [routeMetrics, setRouteMetrics] = useState<{
    routePath: string;
    totalDistance: string;
    totalTime: string;
    segmentMetrics: { distanceMetres: number; durationSeconds: number }[];
    waypointKey: string;
  } | null>(null);

  // Holds the encoded polyline fetched in edit mode until Maps SDK is ready
  const [savedEncodedPath, setSavedEncodedPath] = useState<string>("");

  const fetchGeofenceDropdown = async (accountId: number) => {
    const res = await getGeofenceDropdownByAccount(accountId);
    return toOptions(res);
  };

  const fetchAccounts = async () => {
    try {
      const response = await getAccountHierarchy();
      const accountOptions = Array.isArray(response?.data) ? response.data : [];
      setAccounts(
        accountOptions.map((item: any) => ({
          id: Number(item?.id || 0),
          value: String(item?.value || item?.name || item?.id || ""),
        })),
      );
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
        toast.error(t("toast.notFound"));
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
        const geofenceOptions = await fetchGeofenceDropdown(
          nextFormData.accountId,
        );
        setGeofences(geofenceOptions);
      }

      // ── Restore saved route on edit mode ────────────────────────────────
      // Store the encoded polyline; a useEffect below decodes it once the
      // Maps SDK has finished loading (isLoaded becomes true).
      const savedRoutePath = String(data?.routePath || "");
      if (savedRoutePath) {
        setSavedEncodedPath(savedRoutePath);
      }

      // Restore stored metrics so re-saving without re-previewing still
      // sends the correct distance/time values.
      const storedMetrics = Array.isArray(data?.stopDetails)
        ? data.stopDetails.map((seg: any) => ({
            distanceMetres: Number(seg?.distance || 0),
            durationSeconds: Number(seg?.time || 0),
          }))
        : [];
      const normalizedStopDetails = Array.isArray(data?.stopDetails)
        ? data.stopDetails.map((seg: any) => ({
            fromGeoId: Number(seg?.fromGeoId || 0),
            toGeoId: Number(seg?.toGeoId || 0),
            distance: String(seg?.distance || "0"),
            time: String(seg?.time || "0"),
          }))
        : [];

      setRouteMetrics({
        routePath: savedRoutePath,
        totalDistance: String(data?.totalDistance || "0"),
        totalTime: String(data?.totalTime || "0"),
        segmentMetrics: storedMetrics,
        waypointKey: [
          Number(data?.startGeofenceId || 0),
          ...parsedStops.filter((item: number) => item > 0),
          Number(data?.endGeofenceId || 0),
        ]
          .filter((item) => item > 0)
          .join("->"),
      });
      setStoredStopDetails(normalizedStopDetails);
      // ─────────────────────────────────────────────────────────────────────
    } catch (error) {
      console.error("Error fetching route by id:", error);
      toast.error(t("toast.fetchFailed"));
      router.push("/route-master");
    } finally {
      setFetchingData(false);
    }
  }, [routeId, router, t]);

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

  // Decode the saved encoded polyline once the Maps SDK is loaded and
  // display it on the map in edit mode without re-calling the Directions API.
  useEffect(() => {
    if (!isLoaded || !savedEncodedPath || !window?.google?.maps?.geometry)
      return;

    const decodedPath =
      window.google.maps.geometry.encoding.decodePath(savedEncodedPath);

    if (decodedPath.length < 2) return;

    const bounds = decodedPath.reduce(
      (b: google.maps.LatLngBounds, point) => b.extend(point),
      new window.google.maps.LatLngBounds(),
    );

    // Build a minimal synthetic DirectionsResult for DirectionsRenderer
    const syntheticResult = {
      routes: [
        {
          overview_polyline: { points: savedEncodedPath },
          overview_path: decodedPath,
          bounds,
          legs: [],
          waypoint_order: [],
          warnings: [],
          copyrights: "",
          summary: "",
          fare: undefined,
        },
      ],
      geocoded_waypoints: [],
      available_travel_modes: [],
      request: {},
    } as unknown as google.maps.DirectionsResult;

    setDirectionsResult(syntheticResult);
  }, [isLoaded, savedEncodedPath]);

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
        toast.error(t("toast.geofenceDropdownFailed"));
      });
  }, [formData.accountId]);

  useEffect(() => {
    if (!storedStopDetails.length || geofences.length === 0) return;
    const geofenceNameMap = new Map(
      geofences.map((item) => [Number(item.id), item.value]),
    );
    const fromApiSegments = storedStopDetails.map((item) => ({
      from:
        geofenceNameMap.get(item.fromGeoId) ||
        t("fields.geofenceFallback", { id: item.fromGeoId }),
      to:
        geofenceNameMap.get(item.toGeoId) ||
        t("fields.geofenceFallback", { id: item.toGeoId }),
      startAddress: "-",
      endAddress: "-",
      distanceKm: toKm(item.distance),
      travelTimeMin: toMinutes(item.time),
    }));
    setSegmentSummaries(fromApiSegments);
  }, [storedStopDetails, geofences]);

  const hasSelectedAccountInList = useMemo(
    () =>
      Number(formData.accountId) > 0 &&
      accounts.some(
        (account) => Number(account.id) === Number(formData.accountId),
      ),
    [accounts, formData.accountId],
  );

  const addGeofenceHref = useMemo(() => {
    const accountId = Number(formData.accountId || 0);
    const returnTo = `/route-master/${routeId}?refreshGeofence=1`;
    const query = new URLSearchParams({
      returnTo,
    });

    if (accountId > 0) {
      query.set("accountId", String(accountId));
    }

    return `/geofence/0?${query.toString()}`;
  }, [formData.accountId, routeId]);

  const waypointIds = useMemo(() => {
    const stopIds = formData.stopGeofenceIds.filter((id) => id > 0);
    return [
      Number(formData.startGeofenceId || 0),
      ...stopIds,
      Number(formData.endGeofenceId || 0),
    ].filter((id) => id > 0);
  }, [
    formData.startGeofenceId,
    formData.stopGeofenceIds,
    formData.endGeofenceId,
  ]);
  const waypointKey = useMemo(() => waypointIds.join("->"), [waypointIds]);

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

  const buildRoutePreviewData = useCallback(async () => {
    if (!isLoaded || !window.google) {
      toast.error(t("toast.mapsNotLoaded"));
      return null;
    }
    if (!formData.startGeofenceId || !formData.endGeofenceId) {
      toast.error(t("toast.selectStartEndGeofence"));
      return null;
    }
    if (waypointIds.length < 2) {
      toast.error(t("toast.selectAtLeastStartEnd"));
      return null;
    }

    const resolvedPoints = await Promise.all(
      waypointIds.map(async (id) => ({
        id,
        point: await resolveGeofenceLatLng(id),
      })),
    );
    const invalidPoint = resolvedPoints.find((item) => !item.point);
    if (invalidPoint) {
      toast.error(t("toast.resolveGeofenceFailed", { id: invalidPoint.id }));
      return null;
    }

    const getGeofenceName = (id: number): string => {
      const found = geofences.find((g) => Number(g.id) === id);
      return found?.value || t("fields.geofenceFallback", { id });
    };
    const geofenceNames = waypointIds.map((id) => getGeofenceName(id));

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

    const legs = response.routes?.[0]?.legs || [];
    const nextSegmentSummaries = legs.map((leg, index) => ({
      from: geofenceNames[index] || leg.start_address,
      to: geofenceNames[index + 1] || leg.end_address,
      startAddress: leg.start_address || "-",
      endAddress: leg.end_address || "-",
      distanceKm: toKm(leg.distance?.value || 0),
      travelTimeMin: toMinutes(leg.duration?.value || 0),
    }));
    const overviewPolyline = getEncodedPathFromDirections(response);
    if (!overviewPolyline) {
      toast.error(t("toast.encodedPathUnavailable"));
      return null;
    }
    const totalDistanceMetres = legs.reduce(
      (sum, leg) => sum + (leg.distance?.value || 0),
      0,
    );
    const totalDurationSeconds = legs.reduce(
      (sum, leg) => sum + (leg.duration?.value || 0),
      0,
    );

    return {
      response,
      segmentSummaries: nextSegmentSummaries,
      routeMetrics: {
        routePath: overviewPolyline,
        totalDistance: String(totalDistanceMetres),
        totalTime: String(totalDurationSeconds),
        segmentMetrics: legs.map((leg) => ({
          distanceMetres: leg.distance?.value || 0,
          durationSeconds: leg.duration?.value || 0,
        })),
        waypointKey,
      },
    };
  }, [
    formData.endGeofenceId,
    formData.startGeofenceId,
    geofences,
    isLoaded,
    resolveGeofenceLatLng,
    t,
    waypointIds,
    waypointKey,
  ]);

  const calculateRoute = async () => {
    try {
      setPreviewLoading(true);
      const previewData = await buildRoutePreviewData();
      if (!previewData) {
        setDirectionsResult(null);
        setSegmentSummaries([]);
        setStoredStopDetails([]);
        setRouteMetrics(null);
        return;
      }
      setDirectionsResult(previewData.response);
      setSegmentSummaries(previewData.segmentSummaries);
      setStoredStopDetails([]);
      setRouteMetrics(previewData.routeMetrics);
    } catch (error) {
      console.error("Directions error:", error);
      toast.error(t("toast.previewFailed"));
      setDirectionsResult(null);
      setSegmentSummaries([]);
      setStoredStopDetails([]);
      setRouteMetrics(null);
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
      toast.error(t("toast.selectAccount"));
      return false;
    }
    if (!formData.routeName.trim()) {
      toast.error(t("toast.enterRouteName"));
      return false;
    }
    if (!formData.startGeofenceId || !formData.endGeofenceId) {
      toast.error(t("toast.selectStartEndGeofence"));
      return false;
    }
    if (formData.startGeofenceId === formData.endGeofenceId) {
      toast.error(t("toast.startEndMustDiffer"));
      return false;
    }
    const hasInvalidStop = formData.stopGeofenceIds.some((id) => !id);
    if (hasInvalidStop) {
      toast.error(t("toast.selectGeofenceForEachStop"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!canSaveAction) {
      toast.error(
        isEditMode
          ? t("toast.noUpdatePermission")
          : t("toast.noAddPermission"),
      );
      return;
    }

    if (!validateForm()) return;
    const { userId } = getUserData();

    try {
      setLoading(true);
      let latestRouteMetrics = routeMetrics;
      const shouldRecalculateRoute =
        waypointIds.length >= 2 &&
        (!latestRouteMetrics?.routePath ||
          latestRouteMetrics.waypointKey !== waypointKey);

      if (shouldRecalculateRoute) {
        const previewData = await buildRoutePreviewData();
        if (!previewData) {
          setLoading(false);
          return;
        }
        setDirectionsResult(previewData.response);
        setSegmentSummaries(previewData.segmentSummaries);
        setRouteMetrics(previewData.routeMetrics);
        latestRouteMetrics = previewData.routeMetrics;
      }

      if (!String(latestRouteMetrics?.routePath || "").trim()) {
        toast.error(t("toast.routePathMissing"));
        setLoading(false);
        return;
      }

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
        // Always send latest Google Maps derived fields
        routePath: latestRouteMetrics?.routePath || "",
        totalDistance: latestRouteMetrics?.totalDistance || "0",
        totalTime: latestRouteMetrics?.totalTime || "0",
        segmentMetrics: latestRouteMetrics?.segmentMetrics || [],
        ...(isEditMode
          ? { updatedBy: Number(userId || 0) }
          : { createdBy: Number(userId || 0) }),
      };

      const response = isEditMode
        ? await updateRouteMaster(routeId, payload)
        : await saveRouteMaster(payload);

      console.log(response, "ressssssssssssss");

      if (response?.success || response?.statusCode === 200) {
        toast.success(
          response?.message ||
            (isEditMode
              ? t("toast.updated")
              : t("toast.created")),
        );
        router.push("/route-master");
      } else {
        toast.error(response?.message || t("toast.saveFailed"));
      }
    } catch (error) {
      console.error("Save route error:", error);
      toast.error(t("toast.saveError"));
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
          <p className="text-foreground">{t("loadingDetails")}</p>
        </div>
      </div>
    );
  }

  if (!canRead) {
    return (
      <div className={`${isDark ? "dark" : ""}`}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground">
            {t("noReadPermission")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title={isEditMode ? t("editTitle") : t("createTitle")}
          subtitle={t("subtitle")}
          breadcrumbs={[
            { label: t("breadcrumbs.fleet") },
            { label: t("breadcrumbs.master"), href: "/route-master" },
            { label: isEditMode ? t("breadcrumbs.edit") : t("breadcrumbs.create") },
          ]}
          showButton={true}
          buttonText={
            loading
              ? t("buttons.saving")
              : isEditMode
                ? t("buttons.updateRoute")
                : t("buttons.createRoute")
          }
          buttonIcon={loading ? undefined : <Save className="w-4 h-4" />}
          onButtonClick={handleSave}
          showExportButton={false}
          showFilterButton={false}
          showBulkUpload={false}
        />

        <div className="flex flex-col gap-5">
          <section className={`${cardCls} space-y-4`}>
            <div>
              <label className={labelCls}>{t("fields.account")}</label>
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
                <option value={0}>{t("fields.selectAccount")}</option>
                {!hasSelectedAccountInList &&
                  Number(formData.accountId) > 0 && (
                    <option value={formData.accountId}>
                      {t("fields.selectedAccount", { id: formData.accountId })}
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
              <label className={labelCls}>{t("fields.routeName")}</label>
              <input
                type="text"
                value={formData.routeName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    routeName: e.target.value,
                  }))
                }
                className={inputCls}
                placeholder={t("fields.routeNamePlaceholder")}
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelCls}>{t("fields.geofenceRelated")}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isGeofenceRelated: true,
                    }))
                  }
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                    formData.isGeofenceRelated
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                      : isDark
                        ? "border-gray-700 text-gray-300"
                        : "border-gray-200 text-gray-700"
                  }`}
                >
                  {t("fields.yes")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isGeofenceRelated: false,
                    }))
                  }
                  className={`px-3 py-2 rounded-lg border text-sm font-semibold ${
                    !formData.isGeofenceRelated
                      ? "border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30"
                      : isDark
                        ? "border-gray-700 text-gray-300"
                        : "border-gray-200 text-gray-700"
                  }`}
                >
                  {t("fields.no")}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className={`${labelCls} mb-0`}>
                  {t("fields.startPoint")}
                </label>
                <button
                  type="button"
                  onClick={() => router.push(addGeofenceHref)}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    isDark ? "text-indigo-400" : "text-indigo-600"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("fields.addGeofence")}
                </button>
              </div>
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
                <option value={0}>{t("fields.selectStartGeofence")}</option>
                {geofences.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            {formData.stopGeofenceIds.map((stopId, index) => (
              <div key={`stop-${index}`}>
                <label
                  className={labelCls}
                >{t("fields.stopLabel", { number: index + 1 })}</label>
                <div className="flex gap-2">
                  <select
                    value={stopId}
                    onChange={(e) => updateStop(index, Number(e.target.value))}
                    className={inputCls}
                    disabled={loading}
                  >
                    <option value={0}>{t("fields.selectStopGeofence")}</option>
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
              {t("fields.addStop")}
            </button>

            <div>
              <label className={labelCls}>{t("fields.endPoint")}</label>
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
                <option value={0}>{t("fields.selectEndGeofence")}</option>
                {geofences.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.value}
                  </option>
                ))}
              </select>
            </div>

            {isEditMode &&
              formData.endGeofenceId > 0 &&
              formData.startGeofenceId > 0 && (
                <button
                  type="button"
                  onClick={calculateRoute}
                  disabled={previewLoading || !isLoaded}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Route className="w-4 h-4" />
                  {previewLoading ? t("buttons.loadingRoute") : t("buttons.viewRoute")}
                </button>
              )}

            <div>
              <label className={labelCls}>{t("fields.status")}</label>
              <label
                className={`inline-flex items-center gap-2 text-sm font-semibold ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={Boolean(formData.isActive)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={loading}
                />
                <span>{formData.isActive ? t("fields.active") : t("fields.inactive")}</span>
              </label>
            </div>

            {/* {formData.endGeofenceId > 0 && formData.startGeofenceId > 0 && (
              <button
                type="button"
                onClick={calculateRoute}
                disabled={previewLoading || !isLoaded}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Route className="w-4 h-4" />
                {previewLoading ? "Loading Route..." : "View Route"}
              </button>
            )} */}

            {(directionsResult || previewLoading) && (
              <>
                <div>
                  <h3
                    className={`text-sm font-bold mb-3 ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    {t("section.routePreview")}
                  </h3>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-[420px]">
                    {loadError ? (
                      <div className="h-full flex items-center justify-center text-sm text-red-500">
                        {t("section.mapsLoadFailed")}
                      </div>
                    ) : !isLoaded ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-500">
                        {t("section.loadingMap")}
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
                </div>
                {segmentSummaries.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead
                          className={
                            isDark
                              ? "bg-gray-900 text-gray-200"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">
                              {t("table.startGeofence")}
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                              {t("table.endGeofence")}
                            </th>
                            {/* <th className="px-4 py-3 text-left font-semibold">
                          Start Address
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          End Address
                        </th> */}
                            <th className="px-4 py-3 text-right font-semibold">
                              {t("table.distance")}
                            </th>
                            <th className="px-4 py-3 text-right font-semibold">
                              {t("table.time")}
                            </th>
                          </tr>
                        </thead>
                        <tbody
                          className={
                            isDark
                              ? "divide-y divide-gray-700 text-gray-200"
                              : "divide-y divide-gray-200 text-gray-700"
                          }
                        >
                          {segmentSummaries.map((segment, index) => (
                            <tr key={`segment-table-${index}`}>
                              <td className="px-4 py-3">{segment.from}</td>
                              <td className="px-4 py-3">{segment.to}</td>
                              {/* <td className="px-4 py-3">{segment.startAddress}</td>
                          <td className="px-4 py-3">{segment.endAddress}</td> */}
                              <td className="px-4 py-3 text-right">
                                {segment.distanceKm.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {segment.travelTimeMin.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div
                      className={`grid grid-cols-1 sm:grid-cols-2 border-t ${
                        isDark
                          ? "border-gray-700 bg-gray-900/40 text-gray-200"
                          : "border-gray-200 bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="px-4 py-3 font-semibold">
                        {t("table.totalDistance")}{" "}
                        <span className="font-medium">
                          {toKm(routeMetrics?.totalDistance || 0).toFixed(2)} Km
                        </span>
                      </div>
                      <div className="px-4 py-3 font-semibold sm:border-l border-gray-200 dark:border-gray-700">
                        {t("table.totalTime")}{" "}
                        <span className="font-medium">
                          {toMinutes(routeMetrics?.totalTime || 0).toFixed(2)}{" "}
                          Min
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AddEditRouteMasterPage;
