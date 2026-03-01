"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Link2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import { deleteDeviceMap, getDeviceMaps } from "@/services/devicemapService";
import { getAllAccounts } from "@/services/commonServie";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface DeviceMapRow {
  id: number;
  vehicleNo: string;
  deviceNo: string;
  status: string;
  assignedAt: string;
}

interface AccountOption {
  id: number;
  value: string;
}

const STATIC_COUNTS = {
  totalAssignments: 2,
  active: 2,
  withIssues: 1,
};

const DeviceMap: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState<DeviceMapRow[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number>(1);
  const [summaryCounts, setSummaryCounts] = useState(STATIC_COUNTS);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DeviceMapRow | null>(null);

  const columns = useMemo(
    () => [
      { key: "no", label: "NO", visible: true },
      { key: "vehicleNo", label: "VEHICLE", visible: true },
      { key: "deviceNo", label: "DEVICE", visible: true },
      {
        key: "status",
        label: "STATUS",
        type: "badge" as const,
        visible: true,
      },
      {
        key: "assignedAt",
        label: "ASSIGNED ON",
        visible: true,
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString("en-IN") : "-",
      },
    ],
    [],
  );

  const normalizeStatus = (item: any): string => {
    if (typeof item?.status === "string" && item.status.trim()) {
      return item.status;
    }

    if (typeof item?.isActive === "boolean") {
      return item.isActive ? "Active" : "Inactive";
    }

    return "Active";
  };

  const mapRow = (item: any): DeviceMapRow => ({
    id: Number(item?.id ?? item?.vehicleDeviceMapId ?? item?.mapId ?? 0),
    vehicleNo: String(
      item?.vehicleNo ?? item?.vehicleNumber ?? item?.registrationNo ?? "-",
    ),
    deviceNo: String(item?.deviceNo ?? item?.deviceNumber ?? item?.imei ?? "-"),
    status: normalizeStatus(item),
    assignedAt: String(item?.assignedAt ?? item?.createdAt ?? ""),
  });

  const getListData = (response: any): any[] => {
    if (Array.isArray(response?.data?.assignments?.items)) {
      return response.data.assignments.items;
    }

    if (Array.isArray(response?.data?.pageData?.items)) {
      return response.data.pageData.items;
    }

    if (Array.isArray(response?.data?.items)) {
      return response.data.items;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    return [];
  };

  const getTotalRecords = (response: any, fallbackLength: number): number =>
    Number(
      response?.data?.assignments?.totalRecords ??
        response?.data?.pageData?.totalRecords ??
        response?.data?.totalRecords ??
        fallbackLength,
    );

  const getSummaryCounts = (response: any) => {
    const summary = response?.data?.summary;
    if (summary && typeof summary === "object") {
      return {
        totalAssignments: Number(
          summary.totalAssignments ?? STATIC_COUNTS.totalAssignments,
        ),
        active: Number(summary.active ?? STATIC_COUNTS.active),
        withIssues: Number(summary.withIssues ?? STATIC_COUNTS.withIssues),
      };
    }
    return STATIC_COUNTS;
  };

  const getAccountIdFromStorage = (): number => {
    if (typeof window === "undefined") return 1;

    try {
      const userString = localStorage.getItem("user");
      if (!userString) return 1;
      const user = JSON.parse(userString);
      const accountId = Number(user?.accountId || 1);
      return Number.isNaN(accountId) ? 1 : accountId;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return 1;
    }
  };

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

  const fetchDeviceMaps = async () => {
    try {
      setLoading(true);
      const requestParams = {
        page: pageNo,
        pageSize,
        accountId: selectedAccountId,
        search: debouncedQuery,
      } as any;
      const response = await getDeviceMaps(requestParams);

      const items = getListData(response);
      setRows(items.map(mapRow));
      setTotalRecords(getTotalRecords(response, items.length));
      setSummaryCounts(getSummaryCounts(response));
    } catch (error) {
      console.error("Error fetching device maps:", error);
      toast.error("Failed to fetch device mappings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storageAccountId = getAccountIdFromStorage();
    setSelectedAccountId(storageAccountId);
    fetchAccounts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchDeviceMaps();
  }, [pageNo, pageSize, debouncedQuery, selectedAccountId]);

  const handleEdit = (row: DeviceMapRow) => {
    router.push(`/devicemap/${row.id}`);
  };

  const handleDelete = (row: DeviceMapRow) => {
    setSelectedRow(row);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedRow) return;

    try {
      const response = await deleteDeviceMap(selectedRow.id);
      if (response?.success || response?.statusCode === 200) {
        toast.success(
          response?.message || "Device mapping deleted successfully",
        );
        fetchDeviceMaps();
      } else {
        toast.error(response?.message || "Unable to delete device mapping");
      }
    } catch (error) {
      console.error("Error deleting device map:", error);
      toast.error("Error deleting device mapping");
    } finally {
      setSelectedRow(null);
    }
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        <PageHeader
          title="Device Map"
          subtitle="Manage mapped devices and assignment health."
          breadcrumbs={[{ label: "Accounts" }, { label: "Device Map" }]}
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
            onClick={() => router.push("/devicemap/0")}
            style={{ backgroundColor: selectedColor }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Assign Device
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={Link2}
            label="TOTAL ASSIGNMENTS"
            value={summaryCounts.totalAssignments}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            isDark={isDark}
          />
          <MetricCard
            icon={ShieldCheck}
            label="ACTIVE"
            value={summaryCounts.active}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertCircle}
            label="WITH ISSUES"
            value={summaryCounts.withIssues}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
            isDark={isDark}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading device maps...</p>
          </div>
        ) : (
          <CommonTable
            columns={columns}
            data={rows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            searchPlaceholder="Search device maps..."
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
          title="Delete Device Map"
          message={`Are you sure you want to delete mapping for "${selectedRow?.vehicleNo}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default DeviceMap;
