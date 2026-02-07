"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { Shield, Lock, Users as UsersIcon } from "lucide-react";
import { toast } from "react-toastify";
import { deleteRole, exportRoles, getRoles } from "@/services/rolesService";
import { RoleAccount } from "@/interfaces/permission.interface";
import { useRouter } from "next/navigation";

const Roles: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [summary, setSummary] = useState({
    totalRoles: 0,
    systemRoles: 0,
    customRoles: 0,
  });

  const [totalRecords, setTotalRecords] = useState(0);

  const columns = [
    {
      key: "no",
      label: "NO",
      visible: true,
    },
    {
      key: "accountName",
      label: "Account",
      // type: "link" as const,
      visible: true,
    },
    {
      key: "roleName",
      label: "Role",
      type: "link" as const,
      visible: true,
    },
    {
      key: "description",
      label: "Description",
      visible: true,
    },
    {
      key: "createdOn",
      label: "Created At",
      visible: true,
      type: "date" as const,
    },
  ];

  const [data, setData] = useState<RoleAccount[]>([]);

  const handleEdit = (row: RoleAccount) => {
    localStorage.setItem("accountId", String(row.accountId));
    setTimeout(() => {
      router.push(`/users/roles-permissions/${row.roleId}`);
    }, 500);
  };

  async function handleDelete(row: RoleAccount) {
    const response = await deleteRole(row.roleId);
    if (response && response.statusCode === 200) {
      toast.success(response.message);
      fetchRoles();
    } else toast.error(response.message);
  }

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  const handleExport = async () => {
  try {
    await exportRoles(); // optionally pass accountId or search term
    toast.success("Roles exported successfully!");
  } catch {
    toast.error("Failed to export roles");
  }
};


  async function fetchRoles() {
    const response = await getRoles(pageNo, pageSize);
    if (response && response.statusCode === 200) {
      // toast.success(response.message);
      setSummary(response.data.summary);
      setData(response.data.roles.items);
      setTotalRecords(response.data.roles.totalRecords);
    } else toast.error(response.message);
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
          showWriteButton={true}
          onExportClick={handleExport}
        />

        {/* Metric Cards - Figma Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={Shield}
            label="Total Roles"
            value={summary.totalRoles}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={Lock}
            label="System Roles"
            value={summary.systemRoles}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={UsersIcon}
            label="Custom Roles"
            value={summary.customRoles}
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
          rowsPerPageOptions={[2, 10, 25, 50, 100]}
          defaultRowsPerPage={10}
          pageNo={pageNo}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          totalRecords={totalRecords}
          onPageSizeChange={handlePageSizeChange}
          isServerSide={true}
        />
      </div>
      
    </div>
  );
};

export default Roles;
