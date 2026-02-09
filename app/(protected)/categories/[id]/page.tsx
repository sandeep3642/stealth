"use client";

import React, { useState, useEffect } from "react";
import { Layers } from "lucide-react";
import { useColor } from "@/context/ColorContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter, useParams } from "next/navigation";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import {
  saveCategory,
  updateCategory,
  getCategoryById,
} from "@/services/categoryService";
import { CategoryFormData } from "@/interfaces/category.interface";
import { toast } from "react-toastify";

const AddEditCategory: React.FC = () => {
  const { selectedColor } = useColor();
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useParams();

  // Get ID from route params
  const categoryId = params?.id ? Number(params.id) : 0;
  const isEditMode = categoryId > 0;

  const [isActive, setIsActive] = useState(true);
  const [labelName, setLabelName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCategoryData();
    }
  }, [categoryId]);

  const fetchCategoryData = async () => {
    try {
      setFetchingData(true);
      const response = await getCategoryById(categoryId);

      if (response.success && response.data) {
        const category = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        setLabelName(category.labelName || "");
        setDescription(category.description || "");
        setIsActive(category.isActive ?? true);
      } else {
        toast.error("Failed to fetch category data");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Error loading category data");
      router.back();
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!labelName.trim()) {
      toast.error("Please enter a label name");
      return;
    }

    const payload: CategoryFormData = {
      labelName: labelName.trim(),
      description: description.trim(),
      isActive,
    };

    try {
      setLoading(true);
      let response;

      if (isEditMode) {
        // Update existing category
        response = await updateCategory(payload, categoryId);
      } else {
        // Create new category
        response = await saveCategory(payload);
      }

      if (response.success) {
        toast.success(
          isEditMode
            ? "Category updated successfully!"
            : "Category created successfully!",
        );
        router.push("/categories");
      } else {
        toast.error(`Failed: ${response.message}`);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("An error occurred while saving the category");
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
          <p className="text-foreground">Loading category data...</p>
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
              {isEditMode ? "Edit Classification" : "New Classification"}
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
                  <Layers
                    className="w-5 h-5"
                    style={{ color: selectedColor }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Taxonomy Parameters
                  </h2>
                  <p className="text-sm text-foreground opacity-60">
                    {isEditMode
                      ? "Update the grouping for account management and pricing."
                      : "Create a new grouping for account management and pricing."}
                  </p>
                </div>
              </div>

              {/* Label Name Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Label Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Platinum Partner"
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
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
                  Description
                </label>
                <textarea
                  placeholder="Define the purpose and scope of this account category..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
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
                      Category Status
                    </h3>
                    <p className="text-sm text-foreground opacity-60">
                      Inactive categories cannot be assigned to new accounts.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    disabled={loading}
                    className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                    style={{
                      backgroundColor: isActive ? selectedColor : "#cbd5e1",
                    }}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        isActive ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
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
                    <>{isEditMode ? "Update Category" : "Create Category"}</>
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

export default AddEditCategory;
