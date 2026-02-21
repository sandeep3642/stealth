"use client";

import React, { useState } from "react";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { useColor } from "@/context/ColorContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import {
  Monitor,
  ShieldCheck,
  AlertCircle,
  Wifi,
  Camera,
  Cpu,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Device {
  id: string;
  serialId: string;
  category: "GPS" | "ADAS / DMS" | "CAMERA";
  type: string;
  network: string;
  networkSub?: string;
  status: "ACTIVE" | "IN SERVICE" | "OUT_OF_SERVICE";
  firmware: string;
  lastUpdated: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_DEVICES: Device[] = [
  {
    id: "867530912345678",
    serialId: "GPS-001",
    category: "GPS",
    type: "GPS Tracker",
    network: "Airtel",
    networkSub: "9876543210",
    status: "ACTIVE",
    firmware: "v2.1.4",
    lastUpdated: "2024-03-10 10:00",
  },
  {
    id: "ADAS-UNIT-9922",
    serialId: "ADAS-01",
    category: "ADAS / DMS",
    type: "ADAS/DMS Unit",
    network: "N/A (Local / IP)",
    status: "IN SERVICE",
    firmware: "v1.8.2",
    lastUpdated: "2024-03-12 14:30",
  },
  {
    id: "CAM-IND-000123",
    serialId: "CAM-882",
    category: "CAMERA",
    type: "Dashcam",
    network: "N/A (Local / IP)",
    status: "OUT_OF_SERVICE",
    firmware: "v3.0.1",
    lastUpdated: "2024-03-15 09:15",
  },
];

// ── Category Icon ──────────────────────────────────────────────────────────
const categoryIcon = (cat: Device["category"]) => {
  const cls = "w-4 h-4 inline-block mr-1.5";
  if (cat === "GPS")
    return <Wifi className={cls} style={{ color: "#6366f1" }} />;
  if (cat === "ADAS / DMS")
    return <Cpu className={cls} style={{ color: "#f59e0b" }} />;
  return <Camera className={cls} style={{ color: "#10b981" }} />;
};

// ── Component ──────────────────────────────────────────────────────────────
const DeviceRegistry: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  // Summary counts
  const total = MOCK_DEVICES.length;
  const inService = MOCK_DEVICES.filter(
    (d) => d.status === "ACTIVE" || d.status === "IN SERVICE",
  ).length;
  const outOfService = MOCK_DEVICES.filter(
    (d) => d.status === "OUT_OF_SERVICE",
  ).length;

  // ── Table columns — same pattern as Vehicles ────────────────────────────
  const columns = [
    {
      key: "id",
      label: "Device Identity",
      visible: true,
      render: (value: string, row: Device) => (
        <div>
          <span
            className="font-semibold cursor-pointer hover:underline"
            style={{ color: selectedColor }}
            onClick={() => router.push(`/devices/${value}`)}
          >
            {value}
          </span>
          <p
            className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
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
      render: (value: Device["category"]) => (
        <span className={isDark ? "text-gray-300" : "text-gray-700"}>
          {categoryIcon(value)}
          {value}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      visible: true,
    },
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
      render: (value: Device["status"]) => {
        const map: Record<Device["status"], string> = {
          ACTIVE: "bg-green-100 text-green-700",
          "IN SERVICE": "bg-blue-100 text-blue-700",
          OUT_OF_SERVICE: "bg-red-100 text-red-700",
        };
        return (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${map[value]}`}
          >
            {value}
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
    {
      key: "lastUpdated",
      label: "Last Updated",
      visible: true,
    },
  ];

  // ── Handlers ────────────────────────────────────────────────────────────
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
      // TODO: replace with real API call
      toast.success(`Device "${deviceToDelete.id}" removed successfully!`);
    } catch {
      toast.error("An error occurred while deleting.");
    } finally {
      setDeviceToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        {/* Page Header */}
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

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={Monitor}
            label="Total Devices"
            value={total}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={ShieldCheck}
            label="In Service"
            value={inService}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertCircle}
            label="Out of Service"
            value={outOfService}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            isDark={isDark}
          />
        </div>

        {/* Table */}
        <CommonTable
          columns={columns}
          data={MOCK_DEVICES}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          searchPlaceholder="Search devices..."
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          defaultRowsPerPage={10}
          pageNo={pageNo}
          pageSize={pageSize}
          onPageChange={(page) => setPageNo(page)}
          totalRecords={MOCK_DEVICES.length}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNo(1);
          }}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeviceToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Remove Device"
          message={`Are you sure you want to remove device "${deviceToDelete?.id}" from the registry? This action cannot be undone.`}
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
