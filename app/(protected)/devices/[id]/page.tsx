"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Smartphone, Building2, Wifi, Layers, Activity } from "lucide-react";
import { Card } from "@/components/CommonCard";

// ── Interfaces ─────────────────────────────────────────────────────────────
interface DeviceFormData {
  // Account Context
  organizationId: number;

  // Identity & Lifecycle
  deviceCategory: string;
  imeiSerial: string;
  deviceType: string;
  firmwareVersion: string;

  // Connectivity
  networkProvider: string;
  simMobile: string;
  simIccid: string;

  // Status
  status: boolean;
}

// ── Mock options (replace with API calls) ──────────────────────────────────
const MOCK_ORGS = [
  { id: 1, value: "Alpha Logistics" },
  { id: 2, value: "Beta Fleet" },
  { id: 3, value: "Gamma Transport" },
];
const CATEGORIES = ["GPS", "ADAS / DMS", "CAMERA", "SENSOR"];
const DEVICE_TYPES: Record<string, string[]> = {
  GPS: ["GPS Tracker", "GPS Logger", "Dual GPS"],
  "ADAS / DMS": ["ADAS/DMS Unit", "DMS Camera", "ADAS Controller"],
  CAMERA: ["Dashcam", "360 Camera", "Rear View Camera"],
  SENSOR: ["Temperature Sensor", "Fuel Sensor", "Door Sensor"],
};
const NETWORKS = ["Airtel", "Jio", "BSNL", "Vodafone Idea", "N/A (Local / IP)"];

