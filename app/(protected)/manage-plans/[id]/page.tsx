"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CreditCard,
  DollarSign,
  Package,
  Zap,
  MapPin,
  Activity,
  TrendingUp,
  Database,
  BarChart3,
  Cpu,
  Smartphone,
  Headphones,
  Users,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Mock Theme and Color Contexts
const useTheme = () => ({ isDark: false });
const useColor = () => ({ selectedColor: "#8B5CF6" });

interface CardProps {
  children: React.ReactNode;
  isDark: boolean;
}

const Card = ({ children, isDark }: CardProps) => (
  <div
    className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-xl shadow-lg p-6 border ${
      isDark ? "border-gray-800" : "border-gray-200"
    }`}
  >
    {children}
  </div>
);

const PlansManagement = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const isEditMode = id && id !== "0";
  const { isDark } = useTheme();
  const { selectedColor } = useColor();

  const [formData, setFormData] = useState({
    planName: "",
    tenantCategory: "End User (Direct)",
    settlementCurrency: "USD ($)",
    billingInterval: "Monthly",
    contractValidity: "1 Year",
    pricingModel: "Fixed (Flat Account-based)",
    initialBasePrice: "",
    amcCharge: "",
    platformSubCharge: "",
    hardwareRestrictions: false,
    userCreationLimit: "",
    supportNumber: "",
    supportEmail: "",
    supportInstructions: "",
    basePrice: "",
    minimumPrice: "",
    allowPriceChange: true,
    forceSyncOnChange: true,
  });

  const [entitlements, setEntitlements] = useState({
    liveTracking: true,
    historyPlayback: false,
    geofencing: false,
    fuelAnalytics: false,
    driverBehavior: false,
    maintenance: false,
    apiAccess: false,
    advancedReports: false,
  });

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Feature IDs mapping (you'll need to get these from your backend)
  const featureIdMap: Record<string, string> = {
    liveTracking: "feature-uuid-1",
    historyPlayback: "feature-uuid-2",
    geofencing: "feature-uuid-3",
    fuelAnalytics: "feature-uuid-4",
    driverBehavior: "feature-uuid-5",
    maintenance: "feature-uuid-6",
    apiAccess: "feature-uuid-7",
    advancedReports: "feature-uuid-8",
  };

  const tenantCategories = [
    "End User (Direct)",
    "Distributor",
    "Reseller",
    "Enterprise",
  ];

  const currencies = ["USD ($)", "EUR (€)", "GBP (£)", "INR (₹)"];
  const billingIntervals = ["Monthly", "Quarterly", "Half-Yearly", "Yearly"];
  const contractValidities = [
    "1 Month",
    "3 Months",
    "6 Months",
    "1 Year",
    "2 Years",
    "3 Years",
  ];
  const pricingModels = [
    "Fixed (Flat Account-based)",
    "Per User",
    "Tiered",
    "Usage-based",
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchPlanDetails();
    }
  }, [id]);

  const fetchPlanDetails = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const response = await fetch(
        `http://fleetbharat.com:8080/api/plans/${id}`,
      );
      if (response.ok) {
        const data = await response.json();
        // Map API response to form data
        setFormData({
          planName: data.structure.planName,
          tenantCategory: data.structure.tenantCategory,
          settlementCurrency: data.structure.settlementCurrency,
          billingInterval: data.structure.billingInterval,
          contractValidity: data.structure.contractValidity,
          pricingModel: data.structure.pricingModel,
          initialBasePrice: data.setupFee.initialBasePrice.toString(),
          amcCharge: data.recurringFee.annualMaintenanceCharge.toString(),
          platformSubCharge:
            data.recurringFee.platformSubscriptionCharge.toString(),
          hardwareRestrictions: data.hardwareBinding.isHardwareLocked,
          userCreationLimit: data.userLimits.userCreationLimit.toString(),
          supportNumber: data.support.supportNumber,
          supportEmail: data.support.supportEmail,
          supportInstructions: data.support.internalInstructions,
          basePrice: data.pricing.basePrice.toString(),
          minimumPrice: data.pricing.minimumPrice.toString(),
          allowPriceChange: data.adminGuard.allowPriceChange,
          forceSyncOnChange: data.adminGuard.forceSyncOnChange,
        });
        // Map feature IDs to entitlements
        // You'll need to implement reverse mapping based on your feature IDs
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to load plan details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEntitlementChange = (key: keyof typeof entitlements) => {
    setEntitlements((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitStatus({ type: null, message: "" });

    // Get selected feature IDs based on entitlements
    const featureIds = Object.entries(entitlements)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => featureIdMap[key])
      .filter(Boolean);

    // Map form data to API payload structure
    const payload = {
      structure: {
        planName: formData.planName,
        tenantCategory: formData.tenantCategory,
        settlementCurrency: formData.settlementCurrency,
        billingInterval: formData.billingInterval,
        contractValidity: formData.contractValidity,
        pricingModel: formData.pricingModel,
      },
      setupFee: {
        initialBasePrice: parseFloat(formData.initialBasePrice) || 0,
      },
      recurringFee: {
        annualMaintenanceCharge: parseFloat(formData.amcCharge) || 0,
        platformSubscriptionCharge: parseFloat(formData.platformSubCharge) || 0,
      },
      hardwareBinding: {
        isHardwareLocked: formData.hardwareRestrictions,
        allowedDeviceFamilyIds: [], // Add device family IDs as needed
      },
      userLimits: {
        userCreationLimit: parseInt(formData.userCreationLimit) || 0,
      },
      support: {
        supportNumber: formData.supportNumber,
        supportEmail: formData.supportEmail,
        internalInstructions: formData.supportInstructions,
      },
      pricing: {
        basePrice:
          parseFloat(formData.basePrice || formData.initialBasePrice) || 0,
        minimumPrice: parseFloat(formData.minimumPrice) || 0,
        billingCycle: formData.billingInterval,
        userLimit: parseInt(formData.userCreationLimit) || 0,
      },
      adminGuard: {
        allowPriceChange: formData.allowPriceChange,
        forceSyncOnChange: formData.forceSyncOnChange,
      },
      featureIds: featureIds,
      addonIds: [], // Add addon IDs as needed
    };

    try {
      const url = isEditMode
        ? `http://fleetbharat.com:8080/api/plans/${id}`
        : "http://fleetbharat.com:8080/api/plans";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitStatus({
          type: "success",
          message: isEditMode
            ? "Plan updated successfully!"
            : "Plan created successfully!",
        });

        // Optionally redirect after success
        setTimeout(() => {
          router.push("/plans"); // Adjust to your plans list route
        }, 2000);
      } else {
        const errorData = await response.json();
        setSubmitStatus({
          type: "error",
          message: errorData.message || "Failed to save plan",
        });
      }
    } catch (error) {
      console.error("Error submitting plan:", error);
      setSubmitStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const entitlementsList = [
    {
      key: "liveTracking" as const,
      icon: MapPin,
      label: "LIVE TRACKING",
      desc: "Real-time asset movement updates",
    },
    {
      key: "historyPlayback" as const,
      icon: Activity,
      label: "HISTORY PLAYBACK",
      desc: "Access to historical route data",
    },
    {
      key: "geofencing" as const,
      icon: Cpu,
      label: "GEOFENCING",
      desc: "Virtual boundaries and alerts",
    },
    {
      key: "fuelAnalytics" as const,
      icon: TrendingUp,
      label: "FUEL ANALYTICS",
      desc: "Fuel level and consumption tracking",
    },
    {
      key: "driverBehavior" as const,
      icon: Activity,
      label: "DRIVER BEHAVIOR",
      desc: "Harsh braking, acceleration, idling",
    },
    {
      key: "maintenance" as const,
      icon: Cpu,
      label: "MAINTENANCE",
      desc: "Service reminders and logs",
    },
    {
      key: "apiAccess" as const,
      icon: Database,
      label: "API ACCESS",
      desc: "External integration capabilities",
    },
    {
      key: "advancedReports" as const,
      icon: BarChart3,
      label: "ADVANCED REPORTS",
      desc: "Scheduled PDF/Excel reporting",
    },
  ];

  return (
    <div className={`${isDark ? "dark" : ""} p-6 mt-20`}>
      <div className="max-w-7xl mx-auto">
        {/* Status Alert */}
        {submitStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              submitStatus.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p
              className={`text-sm font-medium ${
                submitStatus.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {submitStatus.message}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1
                className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {isEditMode ? "Edit Market Plan" : "Define New Market Plan"}
              </h1>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Configure structural logic, pricing tiers, and entitlement sets.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-none px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
                onClick={() => router.back()}
                disabled={loading}
              >
                Discard Changes
              </button>
              <button
                className="flex-1 sm:flex-none text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: selectedColor }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    <span>
                      {isEditMode ? "Update Plan" : "Save & Activate"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Structural Definitions */}
            <Card isDark={isDark}>
              <div>
                <h2
                  className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Structural Definitions
                </h2>
                <p
                  className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Fundamental identity and tenant-scope attributes.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      name="planName"
                      value={formData.planName}
                      onChange={handleInputChange}
                      placeholder="e.g. Premium Distributor Hub"
                      required
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Tenant Category
                    </label>
                    <select
                      name="tenantCategory"
                      value={formData.tenantCategory}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      {tenantCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Settlement Currency
                    </label>
                    <select
                      name="settlementCurrency"
                      value={formData.settlementCurrency}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      {currencies.map((curr) => (
                        <option key={curr} value={curr}>
                          {curr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Billing Interval
                    </label>
                    <select
                      name="billingInterval"
                      value={formData.billingInterval}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      {billingIntervals.map((interval) => (
                        <option key={interval} value={interval}>
                          {interval}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Contract Validity
                    </label>
                    <select
                      name="contractValidity"
                      value={formData.contractValidity}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      {contractValidities.map((validity) => (
                        <option key={validity} value={validity}>
                          {validity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Pricing Model
                    </label>
                    <select
                      name="pricingModel"
                      value={formData.pricingModel}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      {pricingModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pricing Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* One-Time Setup Fee */}
              <Card isDark={isDark}>
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard
                    className="w-5 h-5"
                    style={{ color: selectedColor }}
                  />
                  <h3
                    className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    One-Time / Setup Fee
                  </h3>
                </div>
                <div>
                  <label
                    className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Initial Base Price (USD)
                  </label>
                  <input
                    type="number"
                    name="initialBasePrice"
                    value={formData.initialBasePrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  />
                </div>
              </Card>

              {/* Recurring Fees */}
              <Card isDark={isDark}>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign
                    className="w-5 h-5"
                    style={{ color: selectedColor }}
                  />
                  <h3
                    className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    Recurring Fees (Year 2+)
                  </h3>
                </div>
                <p
                  className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Annual maintenance and platform subscription.
                </p>
                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      AMC Charge (USD)
                    </label>
                    <input
                      type="number"
                      name="amcCharge"
                      value={formData.amcCharge}
                      onChange={handleInputChange}
                      placeholder="0"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      Platform Sub Charge (USD)
                    </label>
                    <input
                      type="number"
                      name="platformSubCharge"
                      value={formData.platformSubCharge}
                      onChange={handleInputChange}
                      placeholder="0"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Entitlement Matrix */}
            <Card isDark={isDark}>
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5" style={{ color: selectedColor }} />
                <h3
                  className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Entitlement Matrix
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entitlementsList.map(({ key, icon: Icon, label, desc }) => (
                  <div
                    key={key}
                    onClick={() => handleEntitlementChange(key)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      entitlements[key]
                        ? `border-purple-500 ${isDark ? "bg-purple-900/20" : "bg-purple-50"}`
                        : `border-gray-200 ${isDark ? "bg-gray-800/50" : "bg-white"}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${entitlements[key] ? "bg-purple-500" : "bg-gray-200"}`}
                      >
                        <Icon
                          className={`w-5 h-5 ${entitlements[key] ? "text-white" : "text-gray-600"}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4
                            className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                          >
                            {label}
                          </h4>
                          <input
                            type="checkbox"
                            checked={entitlements[key]}
                            onChange={() => handleEntitlementChange(key)}
                            className="w-4 h-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <p
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Hardware Binding & Access Control */}
            <Card isDark={isDark}>
              <div className="flex items-center gap-2 mb-2">
                <Smartphone
                  className="w-5 h-5"
                  style={{ color: selectedColor }}
                />
                <h3
                  className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Hardware Binding & Access Control
                </h3>
              </div>
              <p
                className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Define plan restrictions and user creation quotas.
              </p>

              <div className="space-y-6">
                <div
                  className={`p-4 rounded-lg border-2 border-dashed ${isDark ? "border-gray-700" : "border-gray-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        HARDWARE RESTRICTIONS
                      </h4>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Is this plan locked to specific tracking device
                        families?
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="hardwareRestrictions"
                        checked={formData.hardwareRestrictions}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users
                      className="w-4 h-4"
                      style={{ color: selectedColor }}
                    />
                    <label
                      className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      User Creation Limit
                    </label>
                  </div>
                  <input
                    type="number"
                    name="userCreationLimit"
                    value={formData.userCreationLimit}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  />
                  <p
                    className={`text-xs mt-2 italic ${isDark ? "text-gray-500" : "text-gray-500"}`}
                  >
                    Max users allowed for this plan (0 = Unlimited).
                  </p>
                </div>
              </div>
            </Card>

            {/* Dedicated Support Line */}
            <Card isDark={isDark}>
              <div className="flex items-center gap-2 mb-2">
                <Headphones
                  className="w-5 h-5"
                  style={{ color: selectedColor }}
                />
                <h3
                  className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Dedicated Support Line
                </h3>
              </div>
              <p
                className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Define a specific support channel for this plan tier.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Support Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="supportNumber"
                      value={formData.supportNumber}
                      onChange={handleInputChange}
                      placeholder="+1-XXX-XXX-XXXX"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Support Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="supportEmail"
                      value={formData.supportEmail}
                      onChange={handleInputChange}
                      placeholder="support@domain.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label
                    className={`block text-xs font-semibold mb-2 uppercase tracking-wide ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Internal Support Instructions / SLA
                  </label>
                  <textarea
                    name="supportInstructions"
                    value={formData.supportInstructions}
                    onChange={handleInputChange}
                    placeholder="Describe specific Support Level Agreements, priority response times, or dedicated communication channels..."
                    rows={4}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors resize-none ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  />
                </div>
              </div>
            </Card>

            {/* Admin Guard Settings */}
            <Card isDark={isDark}>
              <div className="flex items-center gap-2 mb-2">
                <Activity
                  className="w-5 h-5"
                  style={{ color: selectedColor }}
                />
                <h3
                  className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  Admin Guard Settings
                </h3>
              </div>
              <p
                className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Control pricing flexibility and synchronization behavior.
              </p>

              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border-2 border-dashed ${isDark ? "border-gray-700" : "border-gray-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        ALLOW PRICE CHANGES
                      </h4>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Can admins modify pricing after plan creation?
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="allowPriceChange"
                        checked={formData.allowPriceChange}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 border-dashed ${isDark ? "border-gray-700" : "border-gray-300"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        FORCE SYNC ON CHANGE
                      </h4>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Automatically sync changes to all subscribed accounts?
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="forceSyncOnChange"
                        checked={formData.forceSyncOnChange}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Plan Blueprint */}
          <div className="lg:col-span-1">
            <div
              style={{ borderColor: selectedColor }}
              className={`${
                isDark
                  ? "bg-gray-900 border-gray-800"
                  : "bg-white border-gray-200"
              } rounded-xl shadow-lg border-t-4 overflow-hidden sticky top-6`}
            >
              <div className="p-6">
                <h3
                  className={`text-lg font-bold mb-1 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  PLAN BLUEPRINT
                </h3>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Live configuration summary.
                </p>
              </div>
              <div className="px-6 pb-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Category:
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: selectedColor }}
                  >
                    {formData.tenantCategory || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Cycle:
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formData.billingInterval || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Users Limit:
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: selectedColor }}
                  >
                    {formData.userCreationLimit || "Unlimited"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Active Features:
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: selectedColor }}
                  >
                    {Object.values(entitlements).filter(Boolean).length} /{" "}
                    {Object.keys(entitlements).length}
                  </span>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div
                      className="text-5xl font-bold mb-2"
                      style={{ color: selectedColor }}
                    >
                      {formData.settlementCurrency?.includes("$") ? "$" : ""}
                      {formData.initialBasePrice || "0"}
                    </div>
                    <p
                      className={`text-sm uppercase tracking-wide ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      SETUP FEE
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-6 p-4 rounded-lg ${
                    isDark ? "bg-purple-900/20" : "bg-purple-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Calendar
                      style={{ color: selectedColor }}
                      className="w-5 h-5 mt-0.5"
                    />
                    <div>
                      <p
                        className="text-xs font-bold mb-1"
                        style={{ color: selectedColor }}
                      >
                        CONTRACT TERM
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formData.contractValidity || "Not Set"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-4 p-4 rounded-lg ${
                    isDark ? "bg-gray-800" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Recurring Charges (Year 2+)
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        AMC:
                      </span>
                      <span
                        className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        ${formData.amcCharge || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Platform:
                      </span>
                      <span
                        className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                      >
                        ${formData.platformSubCharge || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansManagement;
