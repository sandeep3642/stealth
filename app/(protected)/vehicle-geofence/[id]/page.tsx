"use client";

import React, { useEffect, useState } from "react";
import { Link2, MapPin } from "lucide-react";
import { useColor } from "@/context/ColorContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/services/apiService";
import { getAllAccounts, getVehicleDropdown } from "@/services/commonServie";
import {
  getVehicleGeofenceById,
  saveVehicleGeofence,
  updateVehicleGeofence,
} from "@/services/vehicleGeofenceService";

interface DropdownOption {
  id: number;
  value: string;
}

interface VehicleGeofenceFormData {
  accountId: number;
  vehicleId: number;
  geofenceId: number;
  remarks: string;
  isActive: boolean;
}

const AddEditVehicleGeofence: React.FC = () => {
  const { selectedColor } = useColor();
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useParams();

  const assignmentId = params?.id ? Number(params.id) : 0;
  const isEditMode = assignmentId > 0;

  const [accounts, setAccounts] = useState<DropdownOption[]>([]);
  const [vehicles, setVehicles] = useState<DropdownOption[]>([]);
  const [geofences, setGeofences] = useState<DropdownOption[]>([]);

  const [formData, setFormData] = useState<VehicleGeofenceFormData>({
    accountId: 0,
    vehicleId: 0,
    geofenceId: 0,
    remarks: "",
    isActive: true,
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
    if (typeof window === "undefined") return { accountId: 0, userId: 0 };

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

  const getGeofenceDropdown = async (accountId?: number) => {
    const res = await api.get("/api/common/dropdowns/geofences", {
      params: {
        accountId: Number(accountId || 0),
        limit: 0,
      },
    });
    return toOptions(res?.data);
  };

  const fetchDropdowns = async (accountId: number) => {
    try {
      const [accountsRes, vehiclesRes, geofencesRes] = await Promise.allSettled([
        getAllAccounts(),
        getVehicleDropdown(accountId),
        getGeofenceDropdown(accountId),
      ]);

      if (accountsRes.status === "fulfilled") {
        setAccounts(toOptions(accountsRes.value));
      }
      if (vehiclesRes.status === "fulfilled") {
        setVehicles(toOptions(vehiclesRes.value));
      }
      if (geofencesRes.status === "fulfilled") {
        setGeofences(geofencesRes.value);
      }
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
      toast.error("Failed to load dropdown data");
    }
  };

  const fetchById = async () => {
    try {
      setFetchingData(true);
      const response = await getVehicleGeofenceById(assignmentId);
      const data = response?.data || response;

      if (!data) {
        toast.error("Vehicle geofence assignment not found");
        router.push("/vehicle-geofence");
        return;
      }

      setFormData({
        accountId: Number(data.accountId || 0),
        vehicleId: Number(data.vehicleId || 0),
        geofenceId: Number(data.geofenceId || 0),
        remarks: String(data.remarks || ""),
        isActive: Boolean(data.isActive),
      });

      await fetchDropdowns(Number(data.accountId || 0));
    } catch (error) {
      console.error("Error fetching assignment by id:", error);
      toast.error("Failed to fetch assignment details");
      router.push("/vehicle-geofence");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    const { accountId } = getUserData();
    setFormData((prev) => ({
      ...prev,
      accountId: prev.accountId || accountId,
    }));

    if (!isEditMode) {
      fetchDropdowns(accountId);
    }
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchById();
    }
  }, [assignmentId]);

  useEffect(() => {
    if (!formData.accountId) {
      setVehicles([]);
      setGeofences([]);
      return;
    }

    Promise.allSettled([
      getVehicleDropdown(formData.accountId),
      getGeofenceDropdown(formData.accountId),
    ]).then(([vehicleRes, geofenceRes]) => {
      if (vehicleRes.status === "fulfilled") {
        setVehicles(toOptions(vehicleRes.value));
      }
      if (geofenceRes.status === "fulfilled") {
        setGeofences(geofenceRes.value);
      }
    });
  }, [formData.accountId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numberFields = ["accountId", "vehicleId", "geofenceId"];
    setFormData((prev) => ({
      ...prev,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.accountId) return toast.error("Please select account");
    if (!formData.vehicleId) return toast.error("Please select vehicle");
    if (!formData.geofenceId) return toast.error("Please select geofence");

    const { userId } = getUserData();

    try {
      setLoading(true);
      let response;

      if (isEditMode) {
        const payload = {
          vehicleId: Number(formData.vehicleId),
          geofenceId: Number(formData.geofenceId),
          remarks: String(formData.remarks || ""),
          isActive: Boolean(formData.isActive),
          updatedBy: Number(userId || 0),
        };
        response = await updateVehicleGeofence(assignmentId, payload);
      } else {
        const payload = {
          accountId: Number(formData.accountId),
          vehicleId: Number(formData.vehicleId),
          geofenceId: Number(formData.geofenceId),
          remarks: String(formData.remarks || ""),
          createdBy: Number(userId || 0),
        };
        response = await saveVehicleGeofence(payload);
      }

      if (response?.success || response?.statusCode === 200) {
        toast.success(
          response?.message ||
            (isEditMode
              ? "Assignment updated successfully!"
              : "Assignment created successfully!"),
        );
        router.push("/vehicle-geofence");
      } else {
        toast.error(response?.message || "Save failed");
      }
    } catch (error) {
      console.error("Error saving vehicle geofence:", error);
      toast.error("An error occurred while saving assignment");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className={`${isDark ? "dark" : ""}`}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <div className="min-h-screen bg-background flex justify-center p-2">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6 px-4 sm:px-0">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isEditMode ? "Edit Vehicle Geofence" : "Assign Vehicle Geofence"}
            </h1>
          </div>

          <div
            className="bg-card rounded-2xl shadow-lg border-t-4 border-border overflow-hidden"
            style={{ borderTopColor: selectedColor }}
          >
            <div className="p-8 bg-white">
              <div className="flex items-start gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${selectedColor}20` }}
                >
                  <Link2 className="w-5 h-5" style={{ color: selectedColor }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Assignment Parameters
                  </h2>
                  <p className="text-sm text-foreground opacity-60">
                    {isEditMode
                      ? "Update mapped geofence details for this vehicle."
                      : "Create a new vehicle-geofence assignment."}
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
                    disabled={isEditMode || loading}
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
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    disabled={loading}
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
                    Geofence <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="geofenceId"
                    value={formData.geofenceId}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground"
                        : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  >
                    <option value={0}>Select Geofence</option>
                    {geofences.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

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
                  disabled={loading}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-colors resize-none ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                />
              </div>

              {isEditMode && (
                <div className="bg-background rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-1">
                        Assignment Status
                      </h3>
                      <p className="text-sm text-foreground opacity-60">
                        Inactive assignment will be excluded from active mapping.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin
                        className={`w-4 h-4 ${formData.isActive ? "text-green-500" : "text-gray-400"}`}
                      />
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: !prev.isActive,
                          }))
                        }
                        disabled={loading}
                        className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                        style={{
                          backgroundColor: formData.isActive
                            ? selectedColor
                            : "#cbd5e1",
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
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => router.push("/vehicle-geofence")}
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
                  {loading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Assignment"
                      : "Create Assignment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditVehicleGeofence;
