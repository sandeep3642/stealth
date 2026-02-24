"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FileText } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import {
  createForm,
  getFormById,
  updateForm,
} from "@/services/formService";
import { FormMasterPayload } from "@/interfaces/form.interface";

const defaultFormData: FormMasterPayload = {
  formCode: "",
  formName: "",
  moduleName: "",
  pageUrl: "",
  iconName: "",
  sortOrder: 0,
  isMenu: true,
  isVisible: true,
  isActive: true,
};

const AddEditFormMasterPage: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();
  const params = useParams();
  const formId = Number(params?.id || 0);
  const isEditMode = formId > 0;

  const [formData, setFormData] = useState<FormMasterPayload>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  const fetchFormById = async () => {
    try {
      setFetchingData(true);
      const response = await getFormById(formId);
      if (response?.success && response?.data) {
        const data = response.data;
        setFormData({
          formCode: data.formCode || "",
          formName: data.formName || "",
          moduleName: data.moduleName || "",
          pageUrl: data.pageUrl || "",
          iconName: data.iconName || "",
          sortOrder: Number(data.sortOrder || 0),
          isMenu: data.isMenu ?? true,
          isVisible: data.isVisible ?? true,
          isActive: data.isActive ?? true,
        });
      } else {
        toast.error(response?.message || "Failed to fetch form");
        router.push("/formmaster");
      }
    } catch (error) {
      toast.error("Failed to fetch form details");
      router.push("/formmaster");
    } finally {
      setFetchingData(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchFormById();
    }
  }, [formId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.formCode.trim()) {
      toast.error("Form code is required");
      return;
    }
    if (!formData.formName.trim()) {
      toast.error("Form name is required");
      return;
    }
    if (!formData.moduleName.trim()) {
      toast.error("Module name is required");
      return;
    }
    if (!formData.pageUrl.trim()) {
      toast.error("Page URL is required");
      return;
    }

    const payload: FormMasterPayload = {
      ...formData,
      formCode: formData.formCode.trim(),
      formName: formData.formName.trim(),
      moduleName: formData.moduleName.trim(),
      pageUrl: formData.pageUrl.trim(),
      iconName: formData.iconName.trim(),
      sortOrder: Number(formData.sortOrder) || 0,
    };

    try {
      setLoading(true);
      const response = isEditMode
        ? await updateForm(formId, payload)
        : await createForm(payload);

      if (response?.success || response?.statusCode === 200) {
        toast.success(
          response?.message ||
            (isEditMode
              ? "Form updated successfully"
              : "Form created successfully"),
        );
        router.push("/formmaster");
      } else {
        toast.error(response?.message || "Failed to save form");
      }
    } catch (error) {
      toast.error("Failed to save form");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className={`${isDark ? "dark" : ""}`}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground">Loading form details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <div className="min-h-screen bg-background p-2">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {isEditMode ? "Edit Form" : "Create New Form"}
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
                  <FileText className="w-5 h-5" style={{ color: selectedColor }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Form Information
                  </h2>
                  <p className="text-sm text-foreground opacity-60">
                    Configure form code, route, module, and visibility options.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Form Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="formCode"
                    value={formData.formCode}
                    onChange={handleInputChange}
                    placeholder="e.g. USER-001"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Form Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="formName"
                    value={formData.formName}
                    onChange={handleInputChange}
                    placeholder="e.g. Roles & Permissions"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="moduleName"
                    value={formData.moduleName}
                    onChange={handleInputChange}
                    placeholder="e.g. User-Management"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Page URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pageUrl"
                    value={formData.pageUrl}
                    onChange={handleInputChange}
                    placeholder="e.g. /users/roles-permissions"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Icon Name
                  </label>
                  <input
                    type="text"
                    name="iconName"
                    value={formData.iconName}
                    onChange={handleInputChange}
                    placeholder="e.g. Shield"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-foreground placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="bg-background rounded-lg p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">
                      Is Menu
                    </h3>
                    <p className="text-sm text-foreground opacity-60">
                      Enable to include this form in menu.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="isMenu"
                    checked={formData.isMenu}
                    onChange={handleInputChange}
                    className="w-5 h-5"
                    style={{ accentColor: selectedColor }}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">
                      Is Visible
                    </h3>
                    <p className="text-sm text-foreground opacity-60">
                      Toggle form visibility in UI layers.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="isVisible"
                    checked={formData.isVisible}
                    onChange={handleInputChange}
                    className="w-5 h-5"
                    style={{ accentColor: selectedColor }}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">
                      Is Active
                    </h3>
                    <p className="text-sm text-foreground opacity-60">
                      Inactive form will be treated as disabled.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5"
                    style={{ accentColor: selectedColor }}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => router.push("/formmaster")}
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
                  className="px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: selectedColor }}
                >
                  {loading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Form"
                      : "Create Form"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditFormMasterPage;
