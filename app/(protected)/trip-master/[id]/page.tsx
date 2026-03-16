"use client";

import { ChevronLeft, ChevronRight, Plus, Save, Trash2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import type {
  Trip,
  TripCycle,
  TripNotifications,
  TripStop,
} from "@/interfaces/trip.interface";
import {
  getAllAccounts,
  getGeofenceDropdownByAccount,
  getVehicleDropdown,
} from "@/services/commonServie";
import { getDrivers } from "@/services/driverService";
import { getRouteMasterById } from "@/services/routeMasterService";
import {
  createTripPlan,
  getTripPlanById,
  getRouteDropdown,
  updateTripPlan,
} from "@/services/tripMasterService";
import { getVehicleType } from "@/services/vehicleService";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type RouteMode =
  | "master-route"
  | "weekly"
  | "custom-route"
  | "one-off-scheduled";
type GeofenceOption = { id: number; value: string };
type AccountOption = { id: number; value: string };
type DriverOption = { id: number; value: string };
type VehicleOption = { id: number; value: string };
type VehicleTypeOption = {
  id: number;
  vehicleTypeName: string;
  status?: string | boolean;
};
type RouteOption = { id: number; value: string };

const SCHEDULING_OPTIONS = [
  {
    id: "master-route",
    labelKey: "scheduling.masterRoute",
    subKey: "scheduling.fixedPath",
  },
  {
    id: "weekly",
    labelKey: "scheduling.weekly",
    subKey: "scheduling.repeatingCycle",
  },
  {
    id: "custom-route",
    labelKey: "scheduling.customRoute",
    subKey: "scheduling.onDemand",
  },
  {
    id: "one-off-scheduled",
    labelKey: "scheduling.oneOff",
    subKey: "scheduling.scheduled",
  },
] as const;

const makeStop = (): TripStop => ({
  id: Date.now().toString() + Math.random(),
  location: "",
  plannedEntry: "",
  plannedExit: "",
});

const getLocalAccountId = (): number => {
  if (typeof window === "undefined") return 0;
  const selectedAccountId = Number(localStorage.getItem("accountId") || 0);
  if (selectedAccountId > 0) return selectedAccountId;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return Number(user?.accountId || user?.AccountId || 0);
  } catch {
    return 0;
  }
};

const getLocalUserId = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return String(user?.userId || user?.UserId || "");
  } catch {
    return "";
  }
};

const toTripType = (mode: RouteMode): string =>
  mode === "weekly" ? "weekly" : "fixed";

const toTravelDate = (dateTimeLocal: string, tripType: string): string | null => {
  if (!dateTimeLocal || tripType === "weekly") return null;
  const [datePart] = String(dateTimeLocal).split("T");
  if (!datePart) return null;
  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return null;
  return `${day}/${month}/${year}`;
};

const toEtd = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return "";
  const [, timePart] = String(dateTimeLocal).split("T");
  return timePart ? timePart.slice(0, 5) : "";
};

