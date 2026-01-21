"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { Building2, User, Shield } from "lucide-react";
import { Category, FormData } from "@/interfaces/account.interface";
import { useColor } from "@/context/ColorContext";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { useRouter } from "next/navigation";
import { getCategoreis, saveCategory } from "@/services/accountService";
import { toast } from "react-toastify";

const AddAccount: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();
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
      fullName: formData.fullName,
      emailAddress: formData.emailAddress,
      phoneNumber: formData.phoneNumber,
      location: formData.location,
    };

    const response = await saveCategory(payload);
    console.log("response", response);
    if (response && response.statusCode === 200) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
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

  return (
    <div className={`${isDark ? "dark" : ""} mt-20`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        {/* Header */}
        <div className="mx-auto mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1
                className={`text-2xl sm:text-4xl font-bold mb-2 ${isDark ? "text-foreground" : "text-gray-900"}`}
              >
                Create New Account
              </h1>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                Provision organizational identity and master credentials.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
                onClick={() => router.back()}
              >
                Cancel
              </button>
              <button
                className="flex-1 sm:flex-none text-white px-4 sm:px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer"
                style={{ background: selectedColor }}
                onClick={handleSubmit}
              >
                <Building2 className="w-5 h-5" />
                <span className="hidden xs:inline">Provision Account</span>
                <span className="xs:hidden">Provision</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className=" mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity & Scope Section */}
            <Card isDark={isDark}>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Building2
                    className={`w-5 h-5 `}
                    style={{ color: selectedColor }}
                  />
                  <h2
                    className={`text-xl font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    Identity & Scope
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Name */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Account Name
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      placeholder="e.g. Alpha Global"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Account Code */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Account Code
                    </label>
                    <input
                      type="text"
                      name="accountCode"
                      value={formData.accountCode}
                      onChange={handleInputChange}
                      placeholder="e.g. ACC-101"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Category
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat: Category) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.labelName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Domain */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Primary Domain
                    </label>
                    <input
                      type="text"
                      name="primaryDomain"
                      value={formData.primaryDomain}
                      onChange={handleInputChange}
                      placeholder="alpha.stealth.io"
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

            {/* Administrative Contact Section */}
            <Card isDark={isDark}>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User
                    className={`w-5 h-5`}
                    style={{ color: selectedColor }}
                  />
                  <h2
                    className={`text-xl font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    Administrative Contact
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Smith"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      placeholder="admin@alpha.com"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1 555-0101"
                      className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500 focus:border-purple-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
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
          </div>

          {/* Right Column - Provisioning Blueprint */}
          <div className="lg:col-span-1">
            <div
              style={{ borderColor: selectedColor }}
              className={`${
                isDark ? "bg-card border-gray-800" : "bg-white border-gray-200"
              } rounded-xl shadow-lg border-t-4 overflow-hidden`}
            >
              <div className="p-6">
                <h3
                  className={`text-lg font-bold mb-1 ${isDark ? "text-foreground" : "text-gray-900"}`}
                >
                  PROVISIONING BLUEPRINT
                </h3>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Live summary of the new instance.
                </p>
              </div>

              <div className="px-6 pb-6 space-y-4">
                {/* Account */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    ACCOUNT:
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: selectedColor }}
                  >
                    PENDING
                  </span>
                </div>

                {/* Code */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    CODE:
                  </span>
                  <span
                    className={`text-sm font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    AUTO_GEN
                  </span>
                </div>

                {/* Category */}
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    CATEGORY:
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      isDark ? "text-foreground" : "text-gray-900"
                    }`}
                  >
                    {categories
                      .find(
                        (cat: Category) =>
                          cat.categoryId === Number(formData.categoryId),
                      )
                      ?.labelName?.toUpperCase() || "N/A"}
                  </span>
                </div>

                {/* Master User Section */}
                <div
                  className={`mt-20 p-4 rounded-lg ${
                    isDark ? "bg-purple-900/20" : "bg-purple-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Shield
                      style={{ color: selectedColor }}
                      className={`w-5 h-5 mt-0.5 `}
                    />
                    <div>
                      <p
                        className={`text-xs font-bold mb-1`}
                        style={{ color: selectedColor }}
                      >
                        MASTER USER
                      </p>
                      <p
                        className={`text-sm font-medium ${isDark ? "text-foreground" : "text-gray-900"}`}
                      >
                        Waiting for input...
                      </p>
                    </div>
                  </div>
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

export default AddAccount;