// ── Component ──────────────────────────────────────────────────────────────
const ProvisionDevice: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isEditMode = id && id !== "0";

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [formData, setFormData] = useState<DeviceFormData>({
    organizationId: 0,
    deviceCategory: "GPS",
    imeiSerial: "",
    deviceType: "GPS Tracker",
    firmwareVersion: "v1.0.0",
    networkProvider: "Airtel",
    simMobile: "",
    simIccid: "",
    status: true,
  });

  // ── Helpers ────────────────────────────────────────────────────────────
  const inputClass = (extra = "") =>
    `w-full px-3 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
      isDark
        ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
    } ${extra}`;

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
    isDark ? "text-gray-400" : "text-gray-500"
  }`;

  // ── Load data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      try {
        if (isEditMode) {
          // TODO: replace with real API — getDeviceById(id)
          await new Promise((r) => setTimeout(r, 600));
          // Simulate edit pre-fill
          setFormData({
            organizationId: 1,
            deviceCategory: "GPS",
            imeiSerial: "867530912345678",
            deviceType: "GPS Tracker",
            firmwareVersion: "v2.1.4",
            networkProvider: "Airtel",
            simMobile: "+91 9876543210",
            simIccid: "8991101200000000000",
            status: true,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setPageLoading(false);
      }
    };
    init();
  }, [id]);

  // ── Form change handler ────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset deviceType when category changes
      ...(name === "deviceCategory" ? { deviceType: "" } : {}),
    }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.organizationId || formData.organizationId === 0) {
      toast.error("Please select an organization");
      return;
    }
    if (!formData.imeiSerial.trim()) {
      toast.error("IMEI / Serial number is required");
      return;
    }
    if (!formData.deviceCategory) {
      toast.error("Please select a device category");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...(isEditMode && { id: Number(id) }),
        organizationId: Number(formData.organizationId),
        deviceCategory: formData.deviceCategory,
        imeiSerial: formData.imeiSerial.trim(),
        deviceType: formData.deviceType,
        firmwareVersion: formData.firmwareVersion,
        networkProvider: formData.networkProvider,
        simMobile: formData.simMobile,
        simIccid: formData.simIccid,
        status: formData.status ? "Active" : "Inactive",
      };

      // TODO: replace with real API calls
      // const response = isEditMode ? await updateDevice(id, payload) : await saveDevice(payload);
      await new Promise((r) => setTimeout(r, 800));
      const response = {
        statusCode: 200,
        message: isEditMode
          ? "Device updated successfully!"
          : "Device provisioned successfully!",
      };

      if (response.statusCode === 200) {
        toast.success(response.message);
        setTimeout(() => router.push("/devices"), 1000);
      } else {
        toast.error(response.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ── Section header — same as ProvisionVehicle ──────────────────────────
  const SectionHeader = ({
    icon: Icon,
    title,
    subtitle,
  }: {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
  }) => (
    <div
      className={`flex items-center gap-3 py-3 mb-4 border-b ${
        isDark ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: `${selectedColor}20` }}
      >
        <Icon className="w-4 h-4" style={{ color: selectedColor }} />
      </div>
      <div>
        <h3
          className={`text-sm font-bold uppercase tracking-widest ${
            isDark ? "text-foreground" : "text-gray-800"
          }`}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );

  // ── Page loading ───────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className={`${isDark ? "dark" : ""}`}>
        <div
          className={`min-h-screen ${isDark ? "bg-background" : ""} p-6 flex items-center justify-center`}
        >
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: selectedColor }}
            ></div>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {isEditMode ? "Loading device data..." : "Preparing form..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const availableTypes = DEVICE_TYPES[formData.deviceCategory] || [];

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-3 sm:p-4 md:p-6`}
      >
        {/* ── Page header ── */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                {isEditMode ? "Edit Device" : "Provision Device"}
              </h1>
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isEditMode
                  ? "Update registry entry for this device."
                  : "Global Asset Correlation & Device Registry"}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => router.push("/devices")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: selectedColor }}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Registry Entry"
                    : "Commit Registry Entry"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Form Card ── */}
        <Card isDark={isDark}>
          <div className="p-4 sm:p-6 space-y-8">
            {/* ── ACCOUNT CONTEXT ── */}
            <div>
              <SectionHeader
                icon={Building2}
                title="Account Context"
                subtitle="Select the organization this device belongs to."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="organizationId"
                    value={formData.organizationId}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value={0}>Select Organization</option>
                    {MOCK_ORGS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ── IDENTITY & LIFECYCLE ── */}
            <div>
              <SectionHeader
                icon={Layers}
                title="Identity & Lifecycle"
                subtitle="Hardware identification and classification details."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Device Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="deviceCategory"
                    value={formData.deviceCategory}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    IMEI / Serial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="imeiSerial"
                    value={formData.imeiSerial}
                    onChange={handleChange}
                    placeholder="Hardware Identity Code"
                    className={inputClass("uppercase")}
                    style={{ letterSpacing: "0.05em" }}
                  />
                  {formData.imeiSerial &&
                    formData.imeiSerial.length > 0 &&
                    formData.deviceCategory === "GPS" &&
                    formData.imeiSerial.length !== 15 && (
                      <p className="text-xs text-amber-500 mt-1">
                        GPS IMEI should be 15 characters (
                        {formData.imeiSerial.length}/15)
                      </p>
                    )}
                </div>

                <div>
                  <label className={labelClass}>
                    Device Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value="">Select Type</option>
                    {availableTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Firmware Version</label>
                  <input
                    type="text"
                    name="firmwareVersion"
                    value={formData.firmwareVersion}
                    onChange={handleChange}
                    placeholder="e.g. v1.0.0"
                    className={inputClass()}
                  />
                </div>
              </div>
            </div>

            {/* ── CONNECTIVITY ── */}
            <div>
              <SectionHeader
                icon={Wifi}
                title="Connectivity"
                subtitle="SIM and network configuration for data ingestion."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Network Provider <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="networkProvider"
                    value={formData.networkProvider}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value="">Select Provider</option>
                    {NETWORKS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>SIM Mobile</label>
                  <input
                    type="text"
                    name="simMobile"
                    value={formData.simMobile}
                    onChange={handleChange}
                    placeholder="+XX XXX XXX"
                    className={inputClass()}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>SIM ICCID</label>
                  <input
                    type="text"
                    name="simIccid"
                    value={formData.simIccid}
                    onChange={handleChange}
                    placeholder="8991..."
                    maxLength={22}
                    className={inputClass()}
                  />
                  {formData.simIccid && formData.simIccid.length > 0 && (
                    <p
                      className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                    >
                      {formData.simIccid.length}/22 characters
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── DEVICE IDENTITY PREVIEW ── */}
            {formData.imeiSerial && (
              <div>
                <SectionHeader
                  icon={Smartphone}
                  title="Device Identity Preview"
                  subtitle="Auto-generated from the fields above."
                />
                <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3`}>
                  {[
                    { label: "Category", value: formData.deviceCategory },
                    { label: "Type", value: formData.deviceType || "—" },
                    { label: "Network", value: formData.networkProvider },
                    { label: "IMEI / Serial", value: formData.imeiSerial },
                    { label: "Firmware", value: formData.firmwareVersion },
                    {
                      label: "Status",
                      value: formData.status ? "Active" : "Inactive",
                      highlight: formData.status
                        ? "text-green-500"
                        : "text-red-500",
                    },
                  ].map(({ label, value, highlight }) => (
                    <div
                      key={label}
                      className={`p-3 rounded-xl border ${
                        isDark
                          ? "border-gray-700 bg-gray-800/50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-sm font-semibold truncate ${highlight || (isDark ? "text-foreground" : "text-gray-800")}`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── OPERATIONAL STATUS ── */}
            <div>
              <SectionHeader icon={Activity} title="Operational Status" />
              <div
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  isDark
                    ? "border-gray-700 bg-gray-800/50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isDark ? "text-foreground" : "text-gray-800"
                    }`}
                  >
                    Operational Lifecycle Status
                  </p>
                  <p
                    className={`text-xs mt-0.5 uppercase tracking-wider font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Status determines live data ingestion eligibility.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: formData.status ? "#16a34a" : "#dc2626" }}
                  >
                    {formData.status ? "ACTIVE" : "INACTIVE"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.checked,
                        }))
                      }
                    />
                    <div
                      className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{
                        backgroundColor: formData.status
                          ? selectedColor
                          : isDark
                            ? "#374151"
                            : "#D1D5DB",
                      }}
                    ></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProvisionDevice;
