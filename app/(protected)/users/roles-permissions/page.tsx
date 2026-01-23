"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { getAccounts } from "@/services/accountService";
import { AccountData } from "@/interfaces/account.interface";
import { Shield, Lock, Users as UsersIcon } from "lucide-react";
import { toast } from "react-toastify";
import { getRoles } from "@/services/rolesService";

const Roles: React.FC = () => {
  const { isDark } = useTheme();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      key: "no",
      label: "NO",
      visible: true,
    },
    {
      key: "accountCode",
      label: "CODE",
      type: "link" as const,
      visible: true,
    },
    {
      key: "instance",
      label: "INSTANCE",
      type: "multi-line" as const,
      visible: true,
    },
    {
      key: "contact",
      label: "CONTACT",
      type: "multi-line" as const,
      visible: true,
    },
    {
      key: "location",
      label: "LOCATION",
      type: "icon-text" as const,
      visible: true,
    },
    {
      key: "status",
      label: "STATUS",
      type: "badge" as const,
      visible: true,
    },
  ];

  const [data, setData] = useState<AccountData[]>([]);

  const handleEdit = (row: AccountData) => {
    console.log("Edit:", row);
    alert(`Editing ${row.instance.main}`);
  };

  const handleDelete = (row: AccountData) => {
    console.log("Delete:", row);
    alert(`Deleting ${row.instance.main}`);
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

  async function fetchRoles() {
    const response = await getRoles(pageNo, pageSize);
    console.log("response", response);
    if (response && response.statusCode === 200) {
      toast.success(response.message);
      setData(response.data.items);
    }
  }

  useEffect(() => {
    fetchRoles();
  }, [pageNo, pageSize]);

  return (
    <div className={`${isDark ? "dark" : ""} mt-16 sm:mt-20`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="Roles & Permissions"
          subtitle="Define fine-grained access controls for different user types."
          breadcrumbs={[{ label: "Users" }, { label: "Roles & Permissions" }]}
          showButton={true}
          buttonText="New Role"
          buttonRoute="/users/roles-permissions/0"
          showExportButton={true}
          ExportbuttonText="Export"
          onExportClick={handleExport}
        />

        {/* Metric Cards - Figma Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={Shield}
            label="Total Roles"
            value={3}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={Lock}
            label="System Roles"
            value={1}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={UsersIcon}
            label="Custom Roles"
            value={2}
            iconBgColor="bg-pink-100"
            iconColor="text-pink-600"
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
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default Roles;