const toDateTimeLocal = (
  travelDate: string | null | undefined,
  etd: string | null | undefined,
  createdDatetime: string | null | undefined,
): string => {
  const resolvedEtd = String(etd || "").slice(0, 5);
  if (!resolvedEtd) return "";

  const ddmmyyyy = String(travelDate || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${resolvedEtd}`;
  }

  const isoDate = String(travelDate || createdDatetime || "").slice(0, 10);
  const isoMatch = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!isoMatch) return "";
  return `${isoDate}T${resolvedEtd}`;
};

export default function CreateTripPage() {
  const VEHICLE_TYPE_PAGE_SIZE = 3;
  const VEHICLE_PAGE_THROTTLE_MS = 350;
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("pages.tripMaster.detail");
  const id = String(params?.id || "0");
  const isEditMode = id !== "0";

  const [tripName, setTripName] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    String(getLocalAccountId() || ""),
  );
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [driverOptions, setDriverOptions] = useState<DriverOption[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<
    VehicleTypeOption[]
  >([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] =
    useState<string>("");
  const [vehicleTypePage, setVehicleTypePage] = useState(1);
  const [consigneeName, setConsigneeName] = useState("");

  const [cycle, setCycle] = useState<TripCycle>("weekly");
  const [weeklyRotation, setWeeklyRotation] = useState<
    Record<(typeof WEEK_DAYS)[number], boolean>
  >({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: true,
    Sun: true,
  });

  const [routeMode, setRouteMode] = useState<RouteMode>("master-route");
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [customRouteName, setCustomRouteName] = useState("");

  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [stops, setStops] = useState<TripStop[]>([makeStop(), makeStop()]);

  const [notif, setNotif] = useState<TripNotifications>({
    whatsappDriver: true,
    whatsappConsignee: true,
    otpDriver: false,
    otpConsignee: false,
    smsAlerts: false,
    trackingLink: true,
  });
  const [otpNumbers, setOtpNumbers] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [loadingTripPlan, setLoadingTripPlan] = useState(false);
  const [geofenceOptions, setGeofenceOptions] = useState<GeofenceOption[]>([]);
  const lastVehicleTypeNavRef = useRef(0);

  const inputCls = `w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
    isDark
      ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
  }`;
  const labelCls = `block text-[10px] font-bold tracking-widest mb-1.5 ${isDark ? "text-gray-400" : "text-gray-500"}`;
  const cardCls = `rounded-xl border p-5 ${isDark ? "border-gray-800 bg-gray-800/30" : "border-gray-200 bg-white"}`;
  const sectionTitleCls = `text-[10px] font-bold tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`;

  const updateStop = (idx: number, field: keyof TripStop, val: string) => {
    setStops((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)),
    );
  };

  const addStop = () => {
    setStops((prev) => [
      ...prev.slice(0, -1),
      makeStop(),
      prev[prev.length - 1],
    ]);
  };

  const removeStop = (idx: number) => {
    if (stops.length <= 2) return;
    setStops((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleWeekDay = (day: (typeof WEEK_DAYS)[number]) => {
    setWeeklyRotation((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const addOtpNumber = () => {
    setOtpNumbers((prev) => [...prev, ""]);
  };

  const updateOtpNumber = (idx: number, value: string) => {
    setOtpNumbers((prev) => prev.map((num, i) => (i === idx ? value : num)));
  };

  const removeOtpNumber = (idx: number) => {
    setOtpNumbers((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
    );
  };

  const routeLabel = useMemo(() => {
    const selectedRouteName =
      routeOptions.find((route) => String(route.id) === String(selectedRouteId))
        ?.value || "";
    if (selectedRouteName) return selectedRouteName;
    if (routeMode === "weekly") return t("labels.weeklyCycle");
    if (routeMode === "custom-route")
      return customRouteName || t("labels.customRoute");
    return t("labels.oneOffScheduled");
  }, [customRouteName, routeMode, routeOptions, selectedRouteId, t]);

  const mapQuery = useMemo(() => {
    const resolveGeoName = (geoId: string) =>
      geofenceOptions.find((geo) => String(geo.id) === String(geoId))?.value ||
      "";

    const source = resolveGeoName(stops[0]?.location || "");
    const destination = resolveGeoName(stops[stops.length - 1]?.location || "");
    if (source && destination) return `${source} to ${destination}`;
    if (source) return source;
    return t("labels.defaultMapQuery");
  }, [geofenceOptions, stops, t]);

  const showWeeklyRotation = routeMode === "weekly";
  const showCustomRoute = routeMode === "custom-route";
  const selectedAccountLabel =
    accountOptions.find((item) => String(item.id) === selectedAccountId)
      ?.value || "-";
  const selectedDriverLabel =
    driverOptions.find((item) => String(item.id) === String(selectedDriverId))
      ?.value || "-";
  const selectedVehicle =
    vehicleOptions.find(
      (item) => String(item.id) === String(selectedVehicleId),
    ) || null;
  const selectedVehicleType =
    vehicleTypeOptions.find(
      (item) => String(item.id) === String(selectedVehicleTypeId),
    ) || null;
  const totalVehicleTypePages = Math.max(
    1,
    Math.ceil(vehicleTypeOptions.length / VEHICLE_TYPE_PAGE_SIZE),
  );
  const pagedVehicleTypes = vehicleTypeOptions.slice(
    (vehicleTypePage - 1) * VEHICLE_TYPE_PAGE_SIZE,
    vehicleTypePage * VEHICLE_TYPE_PAGE_SIZE,
  );

  const isValid =
    tripName.trim() &&
    selectedDriverId &&
    selectedAccountId &&
    selectedVehicleId &&
    selectedVehicleTypeId &&
    consigneeName.trim() &&
    stops[0]?.location &&
    stops[stops.length - 1]?.location;

  const handleDeploy = async () => {
    if (loadingTripPlan) return;
    if (!isValid) return;
    if (!toEtd(departure)) {
      toast.error("Please select departure ETD");
      return;
    }
    try {
      setSaving(true);
      const tripType = toTripType(routeMode);
      const weekDays = WEEK_DAYS.filter((day) => weeklyRotation[day]).join(",");
      const normalizedStops = stops
        .map((stop) => Number(stop.location || 0))
        .filter((geoId) => geoId > 0);

      const payload = {
        planId: isEditMode ? Number(id || 0) : 0,
        accountId: Number(selectedAccountId || 0),
        driverId: Number(selectedDriverId || 0),
        vehicleId: Number(selectedVehicleId || 0),
        tripType,
        travelDate: toTravelDate(departure, tripType),
        etd: toEtd(departure),
        routeId: Number(selectedRouteId || 0),
        startGeoId: Number(normalizedStops[0] || 0),
        endGeoId: Number(normalizedStops[normalizedStops.length - 1] || 0),
        createdBy: getLocalUserId(),
        weekDays: tripType === "weekly" ? weekDays : "",
        routeDetails: normalizedStops.slice(0, -1).map((fromGeoId, index) => ({
          fromGeoId: Number(fromGeoId || 0),
          toGeoId: Number(normalizedStops[index + 1] || 0),
          sequence: index + 1,
          distance: "0",
          leadTime: 0,
          rta: 0,
        })),
      };

      const response = isEditMode
        ? await updateTripPlan(Number(id || 0), payload)
        : await createTripPlan(payload);

      if (response?.success || Number(response?.statusCode || 0) === 200) {
        toast.success(response?.message || "Trip plan saved successfully");
        router.push("/trip-master");
        return;
      }

      toast.error(response?.message || "Failed to save trip plan");
    } catch (error) {
      console.error("Trip plan save error:", error);
      toast.error("Failed to save trip plan");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadTripPlanById = async () => {
      if (!isEditMode) return;
      const planId = Number(id || 0);
      if (planId <= 0) return;

      try {
        setLoadingTripPlan(true);
        const response = await getTripPlanById(planId);
        if (!(response?.success || Number(response?.statusCode || 0) === 200)) {
          toast.error(response?.message || "Failed to fetch trip plan");
          return;
        }

        const data = response?.data || {};
        setSelectedAccountId(String(data?.accountId || ""));
        setSelectedDriverId(String(data?.driverId || ""));
        setSelectedVehicleId(String(data?.vehicleId || ""));
        setSelectedRouteId(String(data?.routeId || ""));
        setTripName(`Trip Plan #${Number(data?.planId || planId)}`);
        setConsigneeName(String(data?.endGeoName || ""));

        const isWeekly = String(data?.tripType || "").toLowerCase() === "weekly";
        setCycle(isWeekly ? "weekly" : "one-off");
        setRouteMode(isWeekly ? "weekly" : "master-route");

        const weeklyValues = String(data?.weekDays || "")
          .split(",")
          .map((day: string) => day.trim())
          .filter(Boolean);
        if (weeklyValues.length > 0) {
          setWeeklyRotation({
            Mon: weeklyValues.includes("Mon"),
            Tue: weeklyValues.includes("Tue"),
            Wed: weeklyValues.includes("Wed"),
            Thu: weeklyValues.includes("Thu"),
            Fri: weeklyValues.includes("Fri"),
            Sat: weeklyValues.includes("Sat"),
            Sun: weeklyValues.includes("Sun"),
          });
        }

        const etdDateTime = toDateTimeLocal(
          data?.travelDate || null,
          data?.etd || "",
          data?.createdDatetime || null,
        );
        setDeparture(etdDateTime);
        setArrival("");

        const routeDetails = Array.isArray(data?.routeDetails)
          ? [...data.routeDetails].sort(
              (a, b) => Number(a?.sequence || 0) - Number(b?.sequence || 0),
            )
          : [];
        const geoIdsFromRouteDetails = routeDetails.reduce(
          (acc: number[], item: { fromGeoId?: number; toGeoId?: number }) => {
            const fromGeoId = Number(item?.fromGeoId || 0);
            const toGeoId = Number(item?.toGeoId || 0);
            if (fromGeoId > 0 && acc.length === 0) acc.push(fromGeoId);
            if (toGeoId > 0) acc.push(toGeoId);
            return acc;
          },
          [],
        );

        const fallbackGeoIds = [
          Number(data?.startGeoId || 0),
          Number(data?.endGeoId || 0),
        ].filter((geoId) => geoId > 0);

        const geoIds: number[] = (geoIdsFromRouteDetails.length > 0
          ? geoIdsFromRouteDetails
          : fallbackGeoIds
        ).filter(
          (geoId: number, idx: number, arr: number[]) =>
            geoId > 0 && (idx === 0 || geoId !== arr[idx - 1]),
        );

        if (geoIds.length >= 2) {
          setStops(
            geoIds.map((geoId) => ({
              ...makeStop(),
              location: String(geoId),
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load trip plan by id:", error);
        toast.error("Failed to fetch trip plan");
      } finally {
        setLoadingTripPlan(false);
      }
    };

    loadTripPlanById();
  }, [id, isEditMode]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await getAllAccounts();
        const data = Array.isArray(response?.data) ? response.data : [];
        const options = data.map((item: { id?: number; value?: string }) => ({
          id: Number(item?.id || 0),
          value: String(item?.value || ""),
        }));
        setAccountOptions(options);

        if (!selectedAccountId && options[0]?.id) {
          setSelectedAccountId(String(options[0].id));
        }
      } catch (error) {
        console.error("Failed to load accounts:", error);
      }
    };
    loadAccounts();
  }, []);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const accountId = Number(selectedAccountId || getLocalAccountId() || 0);
        if (accountId <= 0) {
          setDriverOptions([]);
          setSelectedDriverId("");
          return;
        }
        const response = await getDrivers(1, 200, "", accountId);
        const items = Array.isArray(response?.data?.drivers?.items)
          ? response.data.drivers.items
          : [];
        const options = items.map(
          (item: { driverId?: number; name?: string; mobile?: string }) => ({
            id: Number(item?.driverId || 0),
            value: String(item?.name || item?.mobile || ""),
          }),
        );
        setDriverOptions(options);
        setSelectedDriverId((prev) =>
          options.some((opt: DriverOption) => String(opt.id) === String(prev))
            ? prev
            : String(options[0]?.id || ""),
        );
      } catch (error) {
        console.error("Failed to load drivers:", error);
        setDriverOptions([]);
        setSelectedDriverId("");
      }
    };

    loadDrivers();
  }, [selectedAccountId]);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const accountId = Number(selectedAccountId || getLocalAccountId() || 0);
        if (accountId <= 0) {
          setVehicleOptions([]);
          setSelectedVehicleId("");
          return;
        }
        const response = await getVehicleDropdown(accountId);
        const data = Array.isArray(response?.data) ? response.data : [];
        const options = data.map((item: { id?: number; value?: string }) => ({
          id: Number(item?.id || 0),
          value: String(item?.value || ""),
        }));
        setVehicleOptions(options);
        setSelectedVehicleId((prev) =>
          options.some((opt: VehicleOption) => String(opt.id) === String(prev))
            ? prev
            : String(options[0]?.id || ""),
        );
      } catch (error) {
        console.error("Failed to load vehicle dropdown:", error);
        setVehicleOptions([]);
        setSelectedVehicleId("");
      }
    };
    loadVehicles();
  }, [selectedAccountId]);

  useEffect(() => {
    const loadVehicleTypes = async () => {
      try {
        const response = await getVehicleType();
        const data = Array.isArray(response) ? response : [];
        const activeItems = data.filter(
          (item: { status?: string | boolean }) =>
            String(item?.status).toLowerCase() === "true",
        );
        const options = activeItems.map(
          (item: {
            id?: number;
            vehicleTypeName?: string;
            status?: string | boolean;
          }) => ({
            id: Number(item?.id || 0),
            vehicleTypeName: String(item?.vehicleTypeName || ""),
            status: item?.status,
          }),
        );
        setVehicleTypeOptions(options);
        setSelectedVehicleTypeId((prev) =>
          options.some((opt: VehicleTypeOption) => String(opt.id) === String(prev))
            ? prev
            : String(options[0]?.id || ""),
        );
        setVehicleTypePage(1);
      } catch (error) {
        console.error("Failed to load vehicle types:", error);
        setVehicleTypeOptions([]);
        setSelectedVehicleTypeId("");
        setVehicleTypePage(1);
      }
    };

    loadVehicleTypes();
  }, []);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const accountId = Number(selectedAccountId || getLocalAccountId() || 0);
        if (accountId <= 0) {
          setRouteOptions([]);
          setSelectedRouteId("");
          return;
        }

        const response = await getRouteDropdown(accountId);
        const items = Array.isArray(response?.data) ? response.data : [];
        const options = items.map((item: { id?: number; value?: string }) => ({
          id: Number(item?.id || 0),
          value: String(item?.value || ""),
        }));
        setRouteOptions(options);
        setSelectedRouteId((prev) =>
          options.some((opt: RouteOption) => String(opt.id) === String(prev))
            ? prev
            : String(options[0]?.id || ""),
        );
      } catch (error) {
        console.error("Failed to load route dropdown:", error);
        setRouteOptions([]);
      }
    };

    loadRoutes();
  }, [selectedAccountId]);

  const changeVehicleTypePage = (nextPage: number) => {
    const now = Date.now();
    if (now - lastVehicleTypeNavRef.current < VEHICLE_PAGE_THROTTLE_MS) return;
    lastVehicleTypeNavRef.current = now;
    setVehicleTypePage(nextPage);
  };

  useEffect(() => {
    const loadRouteDetails = async () => {
      const routeId = Number(selectedRouteId || 0);
      if (routeId <= 0) return;

      try {
        const response = await getRouteMasterById(routeId);
        const data = response?.data || {};
        const startGeoId = Number(
          data?.startGeoId || data?.startGeofenceId || 0,
        );
        const endGeoId = Number(data?.endGeoId || data?.endGeofenceId || 0);
        if (!startGeoId || !endGeoId) return;
        const stopDetails = Array.isArray(data?.stopDetails)
          ? data.stopDetails
          : [];
        const middleGeoIds = stopDetails
          .map((item: { toGeoId?: number }) => Number(item?.toGeoId || 0))
          .filter((geoId: number) => geoId > 0 && geoId !== endGeoId);

        const routeStops = [
          String(startGeoId),
          ...middleGeoIds.map((id: number) => String(id)),
          String(endGeoId),
        ];

        setStops(
          routeStops.map((geoId) => ({
            ...makeStop(),
            location: geoId,
          })),
        );
      } catch (error) {
        console.error("Failed to load route details:", error);
      }
    };

    loadRouteDetails();
  }, [selectedRouteId]);

  useEffect(() => {
    const loadGeofences = async () => {
      try {
        const accountId = Number(selectedAccountId || getLocalAccountId() || 0);
        const response = await getGeofenceDropdownByAccount(accountId);
        const data = Array.isArray(response?.data) ? response.data : [];
        setGeofenceOptions(
          data.map((item: { id?: number; value?: string }) => ({
            id: Number(item?.id || 0),
            value: String(item?.value || ""),
          })),
        );
      } catch (error) {
        console.error("Failed to load geofences:", error);
      }
    };

    loadGeofences();
  }, [selectedAccountId]);

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : "bg-gray-50"} p-6`}>
        <div className="max-w-7xl mx-auto mb-6">
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            breadcrumbs={[
              { label: t("breadcrumbs.fleet") },
              { label: t("breadcrumbs.master"), href: "/trip-master" },
              { label: isEditMode ? t("breadcrumbs.edit") : t("breadcrumbs.create") },
            ]}
            showButton={true}
            buttonText={saving ? t("buttons.deploying") : t("buttons.deployMission")}
            buttonIcon={saving ? undefined : <Save className="w-4 h-4" />}
            onButtonClick={handleDeploy}
            showExportButton={false}
            showFilterButton={false}
            showBulkUpload={false}
          />
        </div>

        <main className="max-w-7xl mx-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className={cardCls}>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${isDark ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}
                >
                  01
                </span>
                <h3 className={sectionTitleCls}>
                  {t("sections.missionIdentity")}
                </h3>
                <div
                  className={`flex-1 h-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{t("fields.tripName")}</label>
                  <input
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className={inputCls}
                    placeholder={t("fields.tripNamePlaceholder")}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {t("fields.assignedOperator")}
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">{t("fields.selectDriver")}</option>
                    {driverOptions.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t("fields.account")}</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => {
                      setSelectedAccountId(e.target.value);
                      setSelectedDriverId("");
                      setSelectedVehicleId("");
                      setSelectedRouteId("");
                      setStops((prev) =>
                        prev.map((stop, idx) =>
                          idx === 0 || idx === prev.length - 1
                            ? { ...stop, location: "" }
                            : stop,
                        ),
                      );
                    }}
                    className={inputCls}
                  >
                    <option value="">{t("fields.selectAccount")}</option>
                    {accountOptions.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t("fields.consignee")}</label>
                  <input
                    value={consigneeName}
                    onChange={(e) => setConsigneeName(e.target.value)}
                    className={inputCls}
                    placeholder={t("fields.consigneePlaceholder")}
                  />
                </div>
              </div>
            </section>

            <section className={cardCls}>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${isDark ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}
                >
                  02
                </span>
                <h3 className={sectionTitleCls}>
                  {t("sections.fleetStrategy")}
                </h3>
                <div
                  className={`flex-1 h-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                />
              </div>

              <label className={labelCls}>
                {t("fields.vehicleAssignment")}
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className={`${inputCls} mb-3`}
              >
                <option value="">{t("fields.selectVehicle")}</option>
                {vehicleOptions.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.value}
                  </option>
                ))}
              </select>

              <label className={labelCls}>{t("fields.vehicleType")}</label>
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs text-gray-400">
                  {t("fields.vehicleTypePageInfo", {
                    page: vehicleTypePage,
                    total: totalVehicleTypePages,
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={vehicleTypePage <= 1}
                    onClick={() =>
                      changeVehicleTypePage(Math.max(1, vehicleTypePage - 1))
                    }
                    className={`p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label={t("buttons.prev")}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={vehicleTypePage >= totalVehicleTypePages}
                    onClick={() =>
                      changeVehicleTypePage(
                        Math.min(totalVehicleTypePages, vehicleTypePage + 1),
                      )
                    }
                    className={`p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed ${
                      isDark
                        ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label={t("buttons.next")}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pagedVehicleTypes.length ? (
                  pagedVehicleTypes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedVehicleTypeId(String(item.id))}
                      className={`text-left rounded-xl border px-3 py-3 transition-colors ${
                        String(item.id) === String(selectedVehicleTypeId)
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : isDark
                            ? "border-gray-700 hover:border-gray-600"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold ${
                          String(item.id) === String(selectedVehicleTypeId)
                            ? "text-indigo-600 dark:text-indigo-300"
                            : isDark
                              ? "text-foreground"
                              : "text-gray-800"
                        }`}
                      >
                        {item.vehicleTypeName}
                      </p>
                    </button>
                  ))
                ) : (
                  <div
                    className={`col-span-full rounded-xl border px-3 py-4 text-xs ${
                      isDark
                        ? "border-gray-700 text-gray-400"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {t("fields.noVehicleTypes")}
                  </div>
                )}
              </div>
            </section>

            <section className={cardCls}>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${isDark ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}
                >
                  03
                </span>
                <h3 className={sectionTitleCls}>
                  {t("sections.tripCycleTimeline")}
                </h3>
                <div
                  className={`flex-1 h-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                />
              </div>

              <label className={labelCls}>{t("fields.tripType")}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {SCHEDULING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setRouteMode(opt.id);
                      setCycle(
                        opt.id === "one-off-scheduled" ? "one-off" : "weekly",
                      );
                    }}
                    className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                      routeMode === opt.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : isDark
                          ? "border-gray-700 hover:border-gray-600"
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold ${routeMode === opt.id ? "text-indigo-600 dark:text-indigo-300" : isDark ? "text-foreground" : "text-gray-800"}`}
                    >
                      {t(opt.labelKey)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {t(opt.subKey)}
                    </p>
                  </button>
                ))}
              </div>

              {showWeeklyRotation && (
                <>
                  <label className={labelCls}>
                    {t("fields.weeklyRotation")}
                  </label>
                  <div className="grid grid-cols-7 gap-2 mb-5">
                    {WEEK_DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekDay(day)}
                        className={`rounded-lg px-2 py-2 text-xs font-bold border transition-colors ${
                          weeklyRotation[day]
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                            : isDark
                              ? "border-gray-700 text-gray-400"
                              : "border-gray-200 text-gray-500"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>{t("fields.departureEtd")}</label>
                  <input
                    type="datetime-local"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {t("fields.expectedArrival")}
                  </label>
                  <input
                    type="datetime-local"
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    {t("fields.selectMasterPipeline")}
                  </label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">{t("fields.selectMasterPipeline")}</option>
                    {routeOptions.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.value}
                      </option>
                    ))}
                  </select>
                </div>
                {showCustomRoute && (
                  <div>
                    <label className={labelCls}>
                      {t("fields.customRouteName")}
                    </label>
                    <input
                      value={customRouteName}
                      onChange={(e) => setCustomRouteName(e.target.value)}
                      className={inputCls}
                      placeholder={t("fields.customRoutePlaceholder")}
                    />
                  </div>
                )}
              </div>
            </section>

            <section className={cardCls}>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${isDark ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}
                >
                  04
                </span>
                <h3 className={sectionTitleCls}>
                  {t("sections.timelineRoute")}
                </h3>
                <div
                  className={`flex-1 h-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                />
              </div>

              <div className="space-y-4">
                {stops.map((stop, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === stops.length - 1;
                  return (
                    <div
                      key={stop.id}
                      className={`rounded-xl border p-4 ${isDark ? "border-gray-700 bg-gray-800/40" : "border-gray-200 bg-gray-50"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold tracking-wider text-indigo-500">
                          {isFirst
                            ? t("labels.sourceLocation")
                            : isLast
                              ? t("labels.destinationLocation")
                              : t("labels.stop", { number: idx })}
                        </p>
                        {!isFirst && !isLast && (
                          <button
                            type="button"
                            onClick={() => removeStop(idx)}
                            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> {t("buttons.remove")}
                          </button>
                        )}
                      </div>

                      <select
                        value={stop.location}
                        onChange={(e) =>
                          updateStop(idx, "location", e.target.value)
                        }
                        className={`${inputCls} mb-3`}
                      >
                        <option value="">
                          {isFirst
                            ? t("fields.selectSourceGeofence")
                            : isLast
                              ? t("fields.selectDestinationGeofence")
                              : t("fields.selectStopGeofence")}
                        </option>
                        {geofenceOptions.map((geo) => (
                          <option key={geo.id} value={String(geo.id)}>
                            {geo.value}
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="datetime-local"
                          value={stop.plannedEntry}
                          onChange={(e) =>
                            updateStop(idx, "plannedEntry", e.target.value)
                          }
                          className={inputCls}
                        />
                        <input
                          type="datetime-local"
                          value={stop.plannedExit}
                          onChange={(e) =>
                            updateStop(idx, "plannedExit", e.target.value)
                          }
                          className={inputCls}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addStop}
                className={`mt-4 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border ${
                  isDark
                    ? "border-gray-700 text-indigo-400 hover:border-indigo-700"
                    : "border-gray-200 text-indigo-600 hover:border-indigo-300"
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> {t("buttons.addStop")}
              </button>
            </section>

            <section className={cardCls}>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${isDark ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}
                >
                  05
                </span>
                <h3 className={sectionTitleCls}>
                  {t("sections.notifications")}
                </h3>
                <div
                  className={`flex-1 h-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                />
              </div>

              <div
                className={`rounded-xl border p-4 ${isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-200 bg-gray-50"}`}
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notif.otpDriver}
                    onChange={(e) =>
                      setNotif((prev) => ({
                        ...prev,
                        otpDriver: e.target.checked,
                        otpConsignee: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <div>
                    <p
                      className={`text-sm font-semibold ${isDark ? "text-foreground" : "text-gray-900"}`}
                    >
                      {t("notifications.enableOtp")}
                    </p>
                    <p
                      className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
                    >
                      {t("notifications.otpHelp")}
                    </p>
                  </div>
                </label>

                {notif.otpDriver && (
                  <div className="mt-4 space-y-3">
                    {otpNumbers.map((number, idx) => (
                      <div
                        key={`otp-number-${idx}`}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="tel"
                          value={number}
                          onChange={(e) => updateOtpNumber(idx, e.target.value)}
                          className={inputCls}
                          placeholder={t("notifications.mobilePlaceholder")}
                        />
                        {otpNumbers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOtpNumber(idx)}
                            className={`p-2 rounded-lg border ${isDark ? "border-gray-700 text-gray-400 hover:text-red-400" : "border-gray-200 text-gray-500 hover:text-red-500"}`}
                            aria-label={t("notifications.removeNumberAria")}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addOtpNumber}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border ${
                        isDark
                          ? "border-gray-700 text-indigo-400 hover:border-indigo-700"
                          : "border-gray-200 text-indigo-600 hover:border-indigo-300"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t("buttons.addNumber")}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-[86px] space-y-4">
              <div
                className={`rounded-xl border p-3 ${isDark ? "border-gray-800 bg-gray-800/30" : "border-gray-200 bg-white"}`}
              >
                <p
                  className={`text-[10px] font-bold tracking-widest mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t("sections.liveMapPreview")}
                </p>
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <iframe
                    title="Trip route map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=10&output=embed`}
                    className="w-full h-[280px]"
                    loading="lazy"
                  />
                </div>
              </div>

              <div
                className={`rounded-xl border p-4 ${isDark ? "border-gray-800 bg-gray-800/30" : "border-gray-200 bg-white"}`}
              >
                <p
                  className={`text-[10px] font-bold tracking-widest mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {t("sections.missionSummary")}
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">{t("summary.trip")}</span>
                    <span className="font-semibold text-right">
                      {tripName || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">{t("summary.driver")}</span>
                    <span className="font-semibold text-right">
                      {selectedDriverLabel}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">
                      {t("summary.account")}
                    </span>
                    <span className="font-semibold text-right">
                      {selectedAccountLabel}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">
                      {t("summary.assignment")}
                    </span>
                    <span className="font-semibold text-right">
                      {selectedVehicle?.value || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">
                      {t("summary.vehicleType")}
                    </span>
                    <span className="font-semibold text-right">
                      {selectedVehicleType?.vehicleTypeName || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">{t("summary.cycle")}</span>
                    <span className="font-semibold uppercase text-right">
                      {cycle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">
                      {t("summary.routeMode")}
                    </span>
                    <span className="font-semibold text-right">
                      {routeMode}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">{t("summary.route")}</span>
                    <span className="font-semibold text-right">
                      {routeLabel}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDeploy}
                  disabled={!isValid || saving}
                  className="w-full mt-4 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving
                    ? t("buttons.deploying")
                    : t("buttons.deployMasterMission")}
                </button>
              </div>
            </div>
          </aside>
        </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/trip-master")}
              className={`px-6 py-2.5 rounded-lg border ${
                isDark
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t("buttons.cancel")}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
