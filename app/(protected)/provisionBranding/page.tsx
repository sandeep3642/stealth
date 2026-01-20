"use client";

import React, { useState } from "react";
import { Globe, Palette, Upload, ExternalLink } from "lucide-react";
import { useColor } from "@/context/ColorContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { HexColorPicker, RgbColorPicker } from "react-colorful";

const ProvisionBranding: React.FC = () => {
  const { selectedColor } = useColor();
  const { isDark } = useTheme();
  const router = useRouter();

  const [formData, setFormData] = useState({
    targetAccount: "",
    customFqdn: "",
    primaryColor: "#4F46E5",
  });

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [rgb, setRgb] = useState({ r: 79, g: 70, b: 229 });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => router.back();

  const handleActivate = () => {
    console.log("Activating whitelabel:", formData);
  };

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, primaryColor: color }));
    const bigint = parseInt(color.slice(1), 16);
    setRgb({
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    });
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-background flex items-start justify-center p-6">
        <div className="w-full max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-foreground">
              Provision Branding
            </h1>
            <button
              onClick={handleCancel}
              className="text-foreground hover:text-foreground/70 font-medium transition-colors"
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
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Target Account
                    </label>
                    <select
                      name="targetAccount"
                      value={formData.targetAccount}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="">Select Account</option>
                      <option value="alpha">Alpha Logistics</option>
                      <option value="beta">Beta Fleet</option>
                      <option value="gamma">Gamma Transport</option>
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
                        name="customFqdn"
                        value={formData.customFqdn}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand Mark */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 uppercase tracking-wide">
                      Brand Mark
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                        isDark
                          ? "border-gray-700 bg-gray-800/50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-3 text-foreground opacity-40" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        Click to upload SVG/PNG
                      </p>
                      <p className="text-xs text-foreground opacity-50">
                        MAX 500KB
                      </p>
                    </div>
                  </div>

                  {/* Primary Palette */}
                  <div>
                    <label className="block text-sm font-semibold text-white  px-3 py-1.5 rounded-t-lg uppercase tracking-wide mb-0">
                      Primary Palette
                    </label>
                    <div className="bg-background rounded-xl border border-border p-3">
                      <div className="mb-4">
                        <div className="flex items-center gap-4 mb-4">
                          <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-16 h-16 rounded-lg border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                            style={{ backgroundColor: formData.primaryColor }}
                          />
                          <div>
                            <p className="text-xs font-bold text-foreground opacity-50 uppercase tracking-wide mb-1">
                              HEX REFERENCE
                            </p>
                            <input
                              type="text"
                              name="primaryColor"
                              value={formData.primaryColor}
                              onChange={handleInputChange}
                              className="text-base font-bold text-foreground bg-transparent border-none focus:outline-none w-32"
                            />
                          </div>
                        </div>

                        {showColorPicker && (
                          <div className="space-y-4">
                            <HexColorPicker
                              color={formData.primaryColor}
                              onChange={handleColorChange}
                            />

                            <div className="grid grid-cols-3 gap-3 mt-3">
                              {["r", "g", "b"].map((c) => (
                                <div key={c}>
                                  <input
                                    type="number"
                                    min="0"
                                    max="255"
                                    value={rgb[c as keyof typeof rgb]}
                                    onChange={(e) => {
                                      const newRgb = {
                                        ...rgb,
                                        [c]: Number(e.target.value),
                                      };
                                      setRgb(newRgb);
                                      const hex =
                                        "#" +
                                        (
                                          (1 << 24) +
                                          (newRgb.r << 16) +
                                          (newRgb.g << 8) +
                                          newRgb.b
                                        )
                                          .toString(16)
                                          .slice(1)
                                          .toUpperCase();
                                      setFormData((prev) => ({
                                        ...prev,
                                        primaryColor: hex,
                                      }));
                                    }}
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
                </div>
              </div>
            </div>

            {/* Right Column - Identity Blueprint */}
            <div className="lg:col-span-1">
              <div
                className="bg-card rounded-xl shadow-lg border border-border border-t-4 overflow-hidden"
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
                      className="text-sm font-bold"
                      style={{ color: selectedColor }}
                    >
                      stealth.io
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground opacity-70">
                      TARGET:
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-foreground">
                      PENDING
                    </span>
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  <button
                    className="w-full py-2 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: formData.primaryColor }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    LAUNCH PREVIEW
                  </button>
                  <button
                    onClick={handleActivate}
                    className="w-full py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: selectedColor }}
                  >
                    Activate Whitelabel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default ProvisionBranding;
