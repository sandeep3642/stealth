"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { getAccounts } from "@/services/accountService";
import { AccountData } from "@/interfaces/account.interface";
import { Users as UsersIcon, CheckCircle, Lock, Shield } from "lucide-react";
import { toast } from "react-toastify";
import MultiSelect from "@/components/MultiSelect";
import { getUsers, deleteUser } from "@/services/userService";
import { UserItem } from "@/interfaces/user.interface";

import { useRouter } from "next/navigation";

const Users: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  type OptionType = {
    label: string;
    value: string;
  };
  const [appliedFilters, setAppliedFilters] = useState<{
    roles: OptionType[];
    statuses: OptionType[];
  }>({
    roles: [],
    statuses: [],
  });
  const [activeFilter, setActiveFilter] = useState<"role" | "status" | null>(
    null,
  );
  const [summaryData, setSummaryData] = useState({
    totalUsers: 0,
    active: 0,
    suspendedOrLocked: 0,
    twoFactorEnabled: 0,
  });
  const [totalReconrds, setTotalRecords] = useState(0);

  const columns = [
    { key: "fullName", label: "Full Name", visible: true },
    { key: "email", label: "Email", visible: true },
    { key: "roleName", label: "Role", visible: true },
    { key: "accountName", label: "Account", visible: true },
    { key: "status", label: "Status", type: "badge" as const, visible: true },
    {
      key: "twoFactorEnabled",
      label: "2FA",
      visible: true,
      render: (value: boolean) => {
        return value ? "Enabled" : "Disabled";
      },
    },
    {
      key: "lastLoginAt",
      label: "Last Login",
      visible: true,
      type: "date" as const,
    },
  ];

  const roleOptions = [
    { label: "Super Admin", value: "SUPER_ADMIN" },
    { label: "Account Manager", value: "ACCOUNT_MANAGER" },
    { label: "Viewer", value: "VIEWER" },
  ];

  const statusOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Locked", value: "LOCKED" },
    { label: "Suspended", value: "SUSPENDED" },
  ];

  const [data, setData] = useState<UserItem[]>([]);

  const handleEdit = (row: UserItem) => {
    router.push(`/users/${row.userId}`);
  };

  const handleDelete = async (row: UserItem) => {
    const response = await deleteUser(row.userId);

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      fetchUsers();
    } else {
      toast.error(response.message);
    }
  };

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  const handleExport = () => {
    console.log("Exporting data...");
    toast.info("Export functionality coming soon!");
  };

  const handleFilter = () => {
    setIsFilterOpen((prev) => !prev); // toggle
  };
  const toggleFilter = (type: "role" | "status") => {
    setActiveFilter((prev) => (prev === type ? null : type));
  };
  const handleResetFilters = () => {
    setAppliedFilters({ roles: [], statuses: [] });
    setActiveFilter(null);
    toast.info("Filters reset");
    // Optionally: call API or refresh table with no filters
  };

  const handleApplyFilters = (filters: { roles: any[]; statuses: any[] }) => {
    // Here you would normally:
    // 1. Call API with filters
    // 2. Or filter locally if data is already loaded
    console.log("Applying filters:", {
      roles: filters.roles.map((r) => r.value),
      statuses: filters.statuses.map((s) => s.value),
    });
    toast.success("Filters applied!");
  };

  async function fetchUsers() {
    const response = await getUsers(pageNo, pageSize);

    if (response && response.statusCode === 200) {
      toast.success(response.message);
      setSummaryData(response.data.summary);
      setTotalRecords(response.data.users.totalRecords || 0);
      setData(response.data.users.items || []);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [pageNo, pageSize]);

  return (
    <div className={`${isDark ? "dark" : ""} mt-16 sm:mt-20`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="User List"
          subtitle="Manage system access, identities, and security policies."
          breadcrumbs={[{ label: "Users" }, { label: "User List" }]}
          showButton={true}
          buttonText="New User"
          buttonRoute="/users/0"
          showExportButton={true}
          ExportbuttonText="Export"
          onExportClick={handleExport}
          showFilterButton={true}
          FilterbuttonText="Filters"
          onFilterClick={handleFilter}
        />
        {isFilterOpen && (
          <div className="mb-6 rounded-xl  bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Advanced Filters</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  Reset all ✕
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              {/* Role Filter */}
              <div className="min-w-[260px]">
                <MultiSelect
                  options={roleOptions}
                  value={appliedFilters.roles}
                  onChange={(roles) =>
                    setAppliedFilters((prev) => ({ ...prev, roles }))
                  }
                  placeholder=" roles"
                  searchPlaceholder="Search roles"
                />
              </div>

              {/* Status Filter */}
              <div className="min-w-[260px]">
                <MultiSelect
                  options={statusOptions}
                  value={appliedFilters.statuses}
                  onChange={(statuses) =>
                    setAppliedFilters((prev) => ({ ...prev, statuses }))
                  }
                  placeholder="status"
                  searchPlaceholder="Search status"
                />
              </div>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={UsersIcon}
            label="Total Users"
            value={summaryData.totalUsers}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={CheckCircle}
            label="Active"
            value={summaryData.active}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            isDark={isDark}
          />
          <MetricCard
            icon={Lock}
            label="Suspended/Locked"
            value={summaryData.suspendedOrLocked}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            isDark={isDark}
          />
          <MetricCard
            icon={Shield}
            label="2FA Enabled"
            value={summaryData.twoFactorEnabled}
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
          searchPlaceholder="Search across all fields..."
          rowsPerPageOptions={[10, 25, 50, 100]}
          defaultRowsPerPage={10}
          pageNo={pageNo}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          totalRecords={totalReconrds}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default Users;
