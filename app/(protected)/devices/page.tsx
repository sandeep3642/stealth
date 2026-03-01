"use client";

import {
  AlertCircle,
  Building2,
  Camera,
  ChevronDown,
  Cpu,
  Monitor,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { MetricCard } from "@/components/CommonCard";
import CommonTable from "@/components/CommonTable";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import PageHeader from "@/components/PageHeader";
import { useColor } from "@/context/ColorContext";
import { useTheme } from "@/context/ThemeContext";
import { getAllAccounts } from "@/services/commonServie";
import { deleteDevice, getdevices } from "@/services/deviceService";

interface Device {
  id: string;
  serialId: string;
  category: string;
  type: string;
  network: string;
  networkSub?: string;
  status: string;
  firmware: string;
  lastUpdated: string;
}

interface AccountOption {
  id: number;
  value: string;
}

const categoryIcon = (cat: string) => {
  const cls = "w-4 h-4 inline-block mr-1.5";
  const normalized = String(cat).toUpperCase();

  if (normalized.includes("GPS")) {
    return <Wifi className={cls} style={{ color: "#6366f1" }} />;
  }
  if (normalized.includes("ADAS") || normalized.includes("DMS")) {
    return <Cpu className={cls} style={{ color: "#f59e0b" }} />;
  }
  return <Camera className={cls} style={{ color: "#10b981" }} />;
};

const DeviceRegistry: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number>(1);
  const [summary, setSummary] = useState({
    totalDevices: 0,
    inService: 0,
    outOfService: 0,
  });

  const columns = useMemo(
    () => [
      { key: "no", label: "No", visible: true },
      {
        key: "id",
        label: "Device Identity",
        visible: true,
        render: (value: string, row: Device) => (
          <div>
            <p
              className="font-semibold cursor-pointer hover:underline"
              style={{ color: selectedColor }}
              onClick={() => router.push(`/devices/${value}`)}
            >
              {row.serialId}
            </p>
          </div>
        ),
      },
      {
        key: "category",
        label: "Category",
        visible: true,
        render: (value: string) => (
          <span className={isDark ? "text-gray-300" : "text-gray-700"}>
            {categoryIcon(value)}
            {value}
          </span>
        ),
      },
      { key: "type", label: "Type", visible: true },
      {
        key: "network",
        label: "Network",
        visible: true,
        render: (value: string, row: Device) => (
          <div>
            <span
              className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
            >
              {value}
            </span>
            {row.networkSub && (
              <p
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {row.networkSub}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        visible: true,
        render: (value: string) => {
          const normalized = String(value || "OUT OF SERVICE").toUpperCase();
          const map: Record<string, string> = {
            ACTIVE: "bg-green-100 text-green-700",
            "IN SERVICE": "bg-blue-100 text-blue-700",
            "OUT OF SERVICE": "bg-red-100 text-red-700",
          };

          return (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded ${map[normalized] || map["OUT OF SERVICE"]}`}
            >
              {normalized}
            </span>
          );
        },
      },
      {
        key: "firmware",
        label: "Firmware",
        visible: true,
        render: (value: string) => (
          <span
            className={`font-mono text-xs px-2 py-0.5 rounded ${
              isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-500"
            }`}
          >
            {value}
          </span>
        ),
      },
      { key: "lastUpdated", label: "Last Updated", visible: true },
    ],
    [isDark, router, selectedColor],
  );

  const getAccountIdFromStorage = () => {
    if (typeof window === "undefined") return 1;

    const selectedId = Number(localStorage.getItem("accountId") || 0);
    if (selectedId > 0) return selectedId;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userAccountId = Number(user?.accountId || 1);
      return Number.isNaN(userAccountId) ? 1 : userAccountId;
    } catch (error) {
      console.error("Failed to parse user account:", error);
      return 1;
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await getAllAccounts();
      console.log(response);
      if (response?.statusCode === 200 && Array.isArray(response?.data)) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await getdevices({
        page: pageNo,
        pageSize,
        accountId: selectedAccountId,
        search: debouncedQuery,
      });
      console.log("response", response);
      const listData =
        response?.data?.devices ||
        response?.data?.pageData ||
        response?.data ||
        {};
      const items = Array.isArray(listData?.items)
        ? listData.items
        : Array.isArray(response?.data)
          ? response.data
          : [];
      const summaryData = response?.data?.summary || {};

      const mappedDevices = items.map((d: any) => ({
        id: String(d?.id || ""),
        serialId: d?.deviceNo || d?.deviceImeiOrSerial || "-",
        category: d?.deviceTypeName || d?.deviceCategory || "GPS",
        type: d?.deviceTypeName || d?.displayName || "Tracker",
        network: d?.manufacturerName || d?.manufacturer || "N/A",
        networkSub: d?.deviceImeiOrSerial || "",
        status: String(d?.deviceStatus || "OUT OF SERVICE")
          .replace(/_/g, " ")
          .toUpperCase(),
        firmware: d?.firmwareVersion || "N/A",
        lastUpdated: d?.updatedAt || d?.createdAt || "",
      }));

      setDevices(mappedDevices);
      setSummary({
        totalDevices: Number(
          summaryData?.totalDevices ||
            listData?.totalRecords ||
            mappedDevices.length ||
            0,
        ),
        inService: Number(summaryData?.inService || 0),
        outOfService: Number(summaryData?.outOfService || 0),
      });
      setTotalRecords(
        Number(listData?.totalRecords || mappedDevices.length || 0),
      );
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast.error("An error occurred while loading devices");
      setDevices([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: Device) => {
    router.push(`/devices/${row.id}`);
  };

  const handleDelete = (row: Device) => {
    setDeviceToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete) return;

    try {
      const response = await deleteDevice(deviceToDelete.id);
      if (response?.success && response?.statusCode === 200) {
        toast.success("Device removed successfully");
        fetchDevices();
      } else {
        toast.error(response?.message || "Failed to delete device.");
      }
    } catch (error) {
      console.error("Error deleting device:", error);
      toast.error("An error occurred while deleting.");
    } finally {
      setDeviceToDelete(null);
      setIsDeleteDialogOpen(false);
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
    fetchDevices();
  }, [pageNo, pageSize, debouncedQuery, selectedAccountId]);

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="Device Registry"
          subtitle="Full traceability of device identity, connectivity, and provisioning status."
          breadcrumbs={[{ label: "Fleet" }, { label: "Device Registry" }]}
          showButton={true}
          buttonText="Provision New Device"
          buttonRoute="/devices/0"
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
                const nextAccountId = Number(e.target.value);
                setSelectedAccountId(nextAccountId);
                localStorage.setItem("accountId", String(nextAccountId));
                setPageNo(1);
              }}
              className={`w-full appearance-none pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                isDark
                  ? "bg-card border-gray-700 text-foreground"
                  : "bg-white border-gray-200 text-gray-900"
              }`}
            >
              {accounts.length === 0 && (
                <option value={selectedAccountId}>Select Account</option>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={Monitor}
            label="Total Devices"
            value={summary.totalDevices}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={ShieldCheck}
            label="In Service"
            value={summary.inService}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertCircle}
            label="Out of Service"
            value={summary.outOfService}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            isDark={isDark}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading devices...</p>
          </div>
        ) : (
          <CommonTable
            columns={columns}
            data={devices}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            searchPlaceholder="Search devices..."
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
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
            setDeviceToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Remove Device"
          message={`Are you sure you want to remove device "${deviceToDelete?.serialId || deviceToDelete?.id}" from the registry? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default DeviceRegistry;
