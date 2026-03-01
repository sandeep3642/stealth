"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Smartphone, ShieldCheck, AlertCircle, Wifi } from "lucide-react";
import { SimItem, SimSummary } from "@/interfaces/sim.interface";
import { getSims, deleteSim } from "@/services/simservice";

// ── Component ──────────────────────────────────────────────────────────────
const SimMaster: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<SimItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summaryData, setSummaryData] = useState<SimSummary>({
    totalSims: 0,
    enabled: 0,
    disabled: 0,
    activeCarriers: 0,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [simToDelete, setSimToDelete] = useState<SimItem | null>(null);

  const columns = [
    {
      key: "iccid",
      label: "ICCID Identification",
      visible: true,
      render: (value: string, row: SimItem) => (
        <div>
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {value}
          </span>
          <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide font-medium">
            {row.carrier}
          </p>
        </div>
      ),
    },
    {
      key: "msisdn",
      label: "Line Number (MSISDN)",
      visible: true,
    },
    {
      key: "status",
      label: "Connectivity Status",
      visible: true,
      type: "badge" as const,
    },
    {
      key: "contractExpiry",
      label: "Contract Expiry",
      visible: true,
      type: "date" as const,
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      visible: true,
      type: "date" as const,
    },
  ];

  const fetchSims = async () => {
    try {
      const response = await getSims(pageNo, pageSize);
      console.log("sim response", response);

      const simsData = response.data?.sims;
      const summary = response.data?.summary;

      if (simsData?.items?.length) {
        const mappedData = simsData.items.map((s: any) => ({
          simId: s.simId,
          iccid: s.iccid,
          msisdn: s.msisdn || "",
          imsiCode: s.imsi || "",
          carrier: s.networkProviderId || "",
          status: s.statusKey,
          contractExpiry: s.expiryAt || null,
          updatedAt: s.updatedAt || s.createdAt || null,
        }));

        setSummaryData({
          totalSims: summary.totalSims,
          enabled: summary.active,
          // disabled: summary.inactive,
          disabled: summary.expired,
          activeCarriers: summary.active,
        });

        setData(mappedData);
        setTotalRecords(simsData.totalRecords);
      } else {
        toast.error("No SIMs found");
      }
    } catch (error) {
      console.error("Error fetching SIMs:", error);
      toast.error("An error occurred while loading SIMs");
    }
  };

  useEffect(() => {
    fetchSims();
  }, [pageNo, pageSize]);

  const handleEdit = (row: SimItem) => {
    router.push(`/sim-master/${row.simId}`);
  };

  const handleDelete = (row: SimItem) => {
    setSimToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!simToDelete) return;
    try {
      const response = await deleteSim(simToDelete.simId);
      if (response && response.statusCode === 200) {
        toast.success("SIM removed from registry!");
        fetchSims();
      } else {
        toast.error(response.message || "Failed to delete SIM");
      }
    } catch (error) {
      console.error("Error deleting SIM:", error);
      toast.error("An error occurred while deleting.");
    } finally {
      setSimToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="SIM Lifecycle Ledger"
          subtitle="Manage global SIM inventory, carrier contracts, and MSISDN mappings."
          breadcrumbs={[
            { label: "Fleet" },
            { label: "Telematics" },
            { label: "SIM Master" },
          ]}
          showButton={true}
          buttonText="Provision SIM"
          buttonRoute="/sim-master/0"
          showExportButton={true}
          ExportbuttonText="Export"
          onExportClick={() => toast.info("Export coming soon!")}
          showFilterButton={false}
        />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Smartphone}
            label="Total SIMs"
            value={summaryData.totalSims}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={ShieldCheck}
            label="Enabled"
            value={summaryData.enabled}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertCircle}
            label="Disabled"
            value={summaryData.disabled}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            isDark={isDark}
          />
          <MetricCard
            icon={Wifi}
            label="Active Carriers"
            value={summaryData.activeCarriers}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            isDark={isDark}
          />
        </div>

        {/* Table */}
        <CommonTable
          columns={columns}
          data={data}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          searchPlaceholder="Search by ICCID or MSISDN..."
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          defaultRowsPerPage={10}
          pageNo={pageNo}
          pageSize={pageSize}
          onPageChange={(page) => setPageNo(page)}
          totalRecords={totalRecords}
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
            setSimToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Remove SIM"
          message={`Are you sure you want to remove SIM "${simToDelete?.iccid}" from the registry? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default SimMaster;
