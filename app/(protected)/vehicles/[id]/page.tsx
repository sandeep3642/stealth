"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Truck,
  Building2,
  Shield,
  Layers,
  FileText,
  Wrench,
} from "lucide-react";
import {
  Account,
  VehicleBrand,
  VehicleType,
  VehicleSummary,
  VehicleFormData,
} from "@/interfaces/vehicle.interface";
import {
  getLeasedVendors,
  getVehicleById,
  getVehicleType,
  saveVehicle,
  updateVehicle,
} from "@/services/vehicleService";
import { getAllAccounts } from "@/services/commonServie";

async function getVehicleBrands(): Promise<{
  statusCode: number;
  data: VehicleBrand[];
}> {
  return {
    statusCode: 200,
    data: [
      { id: 1, value: "TATA MOTORS" },
      { id: 2, value: "EICHER" },
      { id: 3, value: "ASHOK LEYLAND" },
      { id: 4, value: "MAHINDRA" },
      { id: 5, value: "VOLVO" },
    ],
  };
}

// ── Extended FormData to include all API fields ──────────────────────────────

const ProvisionVehicle: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const isEditMode = id && id !== "0";

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [leasedVendors, setLeasedVendors] = useState<
    { id: number; name: string }[]
  >([]);
  const [formData, setFormData] = useState<VehicleFormData>({
    // Identification
    accountId: 0,
    registrationNumber: "",
    vinNumber: "",
    registrationDate: new Date().toISOString().split("T")[0],

    // Classification
    vehicleTypeId: 0,
    vehicleBrandId: 0,
    vehicleClass: "",
    vehicleColor: "",

    // Ownership
    ownershipBasis: "OWNED",
    leasedVendorId: 0,
    lessorName: "",

    // Compliance
    rtoPassing: "",
    warranty: "",
    insurer: "",
    imageFilePath: "",

    // Status
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

  // ── Load reference data ────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      try {
        const [accRes, typeRes, brandRes, leasedVendorRes] = await Promise.all([
          getAllAccounts(),
          getVehicleType(),
          getVehicleBrands(),
          getLeasedVendors(),
        ]);
        console.log("leasedVendorRes", leasedVendorRes);
        if (accRes.statusCode === 200) setAccounts(accRes.data);
        if (typeRes) setVehicleTypes(typeRes);
        if (brandRes.statusCode === 200) setVehicleBrands(brandRes.data);
        if (leasedVendorRes) {
          setLeasedVendors(leasedVendorRes);
        }

        if (isEditMode) {
          const res = await getVehicleById(id);
          if (res && res.id) {
            const d = res;
            setFormData({
              // Identification
              accountId: d.accountId,
              registrationNumber: d.vehicleNumber,
              vinNumber: d.vinOrChassisNumber || "",
              registrationDate: d.registrationDate
                ? d.registrationDate.split("T")[0]
                : new Date().toISOString().split("T")[0],

              // Classification
              vehicleTypeId: d.vehicleTypeId,
              vehicleBrandId: d.vehicleBrandOemId,
              vehicleClass: d.vehicleClass || "",
              vehicleColor: d.vehicleColor || "",

              // Ownership
              ownershipBasis:
                d.ownershipType?.toLowerCase() === "leased"
                  ? "LEASED"
                  : "OWNED",
              leasedVendorId: d.leasedVendorId || 0,
              lessorName: d.lessorName || "",

              // Compliance
              rtoPassing: d.rtoPassing || "",
              warranty: d.warranty || "",
              insurer: d.insurer || "",
              imageFilePath: d.imageFilePath || "",

              // Status
              status: d.status?.toLowerCase() === "active",
            });
          } else {
            toast.error("Vehicle not found");
            router.push("/vehicles");
          }
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.accountId || formData.accountId === 0) {
      toast.error("Please select an account");
      return;
    }
    if (!formData.registrationNumber.trim()) {
      toast.error("Registration number is required");
      return;
    }
    if (!formData.vehicleTypeId || formData.vehicleTypeId === 0) {
      toast.error("Please select a vehicle type");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id: isEditMode ? Number(id) : 0,
        accountId: Number(formData.accountId),
        vehicleNumber: formData.registrationNumber.trim().toUpperCase(),
        vinOrChassisNumber: formData.vinNumber.trim() || "",
        registrationDate: formData.registrationDate
          ? new Date(formData.registrationDate).toISOString()
          : new Date().toISOString(),
        vehicleTypeId: Number(formData.vehicleTypeId),
        vehicleBrandOemId: Number(formData.vehicleBrandId) || 0,
        ownershipType:
          formData.ownershipBasis.charAt(0).toUpperCase() +
          formData.ownershipBasis.slice(1).toLowerCase(), // "LEASED" → "Leased"
        leasedVendorId:
          formData.ownershipBasis === "LEASED"
            ? Number(formData.leasedVendorId) || 0
            : 0,
        imageFilePath: formData.imageFilePath || "",
        status: formData.status ? "Active" : "Inactive",
        vehicleClass: formData.vehicleClass || "",
        rtoPassing: formData.rtoPassing || "",
        warranty: formData.warranty || "",
        insurer: formData.insurer || "",
        vehicleColor: formData.vehicleColor || "",
      };

      const response = isEditMode
        ? await updateVehicle(id, payload)
        : await saveVehicle(payload);

      if (response.statusCode === 200) {
        toast.success(response.message || "Vehicle saved successfully!");
        setTimeout(() => router.push("/vehicles"), 1000);
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

  // ── Section header helper ──────────────────────────────────────────────
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
      className={`flex items-center gap-3 py-3 mb-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
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
              {isEditMode ? "Loading vehicle data..." : "Preparing form..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-3 sm:p-4 md:p-6`}
      >
        {/* Page header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1
                className={`text-2xl sm:text-3xl font-bold ${
                  isDark ? "text-foreground" : "text-gray-900"
                }`}
              >
                {isEditMode ? "Edit Vehicle" : "Provision Vehicle"}
              </h1>
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isEditMode
                  ? "Update registry entry for this asset."
                  : "Asset Identification & Registry"}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => router.push("/vehicles")}
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
                className="flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors disabled:opacity-50"
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

        {/* Form Card */}
        <Card isDark={isDark}>
          <div className="p-4 sm:p-6 space-y-8">
            {/* ── VEHICLE IDENTIFICATION ── */}
            <div>
              <SectionHeader icon={Shield} title="Vehicle Identification" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Account <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value="0">Select Account</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="E.G. HR-26-BY-1234"
                    className={inputClass("uppercase")}
                    style={{ letterSpacing: "0.05em" }}
                  />
                </div>

                <div>
                  <label className={labelClass}>VIN / Chassis Number</label>
                  <input
                    type="text"
                    name="vinNumber"
                    value={formData.vinNumber}
                    onChange={handleChange}
                    placeholder="17-Character VIN"
                    maxLength={17}
                    className={inputClass()}
                  />
                  {formData.vinNumber &&
                    formData.vinNumber.length > 0 &&
                    formData.vinNumber.length !== 17 && (
                      <p className="text-xs text-amber-500 mt-1">
                        VIN should be exactly 17 characters (
                        {formData.vinNumber.length}/17)
                      </p>
                    )}
                </div>

                <div>
                  <label className={labelClass}>Registration Date</label>
                  <input
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleChange}
                    className={inputClass()}
                  />
                </div>
              </div>
            </div>

            {/* ── CLASSIFICATION ── */}
            <div>
              <SectionHeader
                icon={Layers}
                title="Classification"
                subtitle="Map icon & thresholds are inherited from Type."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicleTypeId"
                    value={formData.vehicleTypeId}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value="0">Select Type</option>
                    {vehicleTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.vehicleTypeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Vehicle Brand</label>
                  <select
                    name="vehicleBrandId"
                    value={formData.vehicleBrandId}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value="0">Select Brand</option>
                    {vehicleBrands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Vehicle Class</label>
                  <input
                    type="text"
                    name="vehicleClass"
                    value={formData.vehicleClass}
                    onChange={handleChange}
                    placeholder="e.g. Hatchback, SUV, HCV"
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className={labelClass}>Vehicle Color</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="vehicleColor"
                      value={formData.vehicleColor}
                      onChange={handleChange}
                      placeholder="e.g. White, Red, Orange"
                      className={inputClass()}
                    />
                    {formData.vehicleColor && (
                      <div
                        className="w-10 h-10 rounded-lg border flex-shrink-0"
                        style={{
                          backgroundColor: formData.vehicleColor.toLowerCase(),
                          borderColor: isDark ? "#374151" : "#D1D5DB",
                        }}
                        title={formData.vehicleColor}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── OWNERSHIP ── */}
            <div>
              <SectionHeader icon={Building2} title="Ownership" />
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    Ownership Basis <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    {(["OWNED", "LEASED"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            ownershipBasis: opt,
                            lessorName: opt === "OWNED" ? "" : prev.lessorName,
                            leasedVendorId:
                              opt === "OWNED" ? 0 : prev.leasedVendorId,
                          }))
                        }
                        className={`px-6 py-2 rounded-lg text-sm font-semibold tracking-wide border transition-all ${
                          formData.ownershipBasis === opt
                            ? "text-white border-transparent"
                            : isDark
                              ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                        }`}
                        style={
                          formData.ownershipBasis === opt
                            ? { backgroundColor: selectedColor }
                            : {}
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.ownershipBasis === "LEASED" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        {" "}
                        Lessor / Leasing Entity
                      </label>
                      <select
                        name="leasedVendorId"
                        value={formData.leasedVendorId || 0}
                        onChange={handleChange}
                        className={inputClass()}
                      >
                        <option value={0}>Select Vendor</option>
                        {leasedVendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── COMPLIANCE & DOCUMENTATION ── */}
            <div>
              <SectionHeader
                icon={FileText}
                title="Compliance & Documentation"
                subtitle="Regulatory and insurance details."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>RTO Passing</label>
                  <input
                    type="text"
                    name="rtoPassing"
                    value={formData.rtoPassing}
                    onChange={handleChange}
                    placeholder="e.g. RTO444"
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className={labelClass}>Insurer</label>
                  <input
                    type="text"
                    name="insurer"
                    value={formData.insurer}
                    onChange={handleChange}
                    placeholder="e.g. Kotak, HDFC ERGO"
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className={labelClass}>Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    placeholder="e.g. 2 years / 1,00,000 km"
                    className={inputClass()}
                  />
                </div>

                {/* <div>
                  <label className={labelClass}>Image File Path</label>
                  <input
                    type="text"
                    name="imageFilePath"
                    value={formData.imageFilePath}
                    onChange={handleChange}
                    placeholder="e.g. /images/vehicle10.png"
                    className={inputClass()}
                  />
                </div> */}
              </div>
            </div>

            {/* ── OPERATIONAL STATUS ── */}
            <div>
              <SectionHeader icon={Truck} title="Operational Status" />
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
                    Operational lifecycle status
                  </p>
                  <p
                    className={`text-xs mt-0.5 uppercase tracking-wider font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Determines asset visibility in live tracking hubs.
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

export default ProvisionVehicle;
