"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { Building2, User, Shield, Camera, Upload, X } from "lucide-react";
import { UserFormData } from "@/interfaces/user.interface";
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
  const [formData, setFormData] = useState<UserFormData>({
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

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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

  // Avatar upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPG, PNG, GIF, or WebP)");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setShowAvatarModal(false);
      toast.success("Avatar uploaded successfully!");
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setShowAvatarModal(false);
    toast.info("Avatar removed");
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
        
        // Set avatar if exists
        if (userData.avatar) {
          setAvatarPreview(userData.avatar);
        }
        
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

      // Create FormData for file upload
      const submitData = new FormData();

      if (isEditMode && id) {
        // Update existing user
        submitData.append("userId", id as string);
        submitData.append("email", formData.emailAddress);
        submitData.append("firstName", formData.accountName);
        submitData.append("lastName", formData.accountCode);
        submitData.append("mobileNo", formData.phoneNumber);
        submitData.append("accountId", formData.accountId.toString());
        submitData.append("roleId", formData.roleId.toString());
        submitData.append("status", userStatus.toString());
        submitData.append("twoFactorEnabled", twoFactorEnabled.toString());

        // Add avatar file if exists
        if (avatarFile) {
          submitData.append("avatar", avatarFile);
        }

        const response = await updateUser(id, submitData);
        if (response.statusCode === 200) {
          toast.success(response.message || "User updated successfully!");
          router.push("/users");
        } else {
          toast.error(response.message || "Failed to update user");
        }
      } else {
        // Create new user
        submitData.append("email", formData.emailAddress);
        submitData.append("password", "string"); // TODO: replace this with actual password input
        submitData.append("firstName", formData.accountName);
        submitData.append("lastName", formData.accountCode);
        submitData.append("accountId", formData.accountId.toString());
        submitData.append("roleId", formData.roleId.toString());
        submitData.append("twoFactorEnabled", twoFactorEnabled.toString());
        submitData.append("status", userStatus.toString());

        // Add avatar file if exists
        if (avatarFile) {
          submitData.append("avatar", avatarFile);
        }

        const response = await createUser(submitData);
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
    { id: "access" as TabType, label: "Access & Roles" },
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
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div>
              <h1
                className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
              >
                {isEditMode ? "Edit User" : "Create User"}
              </h1>
              <p
                className={`text-xs sm:text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Manage user identity, access scope, and security settings.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => router.push("/users")}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors ${
                  isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: selectedColor }}
              >
                {loading
                  ? "Saving..."
                  : isEditMode
                    ? "Update User"
                    : "Create User"}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"} mb-4 sm:mb-6`}
        >
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? `text-[${selectedColor}]`
                    : isDark
                      ? "text-gray-400 border-transparent hover:text-gray-300"
                      : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
                style={{
                  borderBottomColor:
                    activeTab === tab.id ? selectedColor : "transparent",
                  color: activeTab === tab.id ? selectedColor : undefined,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Profile Tab */}
          {activeTab === "profile" && (
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
                    Personal Information
                  </h2>
                </div>
                <p
                  className={`text-xs sm:text-sm mb-4 sm:mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Basic identity details used for login and display.
                </p>

                {/* Avatar Upload Section */}
                <div className="mb-6">
                  <label
                    className={`block text-xs sm:text-sm font-medium mb-3 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    {/* Avatar Preview */}
                    <div className="relative">
                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center overflow-hidden ${
                          isDark
                            ? "bg-gray-800 border-2 border-gray-700"
                            : "bg-gray-100 border-2 border-gray-300"
                        }`}
                      >
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User
                            className={`w-10 h-10 sm:w-12 sm:h-12 ${
                              isDark ? "text-gray-600" : "text-gray-400"
                            }`}
                          />
                        )}
                      </div>
                      {avatarPreview && (
                        <button
                          onClick={handleRemoveAvatar}
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          title="Remove avatar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="flex-1">
                      <label
                        htmlFor="avatar-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                          isDark
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Change Avatar</span>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <p
                        className={`text-xs mt-2 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        JPG, PNG, GIF or WebP. Max size 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* First Name */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
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
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
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
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
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
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
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
                  <Building2
                    className={`w-4 h-4 sm:w-5 sm:h-5`}
                    style={{ color: selectedColor }}
                  />
                  <h2
                    className={`text-lg sm:text-xl font-bold ${isDark ? "text-foreground" : "text-gray-900"}`}
                  >
                    Access & Roles
                  </h2>
                </div>
                <p
                  className={`text-xs sm:text-sm mb-4 sm:mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  Define user permissions and account associations.
                </p>

                <div className="space-y-4 sm:space-y-6">
                  {/* Role Assignment */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Role Assignment
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