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
import { getById, updatePlan, createPlan } from "@/services/planService";
import { getCurrencies, getFormModulesDropdown } from "@/services/commonServie";
import {
  CardProps,
  Currency,
  FormModule,
  TenantCategory,
} from "@/interfaces/plan.interface";

// Mock Theme and Color Contexts
const useTheme = () => ({ isDark: false });
const useColor = () => ({ selectedColor: "#8B5CF6" });

const Card = ({ children, isDark }: CardProps) => (
  <div
    className={`${
      isDark ? "bg-gray-900" : "bg-white"
    } rounded-xl shadow-lg p-6 border ${
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
    categoryID: 1,
    tenantCategory: "End User (Direct)",
    currencyId: 0,
    settlementCurrency: "",
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

  const [entitlements, setEntitlements] = useState<Record<number, boolean>>({});

  // Dropdown data from API
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [formModules, setFormModules] = useState<FormModule[]>([]);
  const [tenantCategories, setTenantCategories] = useState<TenantCategory[]>(
    [],
  );
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Hardcoded tenant categories (can be replaced with API call)
  const tenantCategoriesOptions = [
    { id: 1, name: "End User (Direct)", displayName: "End User (Direct)" },
    { id: 2, name: "Distributor", displayName: "Distributor" },
    { id: 3, name: "Reseller", displayName: "Reseller" },
    { id: 4, name: "Enterprise", displayName: "Enterprise" },
  ];

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

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchPlanDetails();
    }
  }, [id]);

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      // Fetch currencies
      const currenciesResponse = await getCurrencies();
      if (currenciesResponse?.success && currenciesResponse?.data) {
        setCurrencies(currenciesResponse.data);
        // Set default currency if not already set
        if (!formData.currencyId && currenciesResponse.data.length > 0) {
          const defaultCurrency = currenciesResponse.data[0];
          // Extract code from value format "USD - US Dollar ($)"
          const currencyCode = defaultCurrency.value.split(" - ")[0];
          setFormData((prev) => ({
            ...prev,
            currencyId: defaultCurrency.id,
            settlementCurrency: currencyCode,
          }));
        }
      }

      // Fetch form modules for entitlement matrix
      const formModulesResponse = await getFormModulesDropdown();
      if (formModulesResponse?.success && formModulesResponse?.data) {
        setFormModules(formModulesResponse.data);

        // Initialize entitlements with false for all modules
        const initialEntitlements: Record<number, boolean> = {};
        formModulesResponse.data.forEach((module: FormModule) => {
          initialEntitlements[module.id] = false;
        });
        setEntitlements(initialEntitlements);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to load dropdown data",
      });
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const fetchPlanDetails = async () => {
    setLoading(true);
    try {
      const response = await getById(id);
      if (response?.success && response?.data) {
        const data = response.data;

        // Map API response to form data
        setFormData({
          planName: data.structure?.planName || "",
          categoryID: data.structure?.categoryID || 0,
          tenantCategory: data.structure?.tenantCategory || "End User (Direct)",
          currencyId: data.structure?.currencyId || 0,
          settlementCurrency: data.structure?.settlementCurrency || "",
          billingInterval: data.structure?.billingInterval || "Monthly",
          contractValidity: data.structure?.contractValidity || "1 Year",
          pricingModel:
            data.structure?.pricingModel || "Fixed (Flat Account-based)",
          initialBasePrice: data.setupFee?.initialBasePrice?.toString() || "",
          amcCharge:
            data.recurringFee?.annualMaintenanceCharge?.toString() || "",
          platformSubCharge:
            data.recurringFee?.platformSubscriptionCharge?.toString() || "",
          hardwareRestrictions: data.hardwareBinding?.isHardwareLocked || false,
          userCreationLimit:
            data.userLimits?.userCreationLimit?.toString() || "",
          supportNumber: data.support?.supportNumber || "",
          supportEmail: data.support?.supportEmail || "",
          supportInstructions: data.support?.internalInstructions || "",
          basePrice: data.pricing?.basePrice?.toString() || "",
          minimumPrice: data.pricing?.minimumPrice?.toString() || "",
          allowPriceChange: data.adminGuard?.allowPriceChange ?? true,
          forceSyncOnChange: data.adminGuard?.forceSyncOnChange ?? true,
        });

        // Map entitlement module IDs to entitlements
        if (
          data.entitlementModuleIds &&
          Array.isArray(data.entitlementModuleIds)
        ) {
          const updatedEntitlements: Record<number, boolean> = {
            ...entitlements,
          };
          data.entitlementModuleIds.forEach((moduleId: number) => {
            updatedEntitlements[moduleId] = true;
          });
          setEntitlements(updatedEntitlements);
        }
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

  const handleEntitlementChange = (moduleId: number) => {
    setEntitlements((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitStatus({ type: null, message: "" });

    // Get selected entitlement module IDs
    const entitlementModuleIds = Object.entries(entitlements)
      .filter(([_, enabled]) => enabled)
      .map(([id]) => parseInt(id));

    // Map form data to API payload structure
    const payload = {
      structure: {
        planName: formData.planName,
        categoryID: formData.categoryID,
        tenantCategory: formData.tenantCategory,
        currencyId: formData.currencyId,
        settlementCurrency: formData.settlementCurrency,
        billingInterval: formData.billingInterval,
        contractValidity: formData.contractValidity,
        pricingModel: 1, // You may need to map this to a number based on your backend
      },
      setupFee: {
        initialBasePrice: parseFloat(formData.initialBasePrice) || 0,
      },
      unitLicenses: [], // Add unit licenses if needed
      recurringFee: {
        annualMaintenanceCharge: parseFloat(formData.amcCharge) || 0,
        platformSubscriptionCharge: parseFloat(formData.platformSubCharge) || 0,
      },
      entitlementModuleIds: entitlementModuleIds,
      hardwareBinding: {
        isHardwareLocked: formData.hardwareRestrictions,
        allowedDeviceFamilyIds: [], // Add device family selection if needed
      },
      userLimits: {
        userCreationLimit: parseInt(formData.userCreationLimit) || 0,
      },
      support: {
        supportNumber: formData.supportNumber,
        supportEmail: formData.supportEmail,
        internalInstructions: formData.supportInstructions,
      },
      adminGuard: {
        allowPriceChange: formData.allowPriceChange,
        forceSyncOnChange: formData.forceSyncOnChange,
      },
      featureIds: [], // Add feature IDs if needed
      addonIds: [], // Add addons if needed
    };

    try {
      let response;
      if (isEditMode) {
        response = await updatePlan(id, payload);
      } else {
        response = await createPlan(payload);
      }

      if (response?.success) {
        setSubmitStatus({
          type: "success",
          message: isEditMode
            ? "Plan updated successfully!"
            : "Plan created successfully!",
        });
        setTimeout(() => {
          router.push("/manage-plans/");
        }, 2000);
      } else {
        setSubmitStatus({
          type: "error",
          message: response?.message || "Failed to save plan",
        });
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      setSubmitStatus({
        type: "error",
        message: "An error occurred while saving the plan",
      });
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping for entitlements
  const getEntitlementIcon = (moduleValue: string) => {
    const iconMap: Record<string, any> = {
      "Live-Tracking": MapPin,
      "History-Playback": Activity,
      Geofencing: Zap,
      "Fuel-Analytics": TrendingUp,
      "Driver-Behavior": Database,
      Maintenance: BarChart3,
      "API-Access": Cpu,
      "Advanced-Reports": Smartphone,
      "Account-Management": Users,
      "User-Management": Users,
      "Billing-Management": CreditCard,
    };
    return iconMap[moduleValue] || Package;
  };

  // Format module display name
  const formatModuleName = (value: string) => {
    return value.split("-").join(" ");
  };

  // Extract currency symbol from API value format "USD - US Dollar ($)"
  const getCurrencySymbol = () => {
    const selectedCurrency = currencies.find(
      (c) => c.id === formData.currencyId,
    );
    if (selectedCurrency) {
      const match = selectedCurrency.value.match(/\(([^)]+)\)/);
      return match ? match[1] : "$";
    }
    return "$";
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-20`}>
      <div
        className={`min-h-screen  ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {isEditMode ? "Edit Plan" : "Create New Plan"}
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Configure pricing, features, and subscription details.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/manage-plans")}
                className={`px-6 py-2.5 rounded-lg border ${
                  isDark
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                } font-medium transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || loadingDropdowns}
                style={{ backgroundColor: selectedColor }}
                className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {isEditMode ? "Update Plan" : "Create Plan"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus.type && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {submitStatus.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{submitStatus.message}</span>
            </div>
          )}
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Structural Definitions */}
            <Card isDark={isDark}>
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Package
                    style={{ color: selectedColor }}
                    className="w-5 h-5"
                  />
                  Structural Definitions
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Fundamental identity and tenant-scope attributes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Plan Name
                  </label>
                  <input
                    type="text"
                    name="planName"
                    value={formData.planName}
                    onChange={handleInputChange}
                    placeholder="e.g. Premium Distributor Hub"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Tenant Category
                  </label>
                  <select
                    name="categoryID"
                    value={formData.categoryID}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value);
                      const selectedCategory = tenantCategoriesOptions.find(
                        (c) => c.id === selectedId,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        categoryID: selectedId,
                        tenantCategory: selectedCategory?.name || "",
                      }));
                    }}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                  >
                    {tenantCategoriesOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Settlement Currency
                  </label>
                  <select
                    name="currencyId"
                    value={formData.currencyId}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value);
                      const selectedCurrency = currencies.find(
                        (c) => c.id === selectedId,
                      );
                      if (selectedCurrency) {
                        // Extract code from format "USD - US Dollar ($)"
                        const currencyCode =
                          selectedCurrency.value.split(" - ")[0];
                        setFormData((prev) => ({
                          ...prev,
                          currencyId: selectedId,
                          settlementCurrency: currencyCode,
                        }));
                      }
                    }}
                    disabled={loadingDropdowns}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-50`}
                  >
                    {loadingDropdowns ? (
                      <option>Loading currencies...</option>
                    ) : currencies.length > 0 ? (
                      currencies.map((currency) => (
                        <option key={currency.id} value={currency.id}>
                          {currency.value}
                        </option>
                      ))
                    ) : (
                      <option>No currencies available</option>
                    )}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Billing Interval
                  </label>
                  <select
                    name="billingInterval"
                    value={formData.billingInterval}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
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
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Contract Validity
                  </label>
                  <select
                    name="contractValidity"
                    value={formData.contractValidity}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
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
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Pricing Model
                  </label>
                  <select
                    name="pricingModel"
                    value={formData.pricingModel}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                  >
                    {pricingModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* One-Time Setup Fee */}
              <Card isDark={isDark}>
                <div className="mb-6">
                  <h3
                    className={`text-lg font-bold flex items-center gap-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <CreditCard
                      style={{ color: selectedColor }}
                      className="w-5 h-5"
                    />
                    One-Time / Setup Fee
                  </h3>
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Initial Base Price (USD)
                  </label>
                  <input
                    type="number"
                    name="initialBasePrice"
                    value={formData.initialBasePrice}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                  />
                </div>
              </Card>

              {/* Recurring Fees */}
              <Card isDark={isDark}>
                <div className="mb-6">
                  <h3
                    className={`text-lg font-bold flex items-center gap-2 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    <DollarSign
                      style={{ color: selectedColor }}
                      className="w-5 h-5"
                    />
                    Recurring Fees (Year 2+)
                  </h3>
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Annual maintenance and platform subscription.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      AMC Charge (USD)
                    </label>
                    <input
                      type="number"
                      name="amcCharge"
                      value={formData.amcCharge}
                      onChange={handleInputChange}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Platform Sub Charge (USD)
                    </label>
                    <input
                      type="number"
                      name="platformSubCharge"
                      value={formData.platformSubCharge}
                      onChange={handleInputChange}
                      placeholder="0"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Entitlement Matrix */}
            <Card isDark={isDark}>
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Zap style={{ color: selectedColor }} className="w-5 h-5" />
                  Entitlement Matrix
                </h3>
              </div>

              {loadingDropdowns ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : formModules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formModules.map((module) => {
                    const IconComponent = getEntitlementIcon(module.value);
                    return (
                      <div
                        key={module.id}
                        onClick={() => handleEntitlementChange(module.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          entitlements[module.id]
                            ? "border-purple-500 bg-purple-50"
                            : isDark
                              ? "border-gray-700 hover:border-gray-600"
                              : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              entitlements[module.id]
                                ? "bg-purple-500"
                                : isDark
                                  ? "bg-gray-800"
                                  : "bg-gray-100"
                            }`}
                          >
                            <IconComponent
                              className={`w-5 h-5 ${
                                entitlements[module.id]
                                  ? "text-white"
                                  : isDark
                                    ? "text-gray-400"
                                    : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4
                                className={`font-bold text-sm ${
                                  isDark ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {formatModuleName(module.value)}
                              </h4>
                              <input
                                type="checkbox"
                                checked={entitlements[module.id] || false}
                                onChange={() => {}}
                                className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                              />
                            </div>
                            <p
                              className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {formatModuleName(module.value)} module
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    No form modules available
                  </p>
                </div>
              )}
            </Card>

            {/* Hardware Binding & Access Control */}
            <Card isDark={isDark}>
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Smartphone
                    style={{ color: selectedColor }}
                    className="w-5 h-5"
                  />
                  Hardware Binding & Access Control
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Define plan restrictions and user creation quotas.
                </p>
              </div>

              <div className="space-y-6">
                <div
                  className={`p-4 rounded-lg border-2 border-dashed ${
                    isDark ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-sm font-bold mb-1 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        HARDWARE RESTRICTIONS
                      </h4>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
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
                  <label
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide flex items-center gap-2 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    User Creation Limit
                  </label>
                  <input
                    type="number"
                    name="userCreationLimit"
                    value={formData.userCreationLimit}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                  />
                  <p
                    className={`text-xs mt-1 italic ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    Max users allow for this plan (0 = Unlimited).
                  </p>
                </div>
              </div>
            </Card>

            {/* Dedicated Support Line */}
            <Card isDark={isDark}>
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <Headphones
                    style={{ color: selectedColor }}
                    className="w-5 h-5"
                  />
                  Dedicated Support Line
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Define a specific support channel for this plan tier.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Support Number
                  </label>
                  <div className="relative">
                    <Phone
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="text"
                      name="supportNumber"
                      value={formData.supportNumber}
                      onChange={handleInputChange}
                      placeholder="+1-XXX-XXX-XXXX"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Support Email
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="email"
                      name="supportEmail"
                      value={formData.supportEmail}
                      onChange={handleInputChange}
                      placeholder="support@domain.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-purple-500 outline-none transition-all`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-2 uppercase tracking-wide ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Internal Support Instructions / SLA
                </label>
                <textarea
                  name="supportInstructions"
                  value={formData.supportInstructions}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe specific Support Level Agreements, priority response times, or dedicated communication channels..."
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  } focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none`}
                />
              </div>
            </Card>

            {/* Admin Guard Settings */}
            <Card isDark={isDark}>
              <div className="mb-6">
                <h3
                  className={`text-lg font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <AlertCircle
                    style={{ color: selectedColor }}
                    className="w-5 h-5"
                  />
                  Admin Guard Settings
                </h3>
              </div>

              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg border-2 border-dashed ${
                    isDark ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-sm font-bold mb-1 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        ALLOW PRICE CHANGE
                      </h4>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Can tenant admins modify subscription pricing?
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
                  className={`p-4 rounded-lg border-2 border-dashed ${
                    isDark ? "border-gray-700" : "border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={`text-sm font-bold mb-1 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        FORCE SYNC ON CHANGE
                      </h4>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
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
              } rounded-xl shadow-lg border-t-4`}
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
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
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
                    Currency:
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: selectedColor }}
                  >
                    {formData.settlementCurrency || "N/A"}
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
                      {getCurrencySymbol()}
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
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        AMC:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {getCurrencySymbol()}
                        {formData.amcCharge || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Platform:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {getCurrencySymbol()}
                        {formData.platformSubCharge || "0"}
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
