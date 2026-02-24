"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { FormRights } from "@/interfaces/account.interface";
import { toast } from "react-toastify";
import { deleteDriver, getDrivers } from "@/services/driverService";
import { MetricCard } from "@/components/CommonCard";
import { AlertTriangle, Building2, CheckCircle, UserRound } from "lucide-react";

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
    licenceIssues: 0,
    multiTenantOrgs: 0,
  });

  // Confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<DriverRow | null>(
    null,
  );

  const columns = [
    {
      key: "driverId",
      label: "DRIVER ID",
      visible: true,
    },
    {
      key: "name",
      label: "DRIVER NAME",
      visible: true,
    },
    {
      key: "mobile",
      label: "MOBILE",
      visible: true,
    },
    {
      key: "licenseNumber",
      label: "LICENCE NO.",
      visible: true,
    },
    {
      key: "licenseExpiry",
      label: "LICENCE EXPIRY",
      visible: true,
      render: (value: string) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      key: "isActive",
      label: "STATUS",
      type: "badge" as const,
      visible: true,
      render: (value: boolean) => (value ? "Active" : "Inactive"),
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
        setTotalRecords(response?.data?.drivers?.totalRecords || driverList.length);

        const summary = response?.data?.summary;

        const totalDrivers = summary?.totalDrivers ?? driverList.length;
        const activeDrivers =
          summary?.active ??
          driverList.filter((driver: DriverRow) => driver?.isActive).length;
        const licenceIssues =
          summary?.licenseExpiringSoon ??
          summary?.licenseIssues ??
          summary?.licenceIssues ??
          0;
        const multiTenantOrgs = new Set(driverList.map((driver: DriverRow) => driver?.accountId).filter(Boolean)).size;

        setCardCounts({
          totalDrivers,
          activeDrivers,
          licenceIssues,
          multiTenantOrgs,
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
        toast.success("Driver deleted successfully!");
        fetchCategories(); // Refresh list
      } else {
        toast.error(`Failed to delete: ${response.message}`);
      }
    } catch (error) {
      toast.error("Error deleting driver");
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
          title="Personnal Registry"
          subtitle="Register Drivers"
          breadcrumbs={[{ label: "fleet" }, { label: "driver" }]}
          showButton={true}
          buttonText="Add Driver"
          buttonRoute="/driver/0"
        // showWriteButton={driverRights?.canWrite || false}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={UserRound}
            label="TOTAL DRIVERS"
            value={cardCounts.totalDrivers}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            isDark={isDark}
          />
          <MetricCard
            icon={CheckCircle}
            label="ACTIVE STATUS"
            value={cardCounts.activeDrivers}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertTriangle}
            label="LICENCE ISSUES"
            value={cardCounts.licenceIssues}
            iconBgColor="bg-red-100 dark:bg-red-900/30"
            iconColor="text-red-600 dark:text-red-400"
            isDark={isDark}
          />
          <MetricCard
            icon={Building2}
            label="MULTI-TENANT ORG"
            value={cardCounts.multiTenantOrgs}
            iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
            iconColor="text-indigo-600 dark:text-indigo-400"
            isDark={isDark}
          />
        </div>
        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading drivers...</p>
          </div>
        ) : (

          <CommonTable
            columns={columns}
            data={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            searchPlaceholder="Search drivers..."
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
          title="Delete Driver"
          message={`Are you sure you want to delete the driver "${categoryToDelete?.name || "-"}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default Drivers;
