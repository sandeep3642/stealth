"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Link2,
  MapPin,
  Plus,
} from "lucide-react";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import { getAllAccounts } from "@/services/commonServie";
import {
  deleteVehicleGeofence,
  getVehicleGeofences,
} from "@/services/vehicleGeofenceService";
import type {
  VehicleGeofenceItem,
  VehicleGeofenceRow,
  VehicleGeofenceSummary,
} from "@/interfaces/vehicleGeofence.interface";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface AccountOption {
  id: number;
  value: string;
}

const EMPTY_SUMMARY: VehicleGeofenceSummary = {
  totalAssignments: 0,
  active: 0,
  inactive: 0,
};

const VehicleGeofencePage: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState<VehicleGeofenceRow[]>([]);
  const [summary, setSummary] = useState<VehicleGeofenceSummary>(EMPTY_SUMMARY);

  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number>(1);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<VehicleGeofenceRow | null>(
    null,
  );

  const columns = useMemo(
    () => [
      { key: "no", label: "NO", visible: true },
      { key: "vehicleNo", label: "VEHICLE", visible: true },
      { key: "geofenceName", label: "GEOFENCE", visible: true },
      { key: "geometryType", label: "GEOMETRY", visible: true },
      { key: "remarks", label: "REMARKS", visible: true },
      {
        key: "status",
        label: "STATUS",
        type: "badge" as const,
        visible: true,
      },
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

  const getAccountIdFromStorage = (): number => {
    if (typeof window === "undefined") return 1;

    try {
      const userString = localStorage.getItem("user");
      if (!userString) return 1;
      const user = JSON.parse(userString);
      const accountId = Number(user?.accountId || 1);
      return Number.isNaN(accountId) ? 1 : accountId;
    } catch (error) {
      console.error("Failed to parse user account:", error);
      return 1;
    }
  };

  const mapRow = (item: VehicleGeofenceItem): VehicleGeofenceRow => ({
    id: Number(item?.id || 0),
    vehicleNo: String(item?.vehicleNo || "-"),
    geofenceName: String(item?.geofenceName || "-"),
    geometryType: String(item?.geometryType || "-"),
    remarks: String(item?.remarks || "-"),
    status: item?.isActive ? "Active" : "Inactive",
    createdAt: String(item?.createdAt || ""),
  });

  const fetchAccounts = async () => {
    try {
      const response = await getAllAccounts();
      if (response?.statusCode === 200 && Array.isArray(response?.data)) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchVehicleGeofences = async () => {
    try {
      setLoading(true);
      const response = await getVehicleGeofences({
        page: pageNo,
        pageSize,
        accountId: selectedAccountId,
        search: debouncedQuery,
      });

      const listData = response?.data?.assignments;
      const listItems = Array.isArray(listData?.items) ? listData.items : [];
      const summaryData = response?.data?.summary || EMPTY_SUMMARY;

      setRows(listItems.map(mapRow));
      setSummary({
        totalAssignments: Number(summaryData?.totalAssignments || 0),
        active: Number(summaryData?.active || 0),
        inactive: Number(summaryData?.inactive || 0),
      });
      setTotalRecords(Number(listData?.totalRecords || listItems.length));
    } catch (error) {
      console.error("Error fetching vehicle geofence list:", error);
      toast.error("Failed to fetch vehicle geofence assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const accountId = getAccountIdFromStorage();
    setSelectedAccountId(accountId);
    fetchAccounts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchVehicleGeofences();
  }, [pageNo, pageSize, debouncedQuery, selectedAccountId]);

  const handleEdit = (row: VehicleGeofenceRow) => {
    router.push(`/vehicle-geofence/${row.id}`);
  };

  const handleDelete = (row: VehicleGeofenceRow) => {
    setSelectedRow(row);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRow) return;

    try {
      const response = await deleteVehicleGeofence(selectedRow.id);
      if (response?.success || response?.statusCode === 200) {
        toast.success(response?.message || "Assignment deleted successfully");
        fetchVehicleGeofences();
      } else {
        toast.error(response?.message || "Unable to delete assignment");
      }
    } catch (error) {
      console.error("Error deleting vehicle geofence assignment:", error);
      toast.error("Error deleting assignment");
    } finally {
      setSelectedRow(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        <PageHeader
          title="Vehicle Geofence Map"
          subtitle="Manage vehicle and geofence assignment mappings."
          breadcrumbs={[
            { label: "Assignments" },
            { label: "Vehicle Geofence" },
          ]}
          showButton={false}
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
              {accounts.length === 0 && (
                <option value={selectedAccountId}>All Accounts</option>
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

          <button
            type="button"
            onClick={() => router.push("/vehicle-geofence/0")}
            style={{ backgroundColor: selectedColor }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Assign Vehicle Geofence
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={Link2}
            label="TOTAL ASSIGNMENTS"
            value={summary.totalAssignments}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            isDark={isDark}
          />
          <MetricCard
            icon={MapPin}
            label="ACTIVE"
            value={summary.active}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertCircle}
            label="INACTIVE"
            value={summary.inactive}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
            isDark={isDark}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading vehicle geofence assignments...</p>
          </div>
        ) : (
          <CommonTable
            columns={columns}
            data={rows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            searchPlaceholder="Search assignments..."
            rowsPerPageOptions={[10, 25, 50, 100]}
            defaultRowsPerPage={10}
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
          />
        )}

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedRow(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Assignment"
          message={`Are you sure you want to delete "${selectedRow?.vehicleNo}" mapping? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default VehicleGeofencePage;
