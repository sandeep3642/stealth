"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { Building2, User, Shield } from "lucide-react";
import { Category, FormData } from "@/interfaces/account.interface";
import { useColor } from "@/context/ColorContext";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { useRouter } from "next/navigation";
import { getCategoreis, saveAccount } from "@/services/accountService";
import { toast } from "react-toastify";

type TabType = "profile" | "access" | "security";

const CreateUser: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [formData, setFormData] = useState<FormData>({
    accountName: "",
    accountCode: "",
    categoryId: 0,
    primaryDomain: "",
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    location: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        accountName: formData.accountName,
        accountCode: formData.accountCode,
        categoryId: formData.categoryId,
        primaryDomain: formData.primaryDomain,
        countryId: 1,
        parentAccountId: 0,
        userId: 1,
        hierarchyPath: formData.location || "N/A",
        taxTypeId: 1,
        status: true,
        fullname: formData.fullName,
        email: formData.emailAddress,
        phone: formData.phoneNumber,
        address: formData.location,
      };

      const response = await saveAccount(payload);

      if (response && response.statusCode === 200) {
        toast.success(response.message || "Account created successfully!");
        router.push("/accounts");
      } else if (response && response.statusCode === 409) {
        toast.error(response.message || "Account code already exists!");
      } else {
        toast.error(response.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error while saving category:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  async function fetchCategories() {
    const response = await getCategoreis();
    console.log("response", response);
    if (response && response.statusCode === 200) {
      toast.success(response.message);
      setCategories(response.data);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const tabs = [
    { id: "profile" as TabType, label: "Profile" },
    { id: "access" as TabType, label: "Access" },
    { id: "security" as TabType, label: "Security" },
  ];

  return (
    <div className={`${isDark ? "dark" : ""} mt-16 sm:mt-20`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-3 sm:p-4 md:p-6`}
      >
        {/* Header */}
        <div className="mx-auto mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:gap-4">
            <div>
              <h1
                className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 ${isDark ? "text-foreground" : "text-gray-900"}`}
              >
                Create New User
              </h1>
              <p
                className={`text-xs sm:text-sm md:text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Manage user identity, access scope, and security settings.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                  isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button
                className="flex-1 sm:flex-none text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors cursor-pointer"
                style={{ background: selectedColor }}
                onClick={handleSubmit}
              >
                <span className="whitespace-nowrap">Create User</span>
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
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option>
                        Super Admin - Full access to all system resources.
                      </option>
                      <option>Admin - Manage users and accounts.</option>
                      <option>
                        User - Basic access to assigned resources.
                      </option>
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
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="">Select Account</option>
                      {categories.map((cat: Category) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.labelName}
                        </option>
                      ))}
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
                        Active
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div
                          className="w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{
                            backgroundColor: selectedColor,
                          }}
                        ></div>
                      </label>
                    </div>
                  </div>

                  {/* Multi-Factor Authentication */}
                  <div
                    className={`py-3 sm:py-4 border-b ${
                      isDark ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
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

                  {/* Password Reset */}
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
