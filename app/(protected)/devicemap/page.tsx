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
import { useTranslations } from "next-intl";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useTheme } from "@/context/ThemeContext";
import { deleteDeviceMap, getDeviceMaps } from "@/services/devicemapService";
import { getAllAccounts, getFormRightForPath } from "@/services/commonServie";
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
  const router = useRouter();
  const t = useTranslations("pages.devicemap.list");
  const pageRight = getFormRightForPath("/devicemap");
  const canRead = pageRight ? Boolean(pageRight.canRead) : true;

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState<DeviceMapRow[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number>(1);
  const [summaryCounts, setSummaryCounts] = useState(STATIC_COUNTS);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DeviceMapRow | null>(null);

  const columns = useMemo(
    () => [
      { key: "no", label: t("table.no"), visible: true },
      { key: "vehicleNo", label: t("table.vehicle"), visible: true },
      { key: "deviceNo", label: t("table.device"), visible: true },
      {
        key: "status",
        label: t("table.status"),
        type: "badge" as const,
        visible: true,
      },
      {
        key: "assignedAt",
        label: t("table.assignedOn"),
        visible: true,
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString("en-IN") : "-",
      },
    ],
    [t],
  );

  const normalizeStatus = (item: any): string => {
    if (typeof item?.status === "string" && item.status.trim()) {
      const status = item.status.trim().toLowerCase();
      if (status === "active") return t("status.active");
      if (status === "inactive") return t("status.inactive");
      return item.status;
    }

    if (typeof item?.isActive === "boolean") {
      return item.isActive ? t("status.active") : t("status.inactive");
    }

    return t("status.active");
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
      if (isInitialLoad) setLoading(true);
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
      toast.error(t("toast.fetchFailed"));
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
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
          response?.message || t("toast.deleted"),
        );
        fetchDeviceMaps();
      } else {
        toast.error(response?.message || t("toast.deleteFailed"));
      }
    } catch (error) {
      console.error("Error deleting device map:", error);
      toast.error(t("toast.deleteError"));
    } finally {
      setSelectedRow(null);
    }
  };

  if (!canRead) {
    return (
      <div className={`${isDark ? "dark" : ""} mt-10`}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground">
            {t("noReadPermission")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          breadcrumbs={[
            { label: t("breadcrumbs.fleet") },
            { label: t("breadcrumbs.current") },
          ]}
          showButton={true}
          buttonText={t("addButton")}
          buttonIcon={<Plus className="w-4 h-4" />}
          buttonRoute="/devicemap/0"
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
                <option value={selectedAccountId}>{t("allAccounts")}</option>
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
            icon={Link2}
            label={t("metrics.totalAssignments")}
            value={summaryCounts.totalAssignments}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            isDark={isDark}
          />
          <MetricCard
            icon={ShieldCheck}
            label={t("metrics.active")}
            value={summaryCounts.active}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertCircle}
            label={t("metrics.withIssues")}
            value={summaryCounts.withIssues}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
            isDark={isDark}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>{t("loading")}</p>
          </div>
        ) : (
          <CommonTable
            columns={columns}
            data={rows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            searchPlaceholder={t("searchPlaceholder")}
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
          title={t("deleteTitle")}
          message={t("deleteMessage", { name: selectedRow?.vehicleNo || "" })}
          confirmText={t("confirmDelete")}
          cancelText={t("cancel")}
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default DeviceMap;
