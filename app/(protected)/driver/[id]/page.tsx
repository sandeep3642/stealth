"use client";

import React, { useState, useEffect } from "react";
import { Layers, User } from "lucide-react";
import { useColor } from "@/context/ColorContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, useParams } from "next/navigation";
import ThemeCustomizer from "@/components/ThemeCustomizer";

import { toast } from "react-toastify";
import { getDriverById, saveDriver, updateDriver } from "@/services/driverService";

const AddEditDriver: React.FC = () => {
  const { selectedColor } = useColor();
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useParams();

  const driverId = params?.id ? Number(params.id) : 0;
  const isEditMode = driverId > 0;

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [licenceNo, setLicenceNo] = useState("");
  const [licenceExpiry, setLicenceExpiry] = useState("");
  const [organisationId, setOrganisationId] = useState<number | string>("");
  const [isActive, setIsActive] = useState(true);
  const [driverCode, setDriverCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchDriverData();
    }
  }, [driverId]);

  const fetchDriverData = async () => {
    try {
      setFetchingData(true);
      const response = await getDriverById(driverId);

      if (response.success && response.data) {
        const driver = Array.isArray(response.data) ? response.data[0] : response.data;

        setDriverCode(driver.driverCode || "");
        setFirstName(driver.firstName || "");
        setLastName(driver.lastName || "");
        setMobile(driver.mobile || "");
        setEmail(driver.email || "");
        setLicenceNo(driver.licenceNo || "");
        setLicenceExpiry(driver.licenceExpiry ? driver.licenceExpiry.split("T")[0] : "");
        setOrganisationId(driver.organisationId || "");
        setIsActive(driver.isActive ?? true);
      } else {
        toast.error("Failed to fetch driver data");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching driver:", error);
      toast.error("Error loading driver data");
      router.back();
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      toast.error("Please enter first name");
      return;
    }
    if (!mobile.trim()) {
      toast.error("Please enter mobile number");
      return;
    }
    if (!organisationId) {
      toast.error("Please select an organisation");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      licenceNo: licenceNo.trim(),
      licenceExpiry: licenceExpiry || null,
      organisationId: Number(organisationId),
      isActive,
    };

    try {
      setLoading(true);
      let response;

      if (isEditMode) {
        response = await updateDriver(payload, driverId);
      } else {
        response = await saveDriver(payload);
      }

      if (response.success) {
        toast.success(isEditMode ? "Driver updated successfully!" : "Driver created successfully!");
        router.push("/drivers");
      } else {
        toast.error(`Failed: ${response.message}`);
      }
    } catch (error) {
      console.error("Error saving driver:", error);
      toast.error("An error occurred while saving the driver");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const inputClass = `w-full px-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
    isDark
      ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
  }`;

  if (fetchingData) {
    return (
      <div className={`${isDark ? "dark" : ""}`}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground">Loading driver data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <div className="min-h-screen bg-background flex justify-center p-2">
        <div className="w-full max-w-4xl">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 px-4 sm:px-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isEditMode ? "Edit Driver" : "New Driver"}
            </h1>
          </div>

          {/* Form Card */}
          <div
            className="bg-card rounded-2xl shadow-lg border-t-4 border-border overflow-hidden"
            style={{ borderTopColor: selectedColor }}
          >
            <div className="p-8">

              {/* Section Header */}
              <div className="flex items-start gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${selectedColor}20` }}
                >
                  <User className="w-5 h-5" style={{ color: selectedColor }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Personnel Identity
                  </h2>
                  <p className="text-sm text-foreground opacity-60">
                    {isEditMode
                      ? "Update the driver's personal and contact information."
                      : "Fill in the driver's personal and contact information."}
                  </p>
                </div>
              </div>

              {/* Driver Code (edit mode only) */}
              {isEditMode && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Driver Code
                  </label>
                  <input
                    type="text"
                    value={driverCode}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                </div>
              )}

              {/* Organisation */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Organisation <span className="text-red-500">*</span>
                </label>
                <select
                  value={organisationId}
                  onChange={(e) => setOrganisationId(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                  onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                  onBlur={(e) => (e.target.style.borderColor = "")}
                >
                  <option value="">Select Account</option>
                  <option value="1">Alpha Logistics</option>
                  <option value="2">Beta Fleet</option>
                  <option value="3">Gamma Transport</option>
                </select>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vikram"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                    onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rathore"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                    onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                </div>
              </div>

              {/* Mobile & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Mobile (E.164) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+00 0000000000"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                    onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="driver@org.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                    onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                </div>
              </div>

              {/* Licence No & Licence Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Licence No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DL-90021-X"
                    value={licenceNo}
                    onChange={(e) => setLicenceNo(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                    onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Licence Expiry
                  </label>
                  <input
                    type="date"
                    value={licenceExpiry}
                    onChange={(e) => setLicenceExpiry(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                    onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                  />
                </div>
              </div>

              {/* Driver Status Toggle */}
              <div className="bg-background rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">
                      Driver Status
                    </h3>
                    <p className="text-sm text-foreground opacity-60">
                      Inactive drivers cannot be assigned to new trips.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    disabled={loading}
                    className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                    style={{ backgroundColor: isActive ? selectedColor : "#cbd5e1" }}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        isActive ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isDark
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: selectedColor }}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{isEditMode ? "Update Driver" : "Create Driver"}</>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditDriver;
