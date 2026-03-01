"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Smartphone, Building2, Layers } from "lucide-react";
import { Card } from "@/components/CommonCard";
import { SimAccount } from "@/interfaces/sim.interface";
import {
  getAllAccounts,
  getDeviceTypeDropdown,
  getOemManufacturersDropdown,
} from "@/services/commonServie";
import { getDeviceById, saveDevice, updateDevice } from "@/services/deviceService";

interface DeviceFormData {
  accountId: number;
  manufacturerId: number;
  deviceTypeId: number;
  deviceNo: string;
  deviceImeiOrSerial: string;
  createdBy: number;
  updatedBy: number;
  deviceStatus: string;
  isActive: boolean;
}

interface SelectOption {
  id: number;
  value: string;
}

interface DeviceTypeOption {
  id: number;
  displayName: string;
}

const ProvisionDevice: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isEditMode = id && id !== "0";

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [accounts, setAccounts] = useState<SimAccount[]>([]);
  const [manufacturers, setManufacturers] = useState<SelectOption[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceTypeOption[]>([]);
  const [formData, setFormData] = useState<DeviceFormData>({
    accountId: 0,
    manufacturerId: 0,
    deviceTypeId: 0,
    deviceNo: "",
    deviceImeiOrSerial: "",
    createdBy: 0,
    updatedBy: 0,
    deviceStatus: "ACTIVE",
    isActive: true,
  });

  const inputClass = (extra = "") =>
    `w-full px-3 py-2.5 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
      isDark
        ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
    } ${extra}`;

  const labelClass = `block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
    isDark ? "text-gray-400" : "text-gray-500"
  }`;

  const getStorageUser = () => {
    if (typeof window === "undefined") return { accountId: 0, userId: 0 };

    try {
      const selectedAccountId = Number(localStorage.getItem("accountId") || 0);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return {
        accountId: selectedAccountId || Number(user?.accountId || 0),
        userId: Number(user?.userId || 0),
      };
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return { accountId: 0, userId: 0 };
    }
  };

  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      try {
        const { accountId, userId } = getStorageUser();
        const [accRes, deviceTypeRes, manufacturerRes] = await Promise.all([
          getAllAccounts(),
          getDeviceTypeDropdown(),
          getOemManufacturersDropdown(),
        ]);

        if (accRes?.statusCode === 200 && Array.isArray(accRes?.data)) {
          setAccounts(accRes.data);
        }

        if (deviceTypeRes?.statusCode === 200 && Array.isArray(deviceTypeRes?.data)) {
          setDeviceTypes(
            deviceTypeRes.data.map((item: any) => ({
              id: Number(item?.id || 0),
              displayName: item?.displayName || item?.value || "",
            })),
          );
        }

        if (manufacturerRes?.statusCode === 200 && Array.isArray(manufacturerRes?.data)) {
          setManufacturers(manufacturerRes.data);
        }

        if (!isEditMode) {
          setFormData((prev) => ({
            ...prev,
            accountId: prev.accountId || accountId,
            createdBy: prev.createdBy || userId,
            updatedBy: prev.updatedBy || userId,
          }));
        }

        if (isEditMode) {
          const response = await getDeviceById(id);
          if (response?.statusCode === 200 && response?.data) {
            const device = response.data;
            setFormData({
              accountId: Number(device?.accountId || accountId || 0),
              manufacturerId: Number(device?.manufacturerId || 0),
              deviceTypeId: Number(device?.deviceTypeId || 0),
              deviceNo: device?.deviceNo || "",
              deviceImeiOrSerial: device?.deviceImeiOrSerial || "",
              createdBy: Number(device?.createdBy || userId || 0),
              updatedBy: Number(device?.updatedBy || userId || 0),
              deviceStatus: device?.deviceStatus || "ACTIVE",
              isActive:
                typeof device?.isActive === "boolean" ? device.isActive : true,
            });
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load device data");
      } finally {
        setPageLoading(false);
      }
    };

    init();
  }, [id, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const numberFields = ["accountId", "manufacturerId", "deviceTypeId"];

    setFormData((prev) => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.accountId) {
      toast.error("Please select an account");
      return;
    }
    if (!formData.manufacturerId) {
      toast.error("Please select a manufacturer");
      return;
    }
    if (!formData.deviceTypeId) {
      toast.error("Please select a device type");
      return;
    }
    if (!formData.deviceImeiOrSerial.trim()) {
      toast.error("IMEI / Serial number is required");
      return;
    }

    try {
      setLoading(true);
      const { accountId, userId } = getStorageUser();
      const payload = {
        ...(isEditMode && { id: Number(id) }),
        manufacturerId: Number(formData.manufacturerId),
        deviceTypeId: Number(formData.deviceTypeId),
        deviceNo: formData.deviceNo.trim(),
        deviceImeiOrSerial: formData.deviceImeiOrSerial.trim(),
        ...(isEditMode
          ? {
              deviceStatus: formData.deviceStatus || "ACTIVE",
              isActive: formData.isActive,
              updatedBy: Number(accountId || userId || formData.updatedBy || 0),
            }
          : {
              accountId: Number(formData.accountId),
              createdBy: Number(formData.accountId || accountId || userId || formData.createdBy || 0),
            }),
      };

      const response = isEditMode
        ? await updateDevice(id, payload)
        : await saveDevice(payload);

      if (response?.statusCode === 200) {
        toast.success(response?.message || "Device saved successfully");
        setTimeout(() => router.push("/devices"), 800);
      } else {
        toast.error(response?.message || "Operation failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
            />
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {isEditMode ? "Loading device data..." : "Preparing form..."}
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
                className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
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

        <Card isDark={isDark}>
          <div className="p-4 sm:p-6 space-y-8">
            <div>
              <SectionHeader
                icon={Building2}
                title="Account Context"
                subtitle="Select the account this device belongs to."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Account <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    className={inputClass()}
                    disabled={isEditMode}
                  >
                    <option value={0}>Select Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader
                icon={Layers}
                title="Identity & Lifecycle"
                subtitle="Hardware identification and classification details."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Manufacturer <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="manufacturerId"
                    value={formData.manufacturerId}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value={0}>Select Manufacturer</option>
                    {manufacturers.map((manufacturer) => (
                      <option key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Device Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="deviceTypeId"
                    value={formData.deviceTypeId}
                    onChange={handleChange}
                    className={inputClass()}
                  >
                    <option value={0}>Select Device Type</option>
                    {deviceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Device No.</label>
                  <input
                    type="text"
                    name="deviceNo"
                    value={formData.deviceNo}
                    onChange={handleChange}
                    placeholder="e.g. DEV-001"
                    className={inputClass()}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    IMEI / Serial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="deviceImeiOrSerial"
                    value={formData.deviceImeiOrSerial}
                    onChange={handleChange}
                    placeholder="Hardware Identity Code"
                    className={inputClass("uppercase")}
                    style={{ letterSpacing: "0.05em" }}
                  />
                </div>
              </div>
            </div>

            {formData.deviceImeiOrSerial && (
              <div>
                <SectionHeader
                  icon={Smartphone}
                  title="Device Identity Preview"
                  subtitle="Auto-generated from the fields above."
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Device Type",
                      value:
                        deviceTypes.find(
                          (item) => item.id === Number(formData.deviceTypeId),
                        )?.displayName || "—",
                    },
                    {
                      label: "Manufacturer",
                      value:
                        manufacturers.find(
                          (item) => item.id === Number(formData.manufacturerId),
                        )?.value || "—",
                    },
                    { label: "Device No.", value: formData.deviceNo || "—" },
                    { label: "IMEI / Serial", value: formData.deviceImeiOrSerial },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className={`p-3 rounded-xl border ${
                        isDark
                          ? "border-gray-700 bg-gray-800/50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {label}
                      </p>
                      <p
                        className={`text-sm font-semibold truncate ${
                          isDark ? "text-foreground" : "text-gray-800"
                        }`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProvisionDevice;
