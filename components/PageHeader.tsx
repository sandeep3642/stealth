"use client";

import React from "react";
import { Home, Filter, Download } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import { useRouter } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  showButton?: boolean;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  onButtonClick?: () => void;
  buttonRoute?: string;
  showExportButton?: boolean;
  ExportbuttonText?: string;
  onExportClick?: () => void;
  showFilterButton?: boolean;
  FilterbuttonText?: string;
  onFilterClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  showButton = false,
  buttonText = "Add New",
  buttonIcon,
  onButtonClick,
  buttonRoute,
  showExportButton = false,
  ExportbuttonText = "Export",
  onExportClick,
  showFilterButton = false,
  FilterbuttonText = "Filters",
  onFilterClick,
}) => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonRoute) {
      router.push(buttonRoute);
    }
  };

  const handleExportClick = () => {
    if (onExportClick) {
      onExportClick();
    }
  };

  const handleFilterClick = () => {
    if (onFilterClick) {
      onFilterClick();
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6 text-xs sm:text-sm overflow-x-auto">
          <Home
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          />
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <span
                className={`flex-shrink-0 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              >
                ›
              </span>
              {item.href ? (
                <button
                  onClick={() => router.push(item.href!)}
                  className={`whitespace-nowrap ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"} transition-colors`}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={`whitespace-nowrap ${
                    index === breadcrumbs.length - 1
                      ? isDark
                        ? "text-foreground"
                        : "text-gray-900"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 ${isDark ? "text-foreground" : "text-gray-900"}`}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={`text-sm sm:text-base ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filters Button */}
          {showFilterButton && (
            <button
              onClick={handleFilterClick}
              className={`cursor-pointer px-4 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors border ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              {FilterbuttonText}
            </button>
          )}

          {/* Export Button */}
          {showExportButton && (
            <button
              onClick={handleExportClick}
              className={`cursor-pointer px-4 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors border ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Download className="w-4 h-4" />
              {ExportbuttonText}
            </button>
          )}

          {/* Primary Action Button */}
          {showButton && (
            <button
              onClick={handleButtonClick}
              style={{ background: selectedColor }}
              className="cursor-pointer hover:opacity-90 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-opacity"
            >
              {buttonIcon || <span className="text-xl">+</span>}
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default PageHeader;