"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Link2 } from "lucide-react";
import { useColor } from "@/context/ColorContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, useParams } from "next/navigation";
import {
  getDeviceMapById,
  saveDeviceMap,
  updateDeviceMap,
} from "@/services/devicemapService";
import {
  getDeviceDropdown,
  getAllAccounts,
  getDeviceTypeDropdown,
  getSimDropdownByAccount,
  getVehicleDropdown,
} from "@/services/commonServie";
import { toast } from "react-toastify";

interface DropdownOption {
  id: number;
  value: string;
}

interface DeviceMapFormData {
  id: number;
  accountId: number;
  fk_VehicleId: number;
  fk_devicetypeid: number;
  fk_DeviceId: number;
  fk_simid: number;
  simnno: string;
  remarks: string;
  isActive: number;
  isDeleted: number;
  installationDate: string;
  createdBy: number;
  createdAt: string;
  updatedBy: number;
  updatedAt: string;
}

interface CreateDeviceMapPayload {
  accountId: number;
  vehicleId: number;
  deviceId: number;
  deviceTypeId: number;
  simId: number;
  simNumber: string;
  remarks: string;
  createdBy: number;
}

interface UpdateDeviceMapPayload {
  vehicleId: number;
  deviceId: number;
  deviceTypeId: number;
  simId: number;
  simNumber: string;
  remarks: string;
  isActive: boolean;
  updatedBy: number;
}

