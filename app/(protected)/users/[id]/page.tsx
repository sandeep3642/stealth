"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { Building2, User, Shield, Upload, X, Lock } from "lucide-react";
import { UserFormData } from "@/interfaces/user.interface";
import { useColor } from "@/context/ColorContext";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { useParams, useRouter } from "next/navigation";
import { createUser, updateUser, getUserById } from "@/services/userService";
import { toast } from "react-toastify";
import { getAllAccounts, getAllRoles } from "@/services/commonServie";
import { getRoleById } from "@/services/rolesService";

type TabType = "profile" | "access" | "security";

interface Account {
  id: number;
  value: string;
}

interface Role {
  id: number;
  value: string;
}

interface Permission {
  formId: number;
  formName: string;
  moduleName: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExport: boolean;
}
interface AdditionalPermission {
  accountId: number;
  formId: number;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canAll: boolean;
}

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
    accountId: 7, // Static for testing - AddRole reference
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

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userStatus, setUserStatus] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Permission Matrix States - Similar to AddRole
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]); // Base permissions from role
  const [additionalPermissions, setAdditionalPermissions] = useState<
    AdditionalPermission[]
  >([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "accountId") {
      const selectedAccountId = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        accountId: selectedAccountId,
        roleId: 0,
      }));

      setRolePermissions([]);
      setAdditionalPermissions([]);

      if (selectedAccountId > 0) {
        fetchRolesForAccount(selectedAccountId);
      } else {
        setRoles([]);
      }
    } else if (name === "roleId") {
      const selectedRoleId = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        roleId: selectedRoleId,
      }));

      if (selectedRoleId > 0 && formData.accountId > 0) {
        fetchRolePermissions(selectedRoleId, formData.accountId);
      } else {
        setRolePermissions([]);
        setAdditionalPermissions([]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Fetch roles based on selected account - AddRole reference
  const fetchRolesForAccount = async (accountId: number) => {
    try {
      const response = await getAllRoles(accountId);
      if (response && response.statusCode === 200) {
        setRoles(response.data || []);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  };

  // Fetch permissions for selected role - AddRole reference
  const fetchRolePermissions = async (roleId: number, accountId: number) => {
    try {
      setLoadingPermissions(true);
      const response = await getRoleById(roleId, accountId);

      if (response && response.statusCode === 200) {
        const roleData = response.data;

        // Set base permissions from role - AddRole reference
        if (roleData.rights && Array.isArray(roleData.rights)) {
          const permissions = roleData.rights.map((right: any) => ({
            formId: right.formId,
            formName: right.formName || `Form ${right.formId}`,
            moduleName: right.moduleName || "General",
            canRead: right.canRead || false,
            canWrite: right.canWrite || false,
            canDelete: right.canDelete || false,
            canExport: right.canExport || false,
          }));
          setRolePermissions(permissions);
        }
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      toast.error("Failed to load role permissions");
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Toggle additional permission - only formId stored
  const toggleAdditionalPermission = (formId: number) => {
    setAdditionalPermissions((prev) => {
      const exists = prev.find((p) => p.formId === formId);

      if (exists) {
        return prev.filter((p) => p.formId !== formId);
      }

      return [
        ...prev,
        {
          accountId: formData.accountId, // 🔴 MUST
          formId,
          canRead: true,
          canWrite: true,
          canUpdate: true,
          canDelete: true,
          canExport: true,
          canAll: true,
        },
      ];
    });
  };

  // Check if permission is from role (cannot be unchecked)
  const isPermissionFromRole = (formId: number) => {
    return rolePermissions.some(
      (p) =>
        p.formId === formId &&
        (p.canRead || p.canWrite || p.canDelete || p.canExport),
    );
  };

  // Check if permission is additional (can be unchecked)
  const isAdditionalPermission = (formId: number) => {
    return additionalPermissions.some((p) => p.formId === formId);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Avatar uploaded successfully!");
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
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
          accountId: userData.accountId || 7, // Use from API or default to 7
          roleId: userData.roleId || 0,
          primaryDomain: "",
          fullName: `${userData.firstName} ${userData.lastName}`,
          emailAddress: userData.email || "",
          phoneNumber: userData.mobileNo || "",
          location: "",
        });

        setUserStatus(userData.status ?? true);
        setTwoFactorEnabled(userData.twoFactorEnabled ?? false);

        // Set additional permissions from user data
        if (Array.isArray(userData.additionalPermissions)) {
          const mapped: AdditionalPermission[] =
            userData.additionalPermissions.map((p: any) => ({
              accountId: userData.accountId,
              formId: p.formId,
              canRead: p.canRead ?? true,
              canWrite: p.canWrite ?? true,
              canUpdate: p.canUpdate ?? true,
              canDelete: p.canDelete ?? true,
              canExport: p.canExport ?? true,
              canAll: p.canAll ?? true,
            }));

          setAdditionalPermissions(mapped);
        }

        if (userData.profileImagePath) {
          const imageUrl = userData.profileImagePath.startsWith("http")
            ? userData.profileImagePath
            : `/proxy/${String(userData.profileImagePath).replace(/^\/+/, "")}`;
          setAvatarPreview(imageUrl);
        }

        // Load roles for the user's account
        if (userData.accountId) {
          await fetchRolesForAccount(userData.accountId);
        }

        // Load permissions for the user's role
        if (userData.roleId && userData.accountId) {
          await fetchRolePermissions(userData.roleId, userData.accountId);
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

    if (!formData.accountId || formData.accountId === 0) {
      toast.error("Please select an account");
      return;
    }

    if (!formData.roleId || formData.roleId === 0) {
      toast.error("Please select a role");
      return;
    }

    try {
      setLoading(true);
      const submitData = new FormData();

      if (isEditMode && id) {
        submitData.append("userId", id as string);
        submitData.append("Email", formData.emailAddress);
        submitData.append("FirstName", formData.accountName);
        submitData.append("LastName", formData.accountCode);
        submitData.append("MobileNo", formData.phoneNumber || "");
        submitData.append("AccountId", formData.accountId.toString());
        submitData.append("RoleId", formData.roleId.toString());
        submitData.append("Status", userStatus.toString());
        submitData.append("TwoFactorEnabled", twoFactorEnabled.toString());

        // Add only additional permissions (formIds)
        if (additionalPermissions.length > 0) {
          submitData.append(
            "AdditionalPermissions",
            JSON.stringify(additionalPermissions),
          );
        }

        if (avatarFile) {
          submitData.append("ProfileImage", avatarFile);
        }
        const payload = {
          Email: formData.emailAddress,
          FirstName: formData.accountName,
          LastName: formData.accountCode,
          MobileNo: formData.phoneNumber || "",
          AccountId: formData.accountId,
          RoleId: formData.roleId,
          Status: userStatus,
          TwoFactorEnabled: twoFactorEnabled,
          AdditionalPermissions: additionalPermissions, // 🔥 full array
          ProfileImage: avatarFile || null,
        };

        const response = await updateUser(id as string, payload);

        // const response = await updateUser(id, submitData);
        if (response.statusCode === 200) {
          toast.success(response.message || "User updated successfully!");
          setTimeout(() => router.push("/users"), 1000);
        } else {
          toast.error(response.message || "Failed to update user");
        }
      } else {
        // CREATE USER - Pass plain object instead of FormData
        const payload = {
          Email: formData.emailAddress,
          Password: "TempPass@123",
          FirstName: formData.accountName,
          LastName: formData.accountCode,
          MobileNo: formData.phoneNumber || "",
          AccountId: formData.accountId,
          RoleId: formData.roleId,
          Status: userStatus,
          TwoFactorEnabled: twoFactorEnabled,
          AdditionalPermissions: additionalPermissions, // Pass the array directly
          ProfileImage: avatarFile || null,
        };

        const response = await createUser(payload);
        if (response.statusCode === 200) {
          toast.success(response.message || "User created successfully!");
          setTimeout(() => router.push("/users"), 1000);
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

  async function fetchAllAccounts() {
    try {
      const response = await getAllAccounts();
      if (response && response.statusCode === 200) {
        setAccounts(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchAllAccounts();

      // Load roles for default accountId = 7
      await fetchRolesForAccount(7);

      if (id && String(id) !== "0") {
        await fetchUserData(id as string);
      }
    };
    loadData();
  }, [id]);

  const tabs = [
    { id: "profile" as TabType, label: "Profile" },
    { id: "access" as TabType, label: "Access & Roles" },
    { id: "security" as TabType, label: "Security" },
  ];

  if (loading && isEditMode && !formData.emailAddress) {
    return (
      <div className={`${isDark ? "dark" : ""}  sm:`}>
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
    <div className={`${isDark ? "dark" : ""}  sm:`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-3 sm:p-4 md:p-6`}
      >
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

        <div
          className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"} mb-4 sm:mb-6`}
        >
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors border-b-2`}
                style={{
                  borderBottomColor:
                    activeTab === tab.id ? selectedColor : "transparent",
                  color:
                    activeTab === tab.id
                      ? selectedColor
                      : isDark
                        ? "#9CA3AF"
                        : "#6B7280",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
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

                <div className="mb-6">
                  <label
                    className={`block text-xs sm:text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
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
                            className={`w-10 h-10 sm:w-12 sm:h-12 ${isDark ? "text-gray-600" : "text-gray-400"}`}
                          />
                        )}
                      </div>
                      {avatarPreview && (
                        <button
                          onClick={handleRemoveAvatar}
                          className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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
                        className={`text-xs mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        JPG, PNG, GIF or WebP. Max size 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      placeholder="Jane"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountCode"
                      value={formData.accountCode}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      placeholder="jane@company.com"
                      disabled={isEditMode}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      } ${isEditMode ? "opacity-60 cursor-not-allowed" : ""} focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                    {isEditMode && (
                      <p
                        className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Email cannot be changed after user creation
                      </p>
                    )}
                  </div>
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
                          ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

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
                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Account Association{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="accountId"
                      value={formData.accountId}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="0">Select Account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Role Assignment <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleInputChange}
                      disabled={!formData.accountId || formData.accountId === 0}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg border transition-colors ${
                        isDark
                          ? "bg-gray-800 border-gray-700 text-foreground"
                          : "bg-white border-gray-300 text-gray-900"
                      } ${!formData.accountId || formData.accountId === 0 ? "opacity-50 cursor-not-allowed" : ""} focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    >
                      <option value="0">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Permission Matrix - AddRole Style */}
                  {formData.roleId > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Lock
                          className={`w-5 h-5`}
                          style={{ color: selectedColor }}
                        />
                        <h3
                          className={`text-base font-semibold ${isDark ? "text-foreground" : "text-gray-900"}`}
                        >
                          Permission Matrix
                        </h3>
                        {loadingPermissions && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                            Loading...
                          </div>
                        )}
                      </div>

                      <p
                        className={`text-xs mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                      >
                        Role permissions are shown below. You can grant
                        additional permissions specific to this user.
                      </p>

                      {rolePermissions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr
                                className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
                              >
                                <th
                                  className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                                >
                                  RESOURCE
                                </th>
                                <th
                                  className={`text-center py-3 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                                >
                                  READ
                                </th>
                                <th
                                  className={`text-center py-3 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                                >
                                  WRITE
                                </th>
                                <th
                                  className={`text-center py-3 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                                >
                                  DELETE
                                </th>
                                <th
                                  className={`text-center py-3 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                                >
                                  EXPORT
                                </th>
                                <th
                                  className={`text-center py-3 px-4 font-semibold text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
                                >
                                  ADDITIONAL
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rolePermissions.map((permission) => {
                                const isFromRole = isPermissionFromRole(
                                  permission.formId,
                                );
                                const isAdditional = isAdditionalPermission(
                                  permission.formId,
                                );

                                return (
                                  <tr
                                    key={permission.formId}
                                    className={`border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
                                  >
                                    <td
                                      className={`py-4 px-4 ${isDark ? "text-foreground" : "text-gray-900"}`}
                                    >
                                      <div className="font-medium">
                                        {permission.formName}
                                      </div>
                                      <div
                                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
                                      >
                                        {permission.moduleName}
                                      </div>
                                    </td>
                                    <td className="text-center py-4 px-4">
                                      <input
                                        type="checkbox"
                                        checked={permission.canRead}
                                        disabled
                                        className="w-4 h-4 rounded border-gray-300 opacity-50 cursor-not-allowed"
                                        style={{ accentColor: selectedColor }}
                                      />
                                    </td>
                                    <td className="text-center py-4 px-4">
                                      <input
                                        type="checkbox"
                                        checked={permission.canWrite}
                                        disabled
                                        className="w-4 h-4 rounded border-gray-300 opacity-50 cursor-not-allowed"
                                        style={{ accentColor: selectedColor }}
                                      />
                                    </td>
                                    <td className="text-center py-4 px-4">
                                      <input
                                        type="checkbox"
                                        checked={permission.canDelete}
                                        disabled
                                        className="w-4 h-4 rounded border-gray-300 opacity-50 cursor-not-allowed"
                                        style={{ accentColor: selectedColor }}
                                      />
                                    </td>
                                    <td className="text-center py-4 px-4">
                                      <input
                                        type="checkbox"
                                        checked={permission.canExport}
                                        disabled
                                        className="w-4 h-4 rounded border-gray-300 opacity-50 cursor-not-allowed"
                                        style={{ accentColor: selectedColor }}
                                      />
                                    </td>
                                    <td className="text-center py-4 px-4">
                                      <input
                                        type="checkbox"
                                        checked={isAdditional}
                                        disabled={isFromRole}
                                        onChange={() =>
                                          toggleAdditionalPermission(
                                            permission.formId,
                                          )
                                        }
                                        className="w-4 h-4 rounded border-gray-300 cursor-pointer disabled:opacity-50"
                                        style={{ accentColor: selectedColor }}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div
                          className={`text-center py-8 rounded-lg border ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-gray-50"}`}
                        >
                          <p
                            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {loadingPermissions
                              ? "Loading permissions..."
                              : "No permissions available for this role"}
                          </p>
                        </div>
                      )}

                      <div
                        className={`mt-4 p-3 rounded-lg ${isDark ? "bg-gray-800" : "bg-blue-50"}`}
                      >
                        <p
                          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-700"}`}
                        >
                          <strong>Note:</strong> Role permissions (Read, Write,
                          Delete, Export) are inherited from the selected role
                          and cannot be modified. Use the "Additional" column to
                          grant extra permissions specific to this user beyond
                          their role.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

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
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
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
                          className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
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

                  <div
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}
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
                        className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
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
                          onClick={() =>
                            toast.info("Password reset email sent!")
                          }
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
    </div>
  );
};

export default CreateUser;
