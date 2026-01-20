"use client";

import React, { useState } from "react";
import { Search, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { useColor } from "@/context/ColorContext";
import { Column, CommonTableProps } from "@/interfaces/table.interface";

const CommonTable: React.FC<CommonTableProps> = ({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  showActions = true,
  searchPlaceholder = "Search across all fields...",
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 10,
  variant = "default", // New prop: "default" or "simple"
}) => {
  const { selectedColor } = useColor();
  const [rowsPerPage, setRowsPerPage] = useState<number>(defaultRowsPerPage);
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const getStatusColor = (status?: string): string => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "suspended":
        return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "under review":
        return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "inactive":
        return "bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400";
    }
  };

  const renderCellContent = (column: Column, row: any): React.ReactNode => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === "badge") {
      return (
        <span
          className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-md ${getStatusColor(
            value,
          )}`}
        >
          {value}
        </span>
      );
    }

    if (column.type === "link") {
      return (
        <span
          className={`text-sm font-semibold`}
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
            {value.main}
          </span>
          <span
            className={
              column.subStyle ||
              "text-xs font-bold text-foreground opacity-70 uppercase tracking-wide"
            }
          >
            {value.sub}
          </span>
        </div>
      );
    }

    return <span className="text-sm text-foreground">{value}</span>;
  };

  // Filter data based on search query
  const filteredData = data.filter((row) => {
    if (!searchQuery) return true;
    return columns.some((column) => {
      const value = row[column.key];
      if (typeof value === "object" && value !== null) {
        return Object.values(value).some((v) =>
          String(v).toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }
      return String(value).toLowerCase().includes(searchQuery.toLowerCase());
    });
  });

  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / rowsPerPage);
  const currentPage = 1;

  // Simple variant (like in the image)
  if (variant === "simple") {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border">
        {/* Header Section */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground opacity-40 w-4 h-4" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background text-foreground placeholder:text-foreground placeholder:opacity-50"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground opacity-70 uppercase tracking-wide">
                  VIEW
                </span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-card text-foreground"
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
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg bg-card hover:bg-background transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-foreground opacity-70"
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
                  <span className="text-foreground font-medium">Columns</span>
                  <ChevronDown className="w-4 h-4 text-foreground opacity-70" />
                </button>

                {showColumnMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-card rounded-lg shadow-xl border border-border py-2 z-10">
                    <div className="px-4 py-2 text-xs font-semibold text-foreground opacity-70 uppercase tracking-wide">
                      Visibility
                    </div>
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-background transition-colors"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={columnVisibility[column.key]}
                            onChange={() => toggleColumn(column.key)}
                            className={`w-4 h-4`}
                            style={{
                              accentColor: selectedColor,
                            }}
                          />
                        </div>
                        <span className="text-sm text-foreground">
                          {column.label}
                        </span>
                      </label>
                    ))}
                    {showActions && (
                      <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-background transition-colors">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={columnVisibility.actions}
                            onChange={() => toggleColumn("actions")}
                            className={`w-4 h-4`}
                            style={{
                              accentColor: selectedColor,
                            }}
                          />
                        </div>
                        <span className="text-sm text-foreground">Actions</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section - Simple Style */}
        <div className="overflow-x-auto px-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map(
                  (column) =>
                    columnVisibility[column.key] && (
                      <th
                        key={column.key}
                        className="px-4 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wide"
                      >
                        {column.label}
                      </th>
                    ),
                )}
                {showActions && columnVisibility.actions && (
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wide">
                    ACTION
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredData.slice(0, rowsPerPage).map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border-b border-border hover:bg-background/50 transition-colors"
                >
                  {columns.map(
                    (column) =>
                      columnVisibility[column.key] && (
                        <td key={column.key} className="px-4 py-4">
                          {renderCellContent(column, row)}
                        </td>
                      ),
                  )}
                  {showActions && columnVisibility.actions && (
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-4">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-foreground opacity-50 hover:opacity-100 p-1 transition-opacity"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-red-500 hover:text-red-600 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer Section */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-foreground font-medium opacity-70">
            SHOWING {Math.min(filteredData.length, rowsPerPage)} OF{" "}
            {totalRecords} RECORDS
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-semibold"
              style={{ color: selectedColor }}
            >
              PAGE {currentPage} / {totalPages || 1}
            </span>
            <button
              className="w-9 h-9 flex items-center justify-center text-white text-sm font-semibold rounded-lg shadow-sm"
              style={{ background: selectedColor }}
            >
              {currentPage}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant (original design with card-based rows)
  return (
    <div className="min-h-screen bg-background">
      <div className="p-5 mx-auto bg-card rounded-xl shadow-sm border border-border">
        {/* Header Section */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground opacity-50 w-4 h-4" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background text-foreground placeholder:text-foreground placeholder:opacity-50"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground opacity-70 uppercase">
                  VIEW
                </span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-card text-foreground"
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
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg bg-card"
                >
                  <svg
                    className="w-4 h-4 text-foreground opacity-70"
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
                  <span className="text-foreground font-medium">Columns</span>
                  <ChevronDown className="w-4 h-4 text-foreground opacity-70" />
                </button>

                {showColumnMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-card rounded-lg shadow-xl border border-border py-2 z-10">
                    <div className="px-4 py-2 text-xs font-semibold text-foreground opacity-70 uppercase tracking-wide">
                      Visibility
                    </div>
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={columnVisibility[column.key]}
                            onChange={() => toggleColumn(column.key)}
                            className={`w-4 h-4`}
                            style={{
                              accentColor: selectedColor,
                            }}
                          />
                        </div>
                        <span className="text-sm text-foreground">
                          {column.label}
                        </span>
                      </label>
                    ))}
                    {showActions && (
                      <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={columnVisibility.actions}
                            onChange={() => toggleColumn("actions")}
                            className={`w-4 h-4`}
                            style={{
                              accentColor: selectedColor,
                            }}
                          />
                        </div>
                        <span className="text-sm text-foreground">Actions</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section - Default Style */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-background">
                {columns.map(
                  (column) =>
                    columnVisibility[column.key] && (
                      <th
                        key={column.key}
                        className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wide"
                      >
                        {column.label}
                      </th>
                    ),
                )}
                {showActions && columnVisibility.actions && (
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wide">
                    ACTION
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="bg-card">
              {filteredData.slice(0, rowsPerPage).map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="border border-border rounded-lg"
                >
                  {columns.map(
                    (column) =>
                      columnVisibility[column.key] && (
                        <td key={column.key} className="px-6 py-4">
                          {renderCellContent(column, row)}
                        </td>
                      ),
                  )}
                  {showActions && columnVisibility.actions && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="text-foreground opacity-50 p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer Section */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-foreground font-medium">
            SHOWING {Math.min(filteredData.length, rowsPerPage)} OF{" "}
            {totalRecords} RECORDS
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-semibold"
              style={{ color: selectedColor }}
            >
              PAGE {currentPage} / {totalPages || 1}
            </span>
            <button
              className="w-9 h-9 flex items-center justify-center text-white text-sm font-semibold rounded-lg shadow-sm"
              style={{ background: selectedColor }}
            >
              {currentPage}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonTable;