const AddEditDeviceMap: React.FC = () => {
  const { selectedColor } = useColor();
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useParams();

  const deviceMapId = params?.id ? Number(params.id) : 0;
  const isEditMode = deviceMapId > 0;

  const [accounts, setAccounts] = useState<DropdownOption[]>([]);
  const [vehicles, setVehicles] = useState<DropdownOption[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DropdownOption[]>([]);
  const [hardware, setHardware] = useState<DropdownOption[]>([]);
  const [sims, setSims] = useState<DropdownOption[]>([]);

  const [formData, setFormData] = useState<DeviceMapFormData>({
    id: 0,
    accountId: 0,
    fk_VehicleId: 0,
    fk_devicetypeid: 0,
    fk_DeviceId: 0,
    fk_simid: 0,
    simnno: "",
    remarks: "",
    isActive: 1,
    isDeleted: 0,
    installationDate: new Date().toISOString(),
    createdBy: 0,
    createdAt: new Date().toISOString(),
    updatedBy: 0,
    updatedAt: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  const toOptions = (response: any): DropdownOption[] => {
    const data = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [];

    return data.map((item: any) => ({
      id: Number(item?.id ?? item?.value ?? 0),
      value: String(item?.value ?? item?.name ?? item?.label ?? item?.id ?? ""),
    }));
  };

  const getUserData = () => {
    if (typeof window === "undefined") {
      return { accountId: 0, userId: 0 };
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        accountId: Number(user?.accountId || 0),
        userId: Number(user?.id || user?.userId || 0),
      };
    } catch {
      return { accountId: 0, userId: 0 };
    }
  };

  const fetchDropdowns = async (accountId: number) => {
    try {
      const [accountsRes, vehiclesRes, typeRes, simRes, hwRes] =
        await Promise.allSettled([
        getAllAccounts(),
        getVehicleDropdown(accountId),
        getDeviceTypeDropdown(),
        getSimDropdownByAccount(accountId),
        getDeviceDropdown(accountId),
      ]);

      if (accountsRes.status === "fulfilled") {
        setAccounts(toOptions(accountsRes.value));
      }
      if (vehiclesRes.status === "fulfilled") {
        setVehicles(toOptions(vehiclesRes.value));
      }
      if (typeRes.status === "fulfilled") {
        setDeviceTypes(toOptions(typeRes.value));
      }
      if (simRes.status === "fulfilled") {
        setSims(toOptions(simRes.value));
      }
      if (hwRes.status === "fulfilled") {
        setHardware(toOptions(hwRes.value));
      }
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const fetchById = async () => {
    try {
      setFetchingData(true);
      const response = await getDeviceMapById(deviceMapId);
      const data = response?.data || response;

      if (!data) {
        toast.error("Device map details not found");
        router.push("/devicemap");
        return;
      }

      setFormData({
        id: Number(data.id || 0),
        accountId: Number(data.accountId || 0),
        fk_VehicleId: Number(data.fk_VehicleId ?? data.vehicleId ?? 0),
        fk_devicetypeid: Number(data.fk_devicetypeid ?? data.deviceTypeId ?? 0),
        fk_DeviceId: Number(data.fk_DeviceId ?? data.deviceId ?? 0),
        fk_simid: Number(data.fk_simid ?? data.simId ?? 0),
        simnno: String(data.simnno ?? data.simNumber ?? ""),
        remarks: String(data.remarks || ""),
        isActive:
          typeof data.isActive === "boolean"
            ? Number(data.isActive)
            : Number(data.isActive ?? 1),
        isDeleted:
          typeof data.isDeleted === "boolean"
            ? Number(data.isDeleted)
            : Number(data.isDeleted ?? 0),
        installationDate: String(
          data.installationDate || new Date().toISOString(),
        ),
        createdBy: Number(data.createdBy || 0),
        createdAt: String(data.createdAt || new Date().toISOString()),
        updatedBy: Number(data.updatedBy || 0),
        updatedAt: String(data.updatedAt || new Date().toISOString()),
      });

      await fetchDropdowns(Number(data.accountId || 0));
    } catch (error) {
      console.error("Error fetching device map by id:", error);
      toast.error("Failed to fetch device map details");
      router.push("/devicemap");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    const { accountId, userId } = getUserData();
    setFormData((prev) => ({
      ...prev,
      accountId: prev.accountId || accountId,
      createdBy: prev.createdBy || userId,
      updatedBy: userId,
    }));

    if (!isEditMode) {
      fetchDropdowns(accountId);
    }
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchById();
    }
  }, [deviceMapId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numberFields = [
      "accountId",
      "fk_VehicleId",
      "fk_devicetypeid",
      "fk_DeviceId",
      "fk_simid",
      "isActive",
      "isDeleted",
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));
  };

  useEffect(() => {
    if (!formData.accountId) {
      setVehicles([]);
      setHardware([]);
      setSims([]);
      return;
    }

    Promise.allSettled([
      getVehicleDropdown(formData.accountId),
      getDeviceDropdown(formData.accountId),
      getSimDropdownByAccount(formData.accountId),
    ]).then(([vehiclesRes, devicesRes, simsRes]) => {
      if (vehiclesRes.status === "fulfilled") {
        setVehicles(toOptions(vehiclesRes.value));
      }
      if (devicesRes.status === "fulfilled") {
        setHardware(toOptions(devicesRes.value));
      }
      if (simsRes.status === "fulfilled") {
        setSims(toOptions(simsRes.value));
      }
    });
  }, [formData.accountId]);

  useEffect(() => {
    if (!formData.accountId) return;
    getDeviceDropdown(formData.accountId)
      .then((res) => setHardware(toOptions(res)))
      .catch(() => {});
  }, [formData.fk_devicetypeid]);

  const handleSubmit = async () => {
    if (!formData.accountId) return toast.error("Please select account");
    if (!formData.fk_VehicleId) return toast.error("Please select vehicle");
    if (!formData.fk_devicetypeid)
      return toast.error("Please select device type");
    if (!formData.fk_DeviceId) return toast.error("Please select hardware");

    const { userId } = getUserData();
    const createPayload: CreateDeviceMapPayload = {
      accountId: Number(formData.accountId),
      vehicleId: Number(formData.fk_VehicleId),
      deviceId: Number(formData.fk_DeviceId),
      deviceTypeId: Number(formData.fk_devicetypeid),
      simId: Number(formData.fk_simid),
      simNumber: String(formData.simnno || ""),
      remarks: String(formData.remarks || ""),
      createdBy: Number(userId || 0),
    };

    const updatePayload: UpdateDeviceMapPayload = {
      vehicleId: Number(formData.fk_VehicleId),
      deviceId: Number(formData.fk_DeviceId),
      deviceTypeId: Number(formData.fk_devicetypeid),
      simId: Number(formData.fk_simid),
      simNumber: String(formData.simnno || ""),
      remarks: String(formData.remarks || ""),
      isActive: Boolean(formData.isActive),
      updatedBy: Number(userId || 0),
    };

    try {
      setLoading(true);
      let response;

      if (isEditMode) {
        response = await updateDeviceMap(deviceMapId, updatePayload);
      } else {
        response = await saveDeviceMap(createPayload);
      }

      if (response?.success || response?.statusCode === 200) {
        toast.success(
          response?.message ||
            (isEditMode
              ? "Device map updated successfully!"
              : "Device map created successfully!"),
        );
        router.push("/devicemap");
      } else {
        toast.error(response?.message || "Save failed");
      }
    } catch (error) {
      console.error("Error saving device map:", error);
      toast.error("An error occurred while saving device map");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (fetchingData) {
    return (
      <div className={`${isDark ? "dark" : ""} `}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground">Loading device map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} `}>
      <div className="min-h-screen bg-background flex justify-center p-2">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0  mb-6 px-4 sm:px-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isEditMode ? "Edit Device Map" : "Assign Device"}
            </h1>
          </div>

          {/* Form Card */}
          <div
            className="bg-card rounded-2xl shadow-lg border-t-4 border-border overflow-hidden"
            style={{ borderTopColor: selectedColor }}
          >
            <div className="p-8 bg-white">
              {/* Section Header */}
              <div className="flex items-start gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${selectedColor}20` }}
                >
                  <Link2
                    className="w-5 h-5"
                    style={{ color: selectedColor }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Device Assignment Parameters
                  </h2>
                  <p className="text-sm text-foreground opacity-60">
                    {isEditMode
                      ? "Update mapped device details for this vehicle."
                      : "Create a new vehicle-device mapping."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Account <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  >
                    <option value={0}>Select Account</option>
                    {accounts.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fk_VehicleId"
                    value={formData.fk_VehicleId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  >
                    <option value={0}>Select Vehicle</option>
                    {vehicles.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Device Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fk_devicetypeid"
                    value={formData.fk_devicetypeid}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  >
                    <option value={0}>Select Device Type</option>
                    {deviceTypes.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Hardware <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fk_DeviceId"
                    value={formData.fk_DeviceId}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  >
                    <option value={0}>Select Hardware</option>
                    {hardware.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    SIM <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fk_simid"
                    value={formData.fk_simid}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  >
                    <option value={0}>Select SIM</option>
                    {sims.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    SIM Number
                  </label>
                  <input
                    type="text"
                    name="simnno"
                    placeholder="Enter SIM Number"
                    value={formData.simnno}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                    onBlur={(e) => (e.target.style.borderColor = "")}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Installation Date
                </label>
                <input
                  type="datetime-local"
                  name="installationDate"
                  value={
                    formData.installationDate
                      ? new Date(formData.installationDate)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      installationDate: new Date(e.target.value).toISOString(),
                    }))
                  }
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                  onBlur={(e) => (e.target.style.borderColor = "")}
                  disabled={loading}
                />
              </div>

              {/* Description Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  placeholder="Add optional notes..."
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors resize-none ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  onFocus={(e) => (e.target.style.borderColor = selectedColor)}
                  onBlur={(e) => (e.target.style.borderColor = "")}
                  disabled={loading}
                />
              </div>

              {/* Category Status Toggle */}
              <div className="bg-background rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">
                      Mapping Status
                    </h3>
                    <p className="text-sm text-foreground opacity-60">
                      Inactive mappings are excluded from active assignments.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Cpu
                      className={`w-4 h-4 ${formData.isActive ? "text-green-500" : "text-gray-400"}`}
                    />
                    <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: prev.isActive ? 0 : 1,
                      }))
                    }
                    disabled={loading}
                    className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                    style={{
                      backgroundColor: formData.isActive ? selectedColor : "#cbd5e1",
                    }}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
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
                    <>{isEditMode ? "Update Mapping" : "Create Mapping"}</>
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

export default AddEditDeviceMap;
