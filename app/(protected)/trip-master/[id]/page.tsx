"use client";

import { ArrowLeft, Plus, Save, Trash2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import type {
  Trip,
  TripCycle,
  TripNotifications,
  TripStop,
} from "@/interfaces/trip.interface";
import { DRIVERS, VEHICLE_ICON, VEHICLES } from "@/interfaces/trip.interface";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type RouteMode =
  | "master-route"
  | "weekly"
  | "custom-route"
  | "one-off-scheduled";
type VehicleClass = "truck" | "traveller" | "bus";

const MASTER_ROUTES = [
  "Mountain Supply Line",
  "Delhi - Jaipur Corridor",
  "NCR Milk Distribution",
  "Industrial Night Shuttle",
];

const SCHEDULING_OPTIONS = [
  { id: "master-route", labelKey: "scheduling.masterRoute", subKey: "scheduling.fixedPath" },
  { id: "weekly", labelKey: "scheduling.weekly", subKey: "scheduling.repeatingCycle" },
  { id: "custom-route", labelKey: "scheduling.customRoute", subKey: "scheduling.onDemand" },
  { id: "one-off-scheduled", labelKey: "scheduling.oneOff", subKey: "scheduling.scheduled" },
] as const;

const makeStop = (): TripStop => ({
  id: Date.now().toString() + Math.random(),
  location: "",
  plannedEntry: "",
  plannedExit: "",
});

export default function CreateTripPage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("pages.tripMaster.detail");
  const id = String(params?.id || "0");
  const isEditMode = id !== "0";

  const [tripName, setTripName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>("truck");
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
  const [masterRoute, setMasterRoute] = useState(MASTER_ROUTES[0]);
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
    if (routeMode === "weekly") return t("labels.weeklyCycle");
    if (routeMode === "master-route") return masterRoute;
    if (routeMode === "custom-route")
      return customRouteName || t("labels.customRoute");
    return t("labels.oneOffScheduled");
  }, [customRouteName, masterRoute, routeMode, t]);

  const mapQuery = useMemo(() => {
    const source = stops[0]?.location?.trim();
    const destination = stops[stops.length - 1]?.location?.trim();
    if (source && destination) return `${source} to ${destination}`;
    if (source) return source;
    return t("labels.defaultMapQuery");
  }, [stops]);

  const showWeeklyRotation = routeMode === "weekly";
  const showMasterRoute = routeMode === "master-route";
  const showCustomRoute = routeMode === "custom-route";

  const isValid =
    tripName.trim() &&
    driverName &&
    vehicleId &&
    consigneeName.trim() &&
    stops[0]?.location &&
    stops[stops.length - 1]?.location;

  const handleDeploy = async () => {
    if (!isValid) return;
    setSaving(true);

    const initials = driverName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const vehicleTypeMap: Record<VehicleClass, Trip["vehicleType"]> = {
      truck: "truck",
      traveller: "van",
      bus: "prime-mover",
    };

    const trip: Trip = {
      id: Date.now().toString(),
      tripName,
      consigneeName,
      driverName,
      driverInitials: initials,
      vehicleLabel: vehicleId,
      vehicleType: vehicleTypeMap[vehicleClass],
      cycle,
      status: "pending",
      departureTime: departure,
      expectedArrival: arrival,
      stops,
      notifications: notif,
      createdAt: new Date().toISOString(),
    };

    console.log("Deploying trip:", {
      ...trip,
      routeMode,
      routeLabel,
      weeklyRotation,
      otpNumbers: notif.otpDriver ? otpNumbers.filter((num) => num.trim()) : [],
    });
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    router.push("/trip-master");
  };

  return (
    <div className={`${isDark ? "dark" : ""} flex flex-col min-h-screen mt-10`}>
      <header
        className={`flex items-center justify-between px-6 py-3 border-b sticky top-0 z-10 ${
          isDark ? "bg-background border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={isDark ? "text-gray-700" : "text-gray-300"}>|</span>
          <div>
            <h1
              className={`text-base font-black tracking-tight ${isDark ? "text-foreground" : "text-gray-900"}`}
            >
              {t("title")}
            </h1>
            <p
              className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
            >
              {t("subtitle")}
            </p>
            <p
              className={`text-[11px] mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {`${t("breadcrumbs.fleet")} / ${t("breadcrumbs.master")} / ${isEditMode ? t("breadcrumbs.edit") : t("breadcrumbs.create")}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/trip-master")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
              isDark
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("buttons.discard")}
          </button>
          <button
            onClick={handleDeploy}
            disabled={!isValid || saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t("buttons.deployMission")}
          </button>
        </div>
      </header>

      <main
        className={`flex-1 px-6 py-6 ${isDark ? "bg-background" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className={cardCls}>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${isDark ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}
                >
                  01
                </span>
                <h3 className={sectionTitleCls}>{t("sections.missionIdentity")}</h3>
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
                  <label className={labelCls}>{t("fields.assignedOperator")}</label>
                  <select
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">{t("fields.selectDriver")}</option>
                    {DRIVERS.map((driver) => (
                      <option key={driver} value={driver}>
                        {driver}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t("fields.vehicle")}</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">{t("fields.selectVehicle")}</option>
                    {VEHICLES.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {VEHICLE_ICON[vehicle.type]} {vehicle.id}
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
                <h3 className={sectionTitleCls}>{t("sections.fleetStrategy")}</h3>
                <div
                  className={`flex-1 h-px ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                />
              </div>

              <label className={labelCls}>{t("fields.vehicleAssignment")}</label>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {(
                  [
                    { id: "truck", title: t("vehicleClass.truck"), sub: t("vehicleClass.truckSub") },
                    {
                      id: "traveller",
                      title: t("vehicleClass.traveller"),
                      sub: t("vehicleClass.travellerSub"),
                    },
                    { id: "bus", title: t("vehicleClass.bus"), sub: t("vehicleClass.busSub") },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setVehicleClass(opt.id)}
                    className={`text-left rounded-xl border px-3 py-3 transition-colors ${
                      vehicleClass === opt.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                        : isDark
                          ? "border-gray-700 hover:border-gray-600"
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold ${vehicleClass === opt.id ? "text-indigo-600 dark:text-indigo-300" : isDark ? "text-foreground" : "text-gray-800"}`}
                    >
                      {opt.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {opt.sub}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className={cardCls}>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${isDark ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}
                >
                  03
                </span>
                <h3 className={sectionTitleCls}>{t("sections.tripCycleTimeline")}</h3>
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
                  <label className={labelCls}>{t("fields.weeklyRotation")}</label>
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
                  <label className={labelCls}>{t("fields.expectedArrival")}</label>
                  <input
                    type="datetime-local"
                    value={arrival}
                    onChange={(e) => setArrival(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {(showMasterRoute || showCustomRoute) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {showMasterRoute && (
                    <div>
                      <label className={labelCls}>{t("fields.selectMasterPipeline")}</label>
                      <select
                        value={masterRoute}
                        onChange={(e) => setMasterRoute(e.target.value)}
                        className={inputCls}
                      >
                        {MASTER_ROUTES.map((route) => (
                          <option key={route} value={route}>
                            {route}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {showCustomRoute && (
                    <div>
                      <label className={labelCls}>{t("fields.customRouteName")}</label>
                      <input
                        value={customRouteName}
                        onChange={(e) => setCustomRouteName(e.target.value)}
                        className={inputCls}
                        placeholder={t("fields.customRoutePlaceholder")}
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className={cardCls}>
              <div className="flex items-center gap-2 mb-5">
                <span
                  className={`text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md ${isDark ? "bg-indigo-900/40 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}
                >
                  04
                </span>
                <h3 className={sectionTitleCls}>{t("sections.timelineRoute")}</h3>
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

                      <input
                        value={stop.location}
                        onChange={(e) =>
                          updateStop(idx, "location", e.target.value)
                        }
                        className={`${inputCls} mb-3`}
                        placeholder={
                          isFirst
                            ? t("fields.sourcePlaceholder")
                            : isLast
                              ? t("fields.destinationPlaceholder")
                              : t("fields.stopPlaceholder")
                        }
                      />

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
                <h3 className={sectionTitleCls}>{t("sections.notifications")}</h3>
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
                      {driverName || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">{t("summary.vehicle")}</span>
                    <span className="font-semibold text-right">
                      {vehicleId || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">{t("summary.assignment")}</span>
                    <span className="font-semibold capitalize text-right">
                      {vehicleClass}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">{t("summary.cycle")}</span>
                    <span className="font-semibold uppercase text-right">
                      {cycle}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-400">{t("summary.routeMode")}</span>
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
                  {saving ? t("buttons.deploying") : t("buttons.deployMasterMission")}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
