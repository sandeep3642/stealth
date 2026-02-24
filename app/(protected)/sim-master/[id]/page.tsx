"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Smartphone, Wifi, ShieldCheck } from "lucide-react";
import {
  SimFormData,
  SimCarrier,
  SimAccount,
} from "@/interfaces/sim.interface";
import {
  getSimById,
  saveSim,
  updateSim,
  getSimCarriers,
} from "@/services/simservice";
import { getAllAccounts } from "@/services/commonServie";

const ProvisionSim: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const isEditMode = id && id !== "0";

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const [accounts, setAccounts] = useState<SimAccount[]>([]);
 const [carriers, setCarriers] = useState<SimCarrier[]>([
  { id: 1, name: "BSNL" },
  { id: 2, name: "Jio" },
  { id: 3, name: "Airtel" },
  { id: 4, name: "Vi (Vodafone Idea)" },
  { id: 5, name: "MTNL" },
  { id: 6, name: "Tata Docomo" }, // legacy
  { id: 7, name: "Aircel" },      // legacy
]);

  const [formData, setFormData] = useState<SimFormData>({
    // Hardware Identity
    accountId: 0,
    iccid: "",
    msisdn: "",
    imsi: "",            // API field: imsi (not imsiCode)

    // Carrier Details
    networkProviderId: 0, // API field: networkProviderId (not carrierId)
    activatedAt: "",      // API field: activatedAt (not activatedOn)
    expiryAt: "",         // API field: expiryAt (not contractExpiry)

    // Status
    statusKey: "active",  // API field: statusKey → "active" | "inactive"
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
        const [accRes,
          // carrierRes
        ] = await Promise.all([
          getAllAccounts(),
          // getSimCarriers(),
        ]);

        // Accounts response shape: [{ id: 1, value: "IOTEdge (Acc-001)" }, ...]
        if (accRes.statusCode === 200) setAccounts(accRes.data);
        // if (carrierRes) setCarriers(carrierRes);

        console.log("isEditMode", isEditMode);

        if (isEditMode) {
          const res = await getSimById(id);
          console.log("getSimById response", res);

          if (res && res.statusCode === 200) {
            const d = res.data;

            // Actual API response fields:
            // simId, accountId, iccid, msisdn, imsi,
            // networkProviderId, statusKey ("active"/"inactive"),
            // activatedAt, expiryAt,
            // createdAt, createdBy, updatedAt, updatedBy,
            // isActive, isDeleted

            setFormData({
              accountId: d.accountId ?? 0,
              iccid: d.iccid || "",
              msisdn: d.msisdn || "",
              imsi: d.imsi || "",                          // ✅ imsi not imsiCode
              networkProviderId: d.networkProviderId ?? 0, // ✅ networkProviderId not carrierId
              activatedAt: d.activatedAt                   // ✅ activatedAt not activatedOn
                ? d.activatedAt.split("T")[0]
                : "",
              expiryAt: d.expiryAt                         // ✅ expiryAt not contractExpiry
                ? d.expiryAt.split("T")[0]
                : "",
              statusKey: d.statusKey || "active",           // ✅ statusKey not status
            });
          } else {
            toast.error("SIM not found");
            router.push("/sim-master");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    if (!formData.iccid.trim()) {
      toast.error("ICCID is required");
      return;
    }
    if (formData.iccid.length < 18 || formData.iccid.length > 22) {
      toast.error("ICCID must be between 18 and 22 digits");
      return;
    }
    if (!formData.networkProviderId || formData.networkProviderId === 0) {
      toast.error("Please select a network provider");
      return;
    }

    try {
      setLoading(true);

      // Payload uses the same field names as the API
      const payload = {
        ...(isEditMode && { simId: Number(id) }),
        accountId: Number(formData.accountId),
        iccid: formData.iccid.trim(),
        msisdn: formData.msisdn.trim() || "",
        imsi: formData.imsi.trim() || "",
        networkProviderId: Number(formData.networkProviderId),
        activatedAt: formData.activatedAt
          ? new Date(formData.activatedAt).toISOString()
          : null,
        expiryAt: formData.expiryAt
          ? new Date(formData.expiryAt).toISOString()
          : null,
        statusKey: formData.statusKey, // "active" | "inactive"
      };

      const response = isEditMode
        ? await updateSim(id, payload)
        : await saveSim(payload);

      if (response.statusCode === 200) {
        toast.success(response.message || "SIM saved successfully!");
        setTimeout(() => router.push("/sim-master"), 1000);
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
            className={`text-xs mt-0.5 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
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
          className={`min-h-screen ${
            isDark ? "bg-background" : ""
          } p-6 flex items-center justify-center`}
        >
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: selectedColor }}
            ></div>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {isEditMode ? "Loading SIM data..." : "Preparing form..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${
          isDark ? "bg-background" : ""
        } p-3 sm:p-4 md:p-6`}
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
                {isEditMode ? "Edit SIM Card" : "Register SIM Card"}
              </h1>
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isEditMode
                  ? "Update SIM registry entry."
                  : "Subscriber Identity Module"}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => router.push("/sim-master")}
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
                    ? "Update SIM File"
                    : "Commit SIM File"}
              </button>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card isDark={isDark}>
          <div className="p-4 sm:p-6 space-y-8">

            {/* ── HARDWARE IDENTITY ── */}
            <div>
              <SectionHeader icon={ShieldCheck} title="Hardware Identity" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* accountId ← accounts[].id, display accounts[].value */}
                <div>
                  <label className={labelClass}>
                    Account Context <span className="text-red-500">*</span>
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
                        {a.value} {/* e.g. "IOTEdge (Acc-001)" */}
                      </option>
                    ))}
                  </select>
                </div>

                {/* iccid */}
                <div>
                  <label className={labelClass}>
                    ICCID Identification{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="iccid"
                    value={formData.iccid}
                    onChange={handleChange}
                    placeholder="89..."
                    maxLength={22}
                    className={inputClass()}
                  />
                  {formData.iccid &&
                    (formData.iccid.length < 18 ||
                      formData.iccid.length > 22) && (
                      <p className="text-xs text-amber-500 mt-1">
                        ICCID must be 18–22 digits ({formData.iccid.length}{" "}
                        entered)
                      </p>
                    )}
                </div>

                {/* msisdn */}
                <div>
                  <label className={labelClass}>MSISDN Number</label>
                  <input
                    type="text"
                    name="msisdn"
                    value={formData.msisdn}
                    onChange={handleChange}
                    placeholder="+00 ..."
                    className={inputClass()}
                  />
                </div>

                {/* imsi — API uses "imsi", not "imsiCode" */}
                <div>
                  <label className={labelClass}>IMSI Code</label>
                  <input
                    type="text"
                    name="imsi"
                    value={formData.imsi}
                    onChange={handleChange}
                    placeholder="Numeric ID"
                    maxLength={15}
                    className={inputClass()}
                  />
                  {formData.imsi &&
                    formData.imsi.length > 0 &&
                    formData.imsi.length !== 15 && (
                      <p className="text-xs text-amber-500 mt-1">
                        IMSI should be exactly 15 digits (
                        {formData.imsi.length}/15)
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* ── CARRIER DETAILS ── */}
            <div>
              <SectionHeader
                icon={Wifi}
                title="Carrier Details"
                subtitle="Network provider and contract information."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* networkProviderId — API field name */}
                <div>
                  <label className={labelClass}>
                    Network Provider <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="networkProviderId"
                    value={formData.networkProviderId}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value="0">Select Carrier</option>
                    {carriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* spacer column */}
                <div />

                {/* activatedAt — API field name */}
                <div>
                  <label className={labelClass}>Activated On</label>
                  <input
                    type="date"
                    name="activatedAt"
                    value={formData.activatedAt}
                    onChange={handleChange}
                    className={inputClass()}
                  />
                </div>

                {/* expiryAt — API field name */}
                <div>
                  <label className={labelClass}>Contract Expiry</label>
                  <input
                    type="date"
                    name="expiryAt"
                    value={formData.expiryAt}
                    onChange={handleChange}
                    className={inputClass()}
                  />
                </div>
              </div>
            </div>

            {/* ── PROVISIONING STATUS ── */}
            <div>
              <SectionHeader icon={Smartphone} title="Provisioning Status" />
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
                    Connectivity provisioning status
                  </p>
                  <p
                    className={`text-xs mt-0.5 uppercase tracking-wider font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Only enabled SIMs can be assigned to hardware.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{
                      // statusKey: "active" → green, "inactive" → red
                      color:
                        formData.statusKey === "active"
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  >
                    {formData.statusKey === "active" ? "ENABLED" : "DISABLED"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.statusKey === "active"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          statusKey: e.target.checked ? "active" : "inactive",
                        }))
                      }
                    />
                    <div
                      className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{
                        backgroundColor:
                          formData.statusKey === "active"
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

export default ProvisionSim;