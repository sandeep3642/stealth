"use client";
import React, { useState } from "react";
import { Search, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { useColor } from "@/context/ColorContext";
import { Column, CommonTableProps } from "@/interfaces/table.interface";
import { useTheme } from "@/context/ThemeContext";

const CommonTable: React.FC<CommonTableProps> = ({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  showActions = true,
  searchPlaceholder = "Search...",
  rowsPerPageOptions = [10, 25, 50, 100],
  pageNo = 1,
  pageSize = 10,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  variant = "default",
  searchQuery = "",
  setSearchQuery,
  totalRecords = 0,
  isServerSide = true,
}) => {
  const { selectedColor } = useColor();
  const { isDark } = useTheme();

  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(() => {
    const initialVisibility: Record<string, boolean> = {};
    columns.forEach((col) => {
      initialVisibility[col.key] = col.visible !== false;
    });
    if (showActions) {
      initialVisibility.actions = true;
    }
    return initialVisibility;
  });
  const [showColumnMenu, setShowColumnMenu] = useState<boolean>(false);

  const toggleColumn = (columnKey: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const getStatusColor = (
    status?: string | boolean,
    isDark = false,
  ): string => {
    const normalized =
      typeof status === "string"
        ? status.toLowerCase()
        : status
          ? "active"
          : "inactive";

    if (isDark) {
      switch (normalized) {
        case "active":
          return "bg-emerald-900/30 text-emerald-300 border border-emerald-800";
        case "suspended":
          return "bg-rose-900/30 text-rose-300 border border-rose-800";
        case "under review":
          return "bg-amber-900/30 text-amber-300 border border-amber-800";
        case "pending":
          return "bg-yellow-900/30 text-yellow-300 border border-yellow-800";
        case "inactive":
          return "bg-gray-800/50 text-gray-400 border border-gray-700";
        default:
          return "bg-gray-800/50 text-gray-400 border border-gray-700";
      }
    } else {
      switch (normalized) {
        case "active":
          return "bg-white text-emerald-700 border border-emerald-400";
        case "suspended":
          return "bg-white text-rose-700 border border-rose-400";
        case "under review":
          return "bg-white text-amber-700 border border-amber-400";
        case "pending":
          return "bg-white text-yellow-700 border border-yellow-400";
        case "inactive":
          return "bg-white text-gray-700 border border-gray-300";
        default:
          return "bg-white text-gray-700 border border-gray-300";
      }
    }
  };

  const renderCellContent = (
    column: Column,
    row: any,
    idx: number,
  ): React.ReactNode => {
    const value = row[column.key];

    console.log("sdjjkshfshkjd", column);

    if (column.render) {
      return column.render(value, row);
    }

    if (column.key === "no") {
      // For server-side pagination, calculate the correct index
      const actualIndex = isServerSide
        ? (pageNo - 1) * pageSize + idx + 1
        : idx + 1;
      return <span className="text-sm text-foreground">{actualIndex}</span>;
    }

    if (column.key === "status") {
      if (typeof value === "boolean") {
        return (
          <span
            className={`inline-flex px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md ${getStatusColor(
              value,
              isDark,
            )}`}
          >
            {value ? "Active" : "Inactive"}
          </span>
        );
      }

      if (typeof value === "string") {
        return (
          <span
            className={`inline-flex px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md ${getStatusColor(
              value,
              isDark,
            )}`}
          >
            {value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
          </span>
        );
      }

      return (
        <span className="inline-flex px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md bg-gray-700 text-gray-300 border border-gray-600">
          Unknown
        </span>
      );
    }

    if (column.type === "badge") {
      let displayValue = value;

      if (typeof value === "boolean") {
        displayValue = value ? "Active" : "Inactive";
      }

      return (
        <span
          className={`inline-flex px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-md ${getStatusColor(
            value,
          )}`}
        >
          {displayValue}
        </span>
      );
    }

    if (column.type === "link") {
      return (
        <span
          className="text-sm font-semibold"
          style={{ color: selectedColor }}
        >
          {value}
        </span>
      );
    }

    if (column.type === "icon-text") {
      return (
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          {column.icon && (
            <span className="text-foreground">{column.icon}</span>
          )}
          {value}
        </div>
      );
    }

    if (column.type === "multi-line") {
      return (
        <div className="flex flex-col gap-0.5">
          <span
            className={
              column.mainStyle || "text-sm font-semibold text-foreground"
            }
          >
            {value?.main}
          </span>
          <span
            className={
              column.subStyle ||
              "text-xs font-bold text-foreground opacity-70 uppercase tracking-wide"
            }
          >
            {value?.sub}
          </span>
        </div>
      );
    }

    if (column.type === "date" && value) {
      const date = new Date(value);
      const formatted = date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return (
        <span className="text-sm text-foreground font-medium">{formatted}</span>
      );
    }

    if (column.key === "defaultLanguage") {
      const langMap: Record<string, string> = {
        en: "English",
        es: "Spanish",
        fr: "French",
        de: "German",
      };
      //   return langMap[value] || value;
      return (
        <span className="text-sm text-foreground">
          {langMap[value] || value}
        </span>
      );
    }

    return <span className="text-sm text-foreground">{value}</span>;
  };

  // Client-side filtering and pagination (only when NOT server-side)
  const filteredData = isServerSide
    ? data
    : data.filter((row) => {
        if (!searchQuery) return true;
        return columns.some((column) => {
          const value = row[column.key];
          if (typeof value === "object" && value !== null) {
            return Object.values(value).some((v) =>
              String(v).toLowerCase().includes(searchQuery.toLowerCase()),
            );
          }
          return String(value)
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        });
      });

  // Use totalRecords from props if server-side, otherwise calculate client-side
  const actualTotalRecords = isServerSide ? totalRecords : filteredData.length;
  const totalPages = Math.ceil(actualTotalRecords / pageSize);

  // For client-side, paginate the data. For server-side, use data as-is
  const paginatedData = isServerSide
    ? data
    : (() => {
        const startIndex = (pageNo - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
      })();

  const renderTable = () => (
    <>
      {/* Table Section - Mobile Responsive */}
      <div className="overflow-x-auto">
        <table
          className={`w-full min-w-[600px] ${variant === "default" ? "border-separate border-spacing-y-2" : ""}`}
        >
          <thead>
            <tr
              className={
                variant === "simple"
                  ? "border-b border-border"
                  : "bg-background"
              }
            >
              {columns.map(
                (column) =>
                  columnVisibility[column.key] && (
                    <th
                      key={column.key}
                      className={`px-3 sm:px-${variant === "simple" ? "4" : "6"} py-3 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-wide`}
                    >
                      {column.label}
                    </th>
                  ),
              )}
              {showActions && columnVisibility.actions && (
                <th
                  className={`px-3 sm:px-${variant === "simple" ? "4" : "6"} py-3 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-foreground uppercase tracking-wide`}
                >
                  ACTION
                </th>
              )}
            </tr>
          </thead>

          <tbody className={variant === "default" ? "bg-card" : ""}>
            {paginatedData.map((row, idx) => (
              <tr
                key={row.id || idx}
                className={
                  variant === "simple"
                    ? "border-b border-border hover:bg-background/50 transition-colors"
                    : "border border-border rounded-lg"
                }
              >
                {columns.map(
                  (column) =>
                    columnVisibility[column.key] && (
                      <td
                        key={column.key}
                        className={`px-3 sm:px-${variant === "simple" ? "4" : "6"} py-3 sm:py-4`}
                      >
                        {renderCellContent(column, row, idx)}
                      </td>
                    ),
                )}
                {showActions && columnVisibility.actions && (
                  <td
                    className={`px-3 sm:px-${variant === "simple" ? "4" : "6"} py-3 sm:py-4`}
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-foreground opacity-50 hover:opacity-100 p-1 transition-opacity cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="text-red-500 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Section - Mobile Responsive */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="text-xs sm:text-sm text-foreground font-medium opacity-70">
          SHOWING {Math.min(paginatedData.length, pageSize)} OF{" "}
          {actualTotalRecords} RECORDS
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className="text-xs sm:text-sm font-semibold"
            style={{ color: selectedColor }}
          >
            PAGE {pageNo} / {totalPages || 1}
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: selectedColor }}
              onClick={() => {
                if (pageNo > 1) {
                  onPageChange(pageNo - 1);
                }
              }}
              disabled={pageNo <= 1}
              title="Previous Page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: selectedColor }}
              onClick={() => {
                if (pageNo < totalPages) {
                  onPageChange(pageNo + 1);
                }
              }}
              disabled={pageNo >= totalPages}
              title="Next Page"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderHeader = () => (
    <div className="p-3 sm:p-4 lg:p-6 pb-3 sm:pb-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground opacity-40 w-4 h-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background text-foreground placeholder:text-foreground placeholder:opacity-50"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-medium text-foreground opacity-70 uppercase tracking-wide hidden sm:inline">
              VIEW
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 sm:px-3 py-2 text-xs sm:text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-card text-foreground"
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-xs sm:text-sm border border-border rounded-lg bg-card hover:bg-background transition-colors"
            >
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="text-foreground font-medium hidden sm:inline">
                Columns
              </span>
              <span className="text-foreground font-medium sm:hidden">Col</span>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground opacity-70" />
            </button>

            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-card rounded-lg shadow-xl border border-border py-2 z-10 max-h-[300px] overflow-y-auto">
                <div className="px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-semibold text-foreground opacity-70 uppercase tracking-wide">
                  Visibility
                </div>
                {columns.map((column) => (
                  <label
                    key={column.key}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer hover:bg-background transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={columnVisibility[column.key]}
                      onChange={() => toggleColumn(column.key)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      style={{ accentColor: selectedColor }}
                    />
                    <span className="text-xs sm:text-sm text-foreground">
                      {column.label}
                    </span>
                  </label>
                ))}
                {showActions && (
                  <label className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer hover:bg-background transition-colors">
                    <input
                      type="checkbox"
                      checked={columnVisibility.actions}
                      onChange={() => toggleColumn("actions")}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      style={{ accentColor: selectedColor }}
                    />
                    <span className="text-xs sm:text-sm text-foreground">
                      Actions
                    </span>
                  </label>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "simple") {
    return (
      <div className="bg-card rounded-lg sm:rounded-xl shadow-sm border border-border">
        {renderHeader()}
        {renderTable()}
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-background">
      <div className="p-3 sm:p-5 mx-auto bg-card rounded-lg sm:rounded-xl shadow-sm border border-border">
        {renderHeader()}
        {renderTable()}
      </div>
    </div>
  );
};

export default CommonTable;
