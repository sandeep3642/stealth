"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  GitBranch,
  MapPin,
  Route,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import CommonTable from "@/components/CommonTable";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { MetricCard } from "@/components/CommonCard";
import PageHeader from "@/components/PageHeader";
import { useColor } from "@/context/ColorContext";
import { useTheme } from "@/context/ThemeContext";
import type {
  DropdownOption,
  RouteMasterRow,
  RouteSummary,
} from "@/interfaces/routeMaster.interface";
import { getAllAccounts } from "@/services/commonServie";
import {
  deleteRouteMaster,
  getRouteMasters,
} from "@/services/routeMasterService";

const EMPTY_SUMMARY: RouteSummary = {
  totalRoutes: 0,
  geofenceRelated: 0,
  nonGeofenceRelated: 0,
};

const getLocalAccountId = (): number => {
  if (typeof window === "undefined") return 0;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return Number(user?.accountId || 0);
  } catch {
    return 0;
  }
};

const RouteMasterPage: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [accounts, setAccounts] = useState<DropdownOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<RouteMasterRow[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState<RouteSummary>(EMPTY_SUMMARY);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteMasterRow | null>(
    null,
  );

  const columns = useMemo(
    () => [
      { key: "no", label: "NO", visible: true },
      { key: "routeName", label: "ROUTE NAME", visible: true },
      { key: "accountName", label: "ACCOUNT", visible: true },
      { key: "startPoint", label: "START POINT", visible: true },
      { key: "endPoint", label: "END POINT", visible: true },
      { key: "stopsCount", label: "STOPS", visible: true },
      {
        key: "isGeofenceRelated",
        label: "GEOFENCE",
        visible: true,
        render: (value: boolean) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
              value
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {value ? "Yes" : "No"}
          </span>
        ),
      },
      { key: "status", label: "STATUS", type: "badge" as const, visible: true },
      {
        key: "createdAt",
        label: "CREATED ON",
        visible: true,
        render: (value: string) =>
          value ? new Date(value).toLocaleString("en-IN") : "-",
      },
    ],
    [],
  );

  const mapRow = (item: any): RouteMasterRow => ({
    id: Number(item?.id || 0),
    routeName: String(item?.routeName || item?.name || "-"),
    accountName: String(item?.accountName || item?.account || "-"),
    startPoint: String(item?.startPointName || item?.startGeofenceName || "-"),
    endPoint: String(item?.endPointName || item?.endGeofenceName || "-"),
    stopsCount: Number(item?.stopsCount || item?.stopCount || 0),
    isGeofenceRelated: Boolean(
      item?.isGeofenceRelated ?? item?.geofenceRelated ?? true,
    ),
    status: item?.isActive ? "Active" : "Inactive",
    createdAt: String(item?.createdAt || ""),
  });

  const fetchAccounts = async () => {
    try {
      const response = await getAllAccounts();
      const accountList = Array.isArray(response?.data) ? response.data : [];
      setAccounts(
        accountList.map((item: any) => ({
          id: Number(item?.id || 0),
          value: String(item?.value || item?.name || item?.id || ""),
        })),
      );
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchRouteMasters = async () => {
    try {
      setLoading(true);
      const response = await getRouteMasters({
        page: pageNo,
        pageSize,
        accountId: selectedAccountId,
        search: debouncedQuery,
      });

      const listData = response?.data?.routes || response?.data?.routeMasters;
      const items = Array.isArray(listData?.items)
        ? listData.items
        : Array.isArray(response?.data?.items)
          ? response.data.items
          : [];
      const total = Number(
        listData?.totalRecords ?? response?.data?.totalRecords ?? items.length,
      );

      const summaryData = response?.data?.summary || {};
      const geofenceRelated = Number(
        summaryData?.geofenceRelated ??
          items.filter((row: any) => Boolean(row?.isGeofenceRelated)).length,
      );

      setRows(items.map(mapRow));
      setTotalRecords(total);
      setSummary({
        totalRoutes: Number(summaryData?.totalRoutes || total),
        geofenceRelated,
        nonGeofenceRelated: Number(
          summaryData?.nonGeofenceRelated || Math.max(total - geofenceRelated, 0),
        ),
      });
    } catch (error) {
      console.error("Error fetching route masters:", error);
      toast.error("Failed to fetch route master list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const accountId = getLocalAccountId();
    setSelectedAccountId(accountId);
    fetchAccounts();
  }, []);

  const hasSelectedAccountInList = useMemo(
    () =>
      selectedAccountId > 0 &&
      accounts.some((account) => Number(account.id) === selectedAccountId),
    [accounts, selectedAccountId],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchRouteMasters();
  }, [pageNo, pageSize, selectedAccountId, debouncedQuery]);

  const handleDelete = (row: RouteMasterRow) => {
    setSelectedRoute(row);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRoute) return;
    try {
      const response = await deleteRouteMaster(selectedRoute.id);
      if (response?.success || response?.statusCode === 200) {
        toast.success(response?.message || "Route deleted successfully");
        fetchRouteMasters();
      } else {
        toast.error(response?.message || "Failed to delete route");
      }
    } catch (error) {
      console.error("Delete route error:", error);
      toast.error("Error deleting route");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedRoute(null);
    }
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        <PageHeader
          title="Route Master"
          subtitle="Configure reusable route templates using geofence points and stops."
          breadcrumbs={[
            { label: "Fleet" },
            { label: "Route Master" },
          ]}
          showButton={true}
          buttonText="Add Route"
          buttonRoute="/route-master/0"
          showExportButton={false}
          showFilterButton={false}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="relative w-full sm:w-auto sm:min-w-[220px]">
            <Building2
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-300" : "text-gray-500"}`}
            />
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setSelectedAccountId(Number(e.target.value));
                setPageNo(1);
              }}
              className={`w-full appearance-none pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                isDark
                  ? "bg-card border-gray-700 text-foreground"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              <option value={0}>Select Account</option>
              {!hasSelectedAccountInList && selectedAccountId > 0 && (
                <option value={selectedAccountId}>
                  {`Selected Account (${selectedAccountId})`}
                </option>
              )}
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.value}
                </option>
              ))}
            </select>
            <ChevronDown
              className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-gray-300" : "text-gray-500"}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={Route}
            label="TOTAL ROUTES"
            value={summary.totalRoutes}
            iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
            iconColor="text-indigo-600 dark:text-indigo-400"
            isDark={isDark}
          />
          <MetricCard
            icon={MapPin}
            label="GEOFENCE ROUTES"
            value={summary.geofenceRelated}
            iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
            isDark={isDark}
          />
          <MetricCard
            icon={GitBranch}
            label="NON-GEOFENCE"
            value={summary.nonGeofenceRelated}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
            isDark={isDark}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading route masters...</p>
          </div>
        ) : (
          <CommonTable
            columns={columns}
            data={rows}
            onEdit={(row) => router.push(`/route-master/${row.id}`)}
            onDelete={handleDelete}
            showActions={true}
            searchPlaceholder="Search routes..."
            rowsPerPageOptions={[10, 25, 50, 100]}
            pageNo={pageNo}
            pageSize={pageSize}
            onPageChange={setPageNo}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageNo(1);
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            totalRecords={totalRecords}
            isServerSide={true}
          />
        )}

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedRoute(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Route"
          message={`Are you sure you want to delete "${selectedRoute?.routeName}"?`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default RouteMasterPage;
