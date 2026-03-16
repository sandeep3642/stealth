"use client";

import { AlertTriangle, CheckCircle, UserRound, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MetricCard } from "@/components/CommonCard";
import CommonTable from "@/components/CommonTable";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { FormRights } from "@/interfaces/account.interface";
import { deleteDriver, getDrivers } from "@/services/driverService";

interface DriverRow {
  driverId: number;
  accountId?: number;
  name?: string;
  mobile?: string;
  licenseNumber?: string;
  licenceNumber?: string;
  licenseExpiry?: string;
  licenceExpiry?: string;
  isActive?: boolean;
}

const Drivers: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const t = useTranslations("pages.driver.list");
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [categoryRights, setCategoryRights] = useState<FormRights | null>(null);
  const [cardCounts, setCardCounts] = useState({
    totalDrivers: 0,
    activeDrivers: 0,
    inactiveDrivers: 0,
    licenseExpiringSoon: 0,
  });

  // Confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<DriverRow | null>(
    null,
  );

  const columns = [
    {
      key: "driverId",
      label: t("table.driverId"),
      visible: true,
    },
    {
      key: "name",
      label: t("table.driverName"),
      visible: true,
    },
    {
      key: "mobile",
      label: t("table.mobile"),
      visible: true,
    },
    {
      key: "licenseNumber",
      label: t("table.licenceNo"),
      visible: true,
    },
    {
      key: "licenseExpiry",
      label: t("table.licenceExpiry"),
      visible: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      key: "isActive",
      label: t("table.status"),
      type: "badge" as const,
      visible: true,
    },
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getDrivers(pageNo, pageSize, searchQuery);
      console.log(response);
      if (response.success) {
        const driverList = response?.data?.drivers?.items || [];
        setCategories(driverList);
        setTotalRecords(
          response?.data?.drivers?.totalRecords || driverList.length,
        );

        const summary = response?.data?.summary;

        const totalDrivers = summary?.totalDrivers ?? driverList.length;
        const activeDrivers =
          summary?.active ??
          driverList.filter((driver: DriverRow) => driver?.isActive).length;
        const inactiveDrivers =
          summary?.inactive ??
          driverList.filter((driver: DriverRow) => !driver?.isActive).length;
        const licenseExpiringSoon = summary?.licenseExpiringSoon ?? 0;

        setCardCounts({
          totalDrivers,
          activeDrivers,
          inactiveDrivers,
          licenseExpiringSoon,
        });
      } else {
        console.error("Failed to fetch categories:", response.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: DriverRow) => {
    router.push(`/driver/${row.driverId}`);
  };

  // Show confirmation dialog instead of browser confirm
  const handleDelete = (row: DriverRow) => {
    setCategoryToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  // Actual delete operation after confirmation
  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await deleteDriver(categoryToDelete.driverId);
      if (response.success) {
        toast.success(t("toast.deleted"));
        fetchCategories(); // Refresh list
      } else {
        toast.error(`${t("toast.deleteFailed")}: ${response.message}`);
      }
    } catch (error) {
      toast.error(t("toast.deleteError"));
      console.error("Error deleting driver:", error);
    } finally {
      setCategoryToDelete(null);
    }
  };

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  useEffect(() => {
    fetchCategories();
  }, [pageNo, pageSize, searchQuery]);

  useEffect(() => {
    function getPermissionsList() {
      try {
        if (typeof window === "undefined") return;
        const storedPermissions = localStorage.getItem("permissions");

        if (storedPermissions) {
          const parsedPermissions = JSON.parse(storedPermissions);

          const rights = parsedPermissions.find(
            (val: { formName: string }) => val.formName === "Categories",
          );

          if (rights) {
            setCategoryRights(rights);
          } else {
            console.warn('No matching rights found for "Categories".');
          }
        } else {
          console.warn("No permissions found in localStorage.");
        }
      } catch (error) {
        console.error("Error fetching permissions from localStorage:", error);
      }
    }

    getPermissionsList();
  }, []);

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          breadcrumbs={[
            { label: t("breadcrumbs.fleet") },
            { label: t("breadcrumbs.current") },
          ]}
          showButton={true}
          buttonText={t("addButton")}
          buttonRoute="/driver/0"
          // showWriteButton={driverRights?.canWrite || false}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={UserRound}
            label={t("metrics.totalDrivers")}
            value={cardCounts.totalDrivers}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            isDark={isDark}
          />
          <MetricCard
            icon={CheckCircle}
            label={t("metrics.activeDrivers")}
            value={cardCounts.activeDrivers}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            isDark={isDark}
          />
          <MetricCard
            icon={XCircle}
            label={t("metrics.inactiveDrivers")}
            value={cardCounts.inactiveDrivers}
            iconBgColor="bg-red-100 dark:bg-red-900/30"
            iconColor="text-red-600 dark:text-red-400"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertTriangle}
            label={t("metrics.licenseExpiringSoon")}
            value={cardCounts.licenseExpiringSoon}
            iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
            iconColor="text-indigo-600 dark:text-indigo-400"
            isDark={isDark}
          />
        </div>
        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>{t("loading")}</p>
          </div>
        ) : (
          <CommonTable
            columns={columns}
            data={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            searchPlaceholder={t("searchPlaceholder")}
            rowsPerPageOptions={[10, 25, 50, 100]}
            defaultRowsPerPage={10}
            pageNo={pageNo}
            pageSize={pageSize}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            totalRecords={totalRecords}
            isServerSide={true}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
          }}
          onConfirm={confirmDelete}
          title={t("deleteDialog.title")}
          message={t("deleteDialog.message", {
            name: categoryToDelete?.name || "-",
          })}
          confirmText={t("deleteDialog.confirm")}
          cancelText={t("deleteDialog.cancel")}
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default Drivers;
