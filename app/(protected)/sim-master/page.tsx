"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("pages.simMaster.list");

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
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
      label: t("table.iccid"),
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
      label: t("table.msisdn"),
      visible: true,
    },
    {
      key: "status",
      label: t("table.status"),
      visible: true,
      type: "badge" as const,
    },
    {
      key: "contractExpiry",
      label: t("table.contractExpiry"),
      visible: true,
      type: "date" as const,
    },
    {
      key: "updatedAt",
      label: t("table.lastUpdated"),
      visible: true,
      type: "date" as const,
    },
  ];

  const fetchSims = async () => {
    try {
      const response = await getSims(pageNo, pageSize, debouncedQuery);
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
        // toast.error("No SIMs found");
      }
    } catch (error) {
      console.error("Error fetching SIMs:", error);
      toast.error(t("toast.loadError"));
    }
  };

  useEffect(() => {
    fetchSims();
  }, [pageNo, pageSize, debouncedQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

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
        toast.success(response.message || t("toast.removed"));
        fetchSims();
      } else {
        toast.error(response.message || t("toast.deleteFailed"));
      }
    } catch (error) {
      console.error("Error deleting SIM:", error);
      toast.error(t("toast.deleteError"));
    } finally {
      setSimToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          breadcrumbs={[{ label: t("breadcrumbs.fleet") }, { label: t("breadcrumbs.current") }]}
          showButton={true}
          buttonText={t("addButton")}
          buttonRoute="/sim-master/0"
          showExportButton={true}
          ExportbuttonText={t("export")}
          onExportClick={() => toast.info(t("toast.exportSoon"))}
          showFilterButton={false}
        />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Smartphone}
            label={t("metrics.totalSims")}
            value={summaryData.totalSims}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={ShieldCheck}
            label={t("metrics.enabled")}
            value={summaryData.enabled}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertCircle}
            label={t("metrics.disabled")}
            value={summaryData.disabled}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            isDark={isDark}
          />
          <MetricCard
            icon={Wifi}
            label={t("metrics.activeCarriers")}
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
          searchPlaceholder={t("searchPlaceholder")}
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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSimToDelete(null);
          }}
          onConfirm={confirmDelete}
          title={t("delete.title")}
          message={t("delete.message", { iccid: simToDelete?.iccid || "" })}
          confirmText={t("delete.confirm")}
          cancelText={t("delete.cancel")}
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default SimMaster;
