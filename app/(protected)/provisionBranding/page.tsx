"use client";

import React, { useState, useEffect } from "react";
import { Globe, Palette } from "lucide-react";
import { useColor } from "@/context/ColorContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { HexColorPicker } from "react-colorful";
import {
  getWhiteLabelById,
  saveWhiteLabel,
  updateWhiteLabel,
} from "@/services/whitelabelService";
import {
  WhiteLabelFormData,
  WhiteLabelUpdateData,
} from "@/interfaces/whitelabel.interface";
import { getAllAccounts } from "@/services/commonServie";
import { toast } from "react-toastify";

const ProvisionBranding: React.FC = () => {
  const { selectedColor } = useColor();
  const { isDark } = useTheme();
  const router = useRouter();

  const [whiteLabelId, setWhiteLabelId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    accountId: 0,
    customEntryFqdn: "",
    logoUrl: "",
    primaryColorHex: "#4F46E5",
    secondaryColorHex: "#10B981",
    isActive: true,
  });

  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  const [primaryRgb, setPrimaryRgb] = useState({ r: 79, g: 70, b: 229 });
  const [secondaryRgb, setSecondaryRgb] = useState({ r: 16, g: 185, b: 129 });
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [accounts, setAccounts] = useState<{ id: number; value: string }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      console.log("params", params);
      setWhiteLabelId(params.get("id"));
    }
  }, []);

  // Fetch data if editing
  useEffect(() => {
    if (whiteLabelId) {
      setIsEditMode(true);
      fetchWhiteLabelData();
    }
  }, [whiteLabelId]);

  const fetchWhiteLabelData = async () => {
    try {
      setLoading(true);
      const response = await getWhiteLabelById(Number(whiteLabelId));

      if (response.success && response.data) {
        const data = response.data;
        setFormData({
          accountId: data.accountId,
          customEntryFqdn: data.customEntryFqdn,
          logoUrl: data.logoUrl,
          primaryColorHex: data.primaryColorHex,
          secondaryColorHex: data.secondaryColorHex,
          isActive: data.isActive,
        });

        // Set RGB values for primary color
        const primaryBigint = parseInt(data.primaryColorHex.slice(1), 16);
        setPrimaryRgb({
          r: (primaryBigint >> 16) & 255,
          g: (primaryBigint >> 8) & 255,
          b: primaryBigint & 255,
        });

        // Set RGB values for secondary color
        const secondaryBigint = parseInt(data.secondaryColorHex.slice(1), 16);
        setSecondaryRgb({
          r: (secondaryBigint >> 16) & 255,
          g: (secondaryBigint >> 8) & 255,
          b: secondaryBigint & 255,
        });
      }
    } catch (error) {
      console.error("Error fetching white label:", error);
      toast.error("Failed to load white label data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "accountId" ? Number(value) : value,
    }));
  };

  const handleCancel = () => router.back();

  const handleActivate = async () => {
    if (!formData.accountId) {
      toast.error("Please select a target account");
      return;
    }

    if (!formData.customEntryFqdn) {
      toast.error("Please enter custom FQDN");
      return;
    }

    try {
      setLoading(true);

      let response;
      if (isEditMode && whiteLabelId) {
        // Update existing
        const updatePayload: WhiteLabelUpdateData = {
          customEntryFqdn: formData.customEntryFqdn,
          logoUrl: formData.logoUrl,
          primaryColorHex: formData.primaryColorHex,
          secondaryColorHex: formData.secondaryColorHex,
          isActive: formData.isActive,
        };
        response = await updateWhiteLabel(updatePayload, Number(whiteLabelId));
      } else {
        // Create new
        const createPayload: WhiteLabelFormData = {
          accountId: formData.accountId,
          customEntryFqdn: formData.customEntryFqdn,
          logoUrl: formData.logoUrl,
          primaryColorHex: formData.primaryColorHex,
          secondaryColorHex: formData.secondaryColorHex,
          isActive: formData.isActive,
        };
        response = await saveWhiteLabel(createPayload);
      }

      if (response.success) {
        toast.success(
          `White label ${isEditMode ? "updated" : "created"} successfully!`,
        );
        router.push("/whiteLabel");
      } else {
        toast.error(`Failed: ${response.message}`);
      }
    } catch (error) {
      console.error("Error saving white label:", error);
      toast.error("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  const handlePrimaryColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, primaryColorHex: color }));
    const bigint = parseInt(color.slice(1), 16);
    setPrimaryRgb({
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    });
  };

  const handleSecondaryColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, secondaryColorHex: color }));
    const bigint = parseInt(color.slice(1), 16);
    setSecondaryRgb({
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    });
  };

  const updatePrimaryRgb = (channel: "r" | "g" | "b", value: number) => {
    const newRgb = { ...primaryRgb, [channel]: value };
    setPrimaryRgb(newRgb);
    const hex =
      "#" +
      ((1 << 24) + (newRgb.r << 16) + (newRgb.g << 8) + newRgb.b)
        .toString(16)
        .slice(1)
        .toUpperCase();
    setFormData((prev) => ({ ...prev, primaryColorHex: hex }));
  };

  const updateSecondaryRgb = (channel: "r" | "g" | "b", value: number) => {
    const newRgb = { ...secondaryRgb, [channel]: value };
    setSecondaryRgb(newRgb);
    const hex =
      "#" +
      ((1 << 24) + (newRgb.r << 16) + (newRgb.g << 8) + newRgb.b)
        .toString(16)
        .slice(1)
        .toUpperCase();
    setFormData((prev) => ({ ...prev, secondaryColorHex: hex }));
  };

  async function fetchAllAcounts() {
    const response = await getAllAccounts();
    if (response && response.statusCode === 200) {
      // toast.success(response.message);
      setAccounts(response.data);
    }
  }

  useEffect(() => {
    fetchAllAcounts();
  }, []);

  if (loading && isEditMode) {
    return (
      <div className={`${isDark ? "dark" : ""} mt-10`}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className="min-h-screen bg-background flex items-start justify-center p-6">
        <div className="w-full max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 px-3 sm:px-0">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
              {isEditMode ? "Edit" : "Provision"} Branding
            </h1>

            <button
              onClick={handleCancel}
              className="text-sm sm:text-base text-foreground hover:text-foreground/70 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Core Instance Mapping */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5" style={{ color: selectedColor }} />
                  <h2 className="text-xl font-bold text-foreground">
                    Core Instance Mapping
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Account
                    </label>
                    <select
                      name="accountId"
                      value={formData.accountId}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="">Select Account</option>
                      {accounts &&
                        accounts.map(
                          (account: { id: number; value: string }) => (
                            <option key={account.id} value={account.id}>
                              {account.value}
                            </option>
                          ),
                        )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Custom Entry FQDN
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground opacity-50 text-sm">
                        https://
                      </span>
                      <input
                        type="text"
                        name="customEntryFqdn"
                        value={formData.customEntryFqdn}
                        onChange={handleInputChange}
                        placeholder="portal.partner.com"
                        className={`w-full pl-20 pr-4 py-2.5 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-gray-800 border-gray-700 text-foreground"
                            : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Identity Systems */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Palette
                    className="w-5 h-5"
                    style={{ color: selectedColor }}
                  />
                  <h2 className="text-xl font-bold text-foreground">
                    Visual Identity Systems
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Brand Mark / Logo URL */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                      Logo URL
                    </label>
                    <input
                      type="text"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleInputChange}
                      placeholder="https://cdn.example.com/logo.png"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Color Palettes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Primary Palette */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                        Primary Color
                      </label>
                      <div className="bg-background rounded-xl border border-border p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <button
                            onClick={() =>
                              setShowPrimaryPicker(!showPrimaryPicker)
                            }
                            className="w-16 h-16 rounded-lg border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            style={{
                              backgroundColor: formData.primaryColorHex,
                            }}
                          />
                          <div>
                            <p className="text-xs font-bold text-foreground opacity-50 uppercase tracking-wide mb-1">
                              HEX
                            </p>
                            <input
                              type="text"
                              name="primaryColorHex"
                              value={formData.primaryColorHex}
                              onChange={handleInputChange}
                              className="text-base font-bold text-foreground bg-transparent border-none focus:outline-none w-32"
                            />
                          </div>
                        </div>

                        {showPrimaryPicker && (
                          <div className="space-y-4">
                            <HexColorPicker
                              color={formData.primaryColorHex}
                              onChange={handlePrimaryColorChange}
                            />
                            <div className="grid grid-cols-3 gap-3">
                              {(["r", "g", "b"] as const).map((c) => (
                                <div key={c}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={primaryRgb[c]}
                                    onChange={(e) =>
                                      updatePrimaryRgb(
                                        c,
                                        Number(e.target.value),
                                      )
                                    }
                                    className={`w-full px-3 py-2 text-center rounded-lg border transition-colors ${
                                      isDark
                                        ? "bg-gray-800 border-gray-700 text-foreground"
                                        : "bg-white border-gray-300 text-gray-900"
                                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                                  />
                                  <p className="text-xs text-center font-semibold text-foreground mt-1 uppercase">
                                    {c}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Secondary Palette */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                        Secondary Color
                      </label>
                      <div className="bg-background rounded-xl border border-border p-4">
                        <div className="flex items-center gap-4 mb-4">
                          <button
                            onClick={() =>
                              setShowSecondaryPicker(!showSecondaryPicker)
                            }
                            className="w-16 h-16 rounded-lg border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            style={{
                              backgroundColor: formData.secondaryColorHex,
                            }}
                          />
                          <div>
                            <p className="text-xs font-bold text-foreground opacity-50 uppercase tracking-wide mb-1">
                              HEX
                            </p>
                            <input
                              type="text"
                              name="secondaryColorHex"
                              value={formData.secondaryColorHex}
                              onChange={handleInputChange}
                              className="text-base font-bold text-foreground bg-transparent border-none focus:outline-none w-32"
                            />
                          </div>
                        </div>

                        {showSecondaryPicker && (
                          <div className="space-y-4">
                            <HexColorPicker
                              color={formData.secondaryColorHex}
                              onChange={handleSecondaryColorChange}
                            />
                            <div className="grid grid-cols-3 gap-3">
                              {(["r", "g", "b"] as const).map((c) => (
                                <div key={c}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={secondaryRgb[c]}
                                    onChange={(e) =>
                                      updateSecondaryRgb(
                                        c,
                                        Number(e.target.value),
                                      )
                                    }
                                    className={`w-full px-3 py-2 text-center rounded-lg border transition-colors ${
                                      isDark
                                        ? "bg-gray-800 border-gray-700 text-foreground"
                                        : "bg-white border-gray-300 text-gray-900"
                                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                                  />
                                  <p className="text-xs text-center font-semibold text-foreground mt-1 uppercase">
                                    {c}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-semibold text-foreground cursor-pointer"
                    >
                      Active Status
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Identity Blueprint */}
            <div className="lg:col-span-1">
              <div
                className="bg-card rounded-xl shadow-lg border border-border border-t-4 overflow-hidden sticky top-24"
                style={{ borderTopColor: selectedColor }}
              >
                <div className="p-6">
                  <h3
                    className="text-sm font-bold uppercase tracking-wide mb-1"
                    style={{ color: selectedColor }}
                  >
                    IDENTITY BLUEPRINT
                  </h3>
                  <p className="text-sm text-foreground opacity-60">
                    Visual summary of the rebranded portal.
                  </p>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground opacity-70">
                      FQDN:
                    </span>
                    <span
                      className="text-sm font-bold break-all"
                      style={{ color: selectedColor }}
                    >
                      {formData.customEntryFqdn || "Not set"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground opacity-70">
                      ACCOUNT:
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {accounts?.length > 0 &&
                        accounts.find(
                          (val: { id: number; value: string }) =>
                            val.id === formData.accountId,
                        )?.value}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground opacity-70">
                      STATUS:
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded ${
                        formData.isActive
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {formData.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-foreground opacity-70 mb-2">
                      COLOR PREVIEW
                    </p>
                    <div className="flex gap-2">
                      <div
                        className="flex-1 h-12 rounded border-2 border-white shadow-sm"
                        style={{ backgroundColor: formData.primaryColorHex }}
                        title={`Primary: ${formData.primaryColorHex}`}
                      />
                      <div
                        className="flex-1 h-12 rounded border-2 border-white shadow-sm"
                        style={{
                          backgroundColor: formData.secondaryColorHex,
                        }}
                        title={`Secondary: ${formData.secondaryColorHex}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  <button
                    onClick={handleActivate}
                    disabled={loading}
                    className="w-full py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {loading
                      ? "Saving..."
                      : isEditMode
                        ? "Update Whitelabel"
                        : "Activate Whitelabel"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvisionBranding;
