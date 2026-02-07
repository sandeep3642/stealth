"use client";

import React, { useEffect, useState } from "react";
import { Map, Globe, Languages, Plus, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import { useRouter, useParams } from "next/navigation";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import {
  getConfigurationById,
  saveConfiguration,
  updateConfiguration,
} from "@/services/configurationService";
import { toast } from "react-toastify";
import { getAllAccounts } from "@/services/commonServie";

const Card = ({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) => (
  <div
    className={`${isDark ? "bg-card" : "bg-white"} rounded-xl shadow-lg p-6 border ${isDark ? "border-gray-800" : "border-gray-200"}`}
  >
    {children}
  </div>
);

const NewConfiguration: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEditMode = id && id !== "0";
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountId: 0,
    mapProvider: "GoogleMaps",
    licenseKey: "",
    addressKey: "",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12H",
    distanceUnit: "KM",
    speedUnit: "KMH",
    fuelUnit: "LITRE",
    temperatureUnit: "CELSIUS",
    addressDisplay: "SHOW",
    defaultLanguage: "en",
    allowedLanguages: [] as string[],
  });

  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>([]);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const response = await getConfigurationById(Number(id));
      if (response.success && response.data) {
        const config = response.data;
        setFormData({
          accountId: config.accountId,
          mapProvider: config.mapProvider || "GoogleMaps",
          licenseKey: config.licenseKey || "",
          addressKey: config.addressKey || "",
          dateFormat: config.dateFormat || "DD/MM/YYYY",
          timeFormat: config.timeFormat || "12H",
          distanceUnit: config.distanceUnit || "KM",
          speedUnit: config.speedUnit || "KMH",
          fuelUnit: config.fuelUnit || "LITRE",
          temperatureUnit: config.temperatureUnit || "CELSIUS",
          addressDisplay: config.addressDisplay || "SHOW",
          defaultLanguage: config.defaultLanguage || "en",
          allowedLanguages: config.allowedLanguages || [],
        });
        setAdditionalLanguages(config.allowedLanguages || []);
      }
    } catch (error) {
      console.error("Error fetching configuration:", error);
      alert("Failed to load configuration");
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

  const handleAddLanguage = () => {
    setAdditionalLanguages([...additionalLanguages, ""]);
  };

  const handleRemoveLanguage = (index: number) => {
    setAdditionalLanguages(additionalLanguages.filter((_, i) => i !== index));
  };

  const handleLanguageChange = (index: number, value: string) => {
    const updated = [...additionalLanguages];
    updated[index] = value;
    setAdditionalLanguages(updated);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.accountId || formData.accountId === 0) {
      toast.error("Please enter a valid Account ID");
      return;
    }

    try {
      setLoading(true);

      // Filter out empty languages and ensure no duplicates
      const filteredLanguages = Array.from(
        new Set(additionalLanguages.filter((lang) => lang.trim() !== "")),
      );

      const payload = {
        accountId: formData.accountId,
        mapProvider: formData.mapProvider,
        licenseKey: formData.licenseKey || undefined,
        addressKey: formData.addressKey || undefined,
        dateFormat: formData.dateFormat,
        timeFormat: formData.timeFormat,
        distanceUnit: formData.distanceUnit,
        speedUnit: formData.speedUnit,
        fuelUnit: formData.fuelUnit,
        temperatureUnit: formData.temperatureUnit,
        addressDisplay: formData.addressDisplay,
        defaultLanguage: formData.defaultLanguage,
        allowedLanguages:
          filteredLanguages.length > 0 ? filteredLanguages : undefined,
      };

      let response;
      if (isEditMode) {
        response = await updateConfiguration(payload, Number(id));
      } else {
        response = await saveConfiguration(payload);
      }

      if (response.success) {
        alert(
          isEditMode
            ? "Configuration updated successfully!"
            : "Configuration created successfully!",
        );
        router.push("/configuration");
      } else {
        alert(`Failed to save: ${response.message}`);
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      alert("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  async function fetchAllAcounts() {
    const response = await getAllAccounts();
    if (response && response.statusCode === 200) {
      // toast.success(response.message);
      setAccounts(response.data);
    }
  }

  useEffect(() => {
    if (isEditMode) {
      fetchConfiguration();
    }
    fetchAllAcounts();
  }, [id]);

  return (
    <div className={`${isDark ? "dark" : ""} mt-20`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 px-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <h1
              className={`text-2xl sm:text-3xl font-bold ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
            >
              {isEditMode ? "Edit Configuration" : "New Configuration"}
            </h1>

            <button
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>

        {loading && isEditMode ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading configuration...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Account Selection */}
            <Card isDark={isDark}>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Account ID <span className="text-red-500">*</span>
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
                    accounts.map((account: { id: number; value: string }) => (
                      <option key={account.id} value={account.id}>
                        {account.value}
                      </option>
                    ))}
                </select>
              </div>
            </Card>

            {/* Map Configuration */}
            <Card isDark={isDark}>
              <div className="mb-6">
                <div className="flex justify-center flex-col items-center gap-2 mb-6 border-b border-border p-2">
                  <Map className="w-5 h-5" style={{ color: selectedColor }} />
                  <h2
                    className={`text-lg font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    Map Configuration
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Map Provider */}
                  <div className="relative">
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Map Provider
                    </label>
                    <div className="relative">
                      <select
                        name="mapProvider"
                        value={formData.mapProvider}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                      >
                        <option value="GoogleMaps">Google Maps</option>
                        <option value="HereMaps">Here Maps</option>
                        <option value="OpenStreetMap">OpenStreetMap</option>
                      </select>
                    </div>
                  </div>

                  {/* License Key */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      License Key
                    </label>
                    <input
                      type="text"
                      name="licenseKey"
                      value={formData.licenseKey}
                      onChange={handleInputChange}
                      placeholder="Enter License Key"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Address Key */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Address Key
                    </label>
                    <input
                      type="text"
                      name="addressKey"
                      value={formData.addressKey}
                      onChange={handleInputChange}
                      placeholder="Enter Address Key"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Internationalization & Unit Configuration */}
            <Card isDark={isDark}>
              <div className="mb-6">
                <div className="flex justify-center flex-col items-center gap-2 mb-6 border-b border-border p-2">
                  <Globe className="w-5 h-5" style={{ color: selectedColor }} />
                  <h2
                    className={`text-lg font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    Internationalization & Unit Configuration
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Date Format */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Date Format
                    </label>
                    <select
                      name="dateFormat"
                      value={formData.dateFormat}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  {/* Time Format */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Time Format
                    </label>
                    <select
                      name="timeFormat"
                      value={formData.timeFormat}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="12H">12 Hour (AM/PM)</option>
                      <option value="24H">24 Hour</option>
                    </select>
                  </div>

                  {/* Distance Unit */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Distance Unit
                    </label>
                    <select
                      name="distanceUnit"
                      value={formData.distanceUnit}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="KM">Kilometers</option>
                      <option value="MILE">Miles</option>
                    </select>
                  </div>

                  {/* Speed Unit */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Speed Unit
                    </label>
                    <select
                      name="speedUnit"
                      value={formData.speedUnit}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="KMH">Km/h</option>
                      <option value="MPH">Mph</option>
                    </select>
                  </div>

                  {/* Fuel Unit */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Fuel Unit
                    </label>
                    <select
                      name="fuelUnit"
                      value={formData.fuelUnit}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="LITRE">Litre</option>
                      <option value="GALLON">Gallon</option>
                    </select>
                  </div>

                  {/* Temperature */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Temperature
                    </label>
                    <select
                      name="temperatureUnit"
                      value={formData.temperatureUnit}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="CELSIUS">Celsius</option>
                      <option value="FAHRENHEIT">Fahrenheit</option>
                    </select>
                  </div>

                  {/* Address Display */}
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Address Display
                    </label>
                    <select
                      name="addressDisplay"
                      value={formData.addressDisplay}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="SHOW">Show Address</option>
                      <option value="HIDE">Hide Address</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Language Configuration */}
            <Card isDark={isDark}>
              <div>
                <div className="flex justify-center flex-col items-center gap-2 mb-6 border-b border-border p-2">
                  <Languages
                    className="w-5 h-5"
                    style={{ color: selectedColor }}
                  />
                  <h2
                    className={`text-lg font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    Language Configuration
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end gap-10">
                    <div className="w-[48%]">
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Default Language
                      </label>
                      <select
                        name="defaultLanguage"
                        value={formData.defaultLanguage}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                          isDark
                            ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                        } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLanguage}
                      className={`w-[48%] border border-dotted border-border rounded-lg flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                        isDark
                          ? "text-gray-300 hover:text-foreground"
                          : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Add More Languages
                    </button>
                  </div>

                  {/* Additional Languages */}
                  {additionalLanguages.map((lang, index) => (
                    <div key={index} className="flex items-end gap-4">
                      <div className="flex-1">
                        <label
                          className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          Additional Language {index + 1}
                        </label>
                        <select
                          value={lang}
                          onChange={(e) =>
                            handleLanguageChange(index, e.target.value)
                          }
                          className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                            isDark
                              ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                              : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                          } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                        >
                          <option value="">Select Language</option>
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(index)}
                        className={`px-3 py-2.5 rounded-lg border transition-colors ${
                          isDark
                            ? "border-red-800 text-red-400 hover:bg-red-900/20"
                            : "border-red-300 text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: selectedColor }}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update Configuration"
                    : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default NewConfiguration;
