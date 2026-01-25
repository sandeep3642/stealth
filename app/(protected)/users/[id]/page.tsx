"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { Building2, User, Shield } from "lucide-react";
import { FormData } from "@/interfaces/user.interface";
import { useColor } from "@/context/ColorContext";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { useParams, useRouter } from "next/navigation";
import {
  getUsers,
  createUser,
  updateUser,
  getUserById,
} from "@/services/userService";
import { toast } from "react-toastify";
import { getAllAccounts, getAllRoles } from "@/services/commonServie";

type TabType = "profile" | "access" | "security";

const CreateUser: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    accountName: "",
    accountCode: "",
    accountId: 0,
    roleId: 0,
    primaryDomain: "",
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    location: "",
  });

  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userStatus, setUserStatus] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);
      const response = await getUserById(userId);

      if (response && response.statusCode === 200) {
        const userData = response.data;
        setFormData({
          accountName: userData.firstName || "",
          accountCode: userData.lastName || "",
          accountId: userData.accountId || 0,
          roleId: userData.roleId || 0,
          primaryDomain: "",
          fullName: "",
          emailAddress: userData.email || "",
          phoneNumber: userData.mobileNo || "",
          location: "",
        });
        setUserStatus(userData.status ?? true);
        setTwoFactorEnabled(userData.twoFactorEnabled ?? false);
        setIsEditMode(true);
      } else {
        toast.error(response?.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.accountName ||
      !formData.accountCode ||
      !formData.emailAddress
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode && id) {
        // Update existing user
        const payload = {
          userId: id,
          email: formData.emailAddress,
          firstName: formData.accountName,
          lastName: formData.accountCode,
          mobileNo: formData.phoneNumber,
          accountId: Number(formData.accountId),
          roleId: Number(formData.roleId),
          status: userStatus,
          twoFactorEnabled: twoFactorEnabled,
        };

        const response = await updateUser(id, payload);
        if (response.statusCode === 200) {
          toast.success(response.message || "User updated successfully!");
          router.push("/users");
        } else {
          toast.error(response.message || "Failed to update user");
        }
      } else {
        // Create new user
        const payload = {
          email: formData.emailAddress,
          password: "string", // TODO: replace this with actual password input if you have one
          firstName: formData.accountName,
          lastName: formData.accountCode,
          accountId: Number(formData.accountId),
          roleId: Number(formData.roleId),
          twoFactorEnabled: twoFactorEnabled,
          status: userStatus,
        };

        const response = await createUser(payload);
        if (response.statusCode === 200) {
          toast.success(response.message || "User created successfully!");
          router.push("/users");
        } else {
          toast.error(response.message || "Failed to create user");
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(
        isEditMode ? "Failed to update user" : "Failed to create user",
      );
    } finally {
      setLoading(false);
    }
  };

  async function fetchAllAcounts() {
    const response = await getAllAccounts();
    if (response && response.statusCode === 200) {
      setAccounts(response.data);
    }
  }

  async function fetchAllRoles() {
    const response = await getAllRoles();
    if (response && response.statusCode === 200) {
      setRoles(response.data);
    }
  }

  useEffect(() => {
    fetchAllAcounts();
    fetchAllRoles();

    // If id exists in params, fetch user data
    if (id) {
      fetchUserData(id as string);
    }
  }, [id]);

  const tabs = [
    { id: "profile" as TabType, label: "Profile" },
    { id: "access" as TabType, label: "Access" },
    { id: "security" as TabType, label: "Security" },
  ];

  if (loading && isEditMode) {
    return (
      <div className={`${isDark ? "dark" : ""} mt-16 sm:mt-20`}>
        <div
          className={`min-h-screen ${isDark ? "bg-background" : ""} p-3 sm:p-4 md:p-6 flex items-center justify-center`}
        >
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: selectedColor }}
            ></div>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              Loading user data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} mt-16 sm:mt-20`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-3 sm:p-4 md:p-6`}
      >
        {/* Header */}
        <div className="mx-auto mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1
                className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 ${isDark ? "text-foreground" : "text-gray-900"}`}
              >
                {isEditMode ? "Update User" : "Create New User"}
              </h1>
              <p
                className={`text-xs sm:text-sm md:text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Manage user identity, access scope, and security settings.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 sm:flex-shrink-0">
              <button
                className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                  isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="flex-1 sm:flex-none text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: selectedColor }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="whitespace-nowrap">
                      {isEditMode ? "Updating..." : "Creating..."}
                    </span>
                  </>
                ) : (
                  <span className="whitespace-nowrap">
                    {isEditMode ? "Update User" : "Create User"}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="mx-auto mb-4 sm:mb-6 overflow-x-auto scrollbar-hide">
          <div
            className={`inline-flex rounded-lg p-1 min-w-max ${
              isDark ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? isDark
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-900 shadow-sm"
                    : isDark
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card isDark={isDark}>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Building2
                    className={`w-4 h-4 sm:w-5 sm:h-5`}
                    style={{ color: selectedColor }}
                  />
                  <h2
                    className={`text-lg sm:text-xl font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    Personal Information
                  </h2>
                </div>
                <p
                  className={`text-xs sm:text-sm mb-4 sm:mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Basic identity details used for login and display.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* First Name */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      placeholder="Jane"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="accountCode"
                      value={formData.accountCode}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      placeholder="jane@company.com"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Access & Roles Tab */}
          {activeTab === "access" && (
            <Card isDark={isDark}>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <User
                    className={`w-4 h-4 sm:w-5 sm:h-5`}
                    style={{ color: selectedColor }}
                  />
                  <h2
                    className={`text-lg sm:text-xl font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    Role & Scope
                  </h2>
                </div>
                <p
                  className={`text-xs sm:text-sm mb-4 sm:mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Define what this user can do and which data they can see.
                </p>

                <div className="space-y-4 sm:space-y-6">
                  {/* System Role */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      System Role
                    </label>
                    <select
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="">Select Role</option>
                      {roles?.map((role: { id: number; value: string }) => (
                        <option key={role.id} value={role.id}>
                          {role.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Account Association */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Account Association
                    </label>
                    <select
                      name="accountId"
                      value={formData.accountId}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="">Select Account</option>
                      {accounts.map(
                        (account: { id: number; value: string }) => (
                          <option key={account.id} value={account.id}>
                            {account.value}
                          </option>
                        ),
                      )}
                    </select>
                    <p
                      className={`text-xs sm:text-sm mt-1.5 sm:mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                    >
                      The user will primarily belong to this account.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card isDark={isDark}>
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Shield
                    className={`w-4 h-4 sm:w-5 sm:h-5`}
                    style={{ color: selectedColor }}
                  />
                  <h2
                    className={`text-lg sm:text-xl font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    Security Settings
                  </h2>
                </div>
                <p
                  className={`text-xs sm:text-sm mb-4 sm:mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Manage authentication security and account status.
                </p>

                <div className="space-y-4 sm:space-y-6">
                  {/* Account Status */}
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-4 border-b ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex-1">
                      <h3
                        className={`text-sm sm:text-base font-medium mb-1 ${isDark ? "text-foreground" : "text-gray-900"}`}
                      >
                        Account Status
                      </h3>
                      <p
                        className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Disable user access without deleting data.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${selectedColor}20`,
                          color: selectedColor,
                        }}
                      >
                        {userStatus ? "Active" : "Inactive"}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={userStatus}
                          onChange={(e) => setUserStatus(e.target.checked)}
                        />
                        <div
                          className="w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{
                            backgroundColor: userStatus
                              ? selectedColor
                              : isDark
                                ? "#374151"
                                : "#D1D5DB",
                          }}
                        ></div>
                      </label>
                    </div>
                  </div>

                  {/* Multi-Factor Authentication */}
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-4 border-b ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <div className="flex-1">
                      <h3
                        className={`text-sm sm:text-base font-medium mb-1 ${isDark ? "text-foreground" : "text-gray-900"}`}
                      >
                        Multi-Factor Authentication
                      </h3>
                      <p
                        className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Require 2FA for login.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={twoFactorEnabled}
                        onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      />
                      <div
                        className="w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{
                          backgroundColor: twoFactorEnabled
                            ? selectedColor
                            : isDark
                              ? "#374151"
                              : "#D1D5DB",
                        }}
                      ></div>
                    </label>
                  </div>

                  {/* Password Reset */}
                  {isEditMode && (
                    <div className="py-3 sm:py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <h3
                            className={`text-sm sm:text-base font-medium mb-1 ${isDark ? "text-foreground" : "text-gray-900"}`}
                          >
                            Password Reset
                          </h3>
                          <p
                            className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                          >
                            Send a password reset email to the user.
                          </p>
                        </div>
                        <button
                          className={`w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                            isDark
                              ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                          }`}
                        >
                          Send Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default CreateUser;
