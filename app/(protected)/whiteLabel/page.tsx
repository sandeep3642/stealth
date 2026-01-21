"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";

const WhiteLabel: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const columns = [
    {
      key: "account",
      label: "ACCOUNT",
      visible: true,
    },
    {
      key: "domain",
      label: "DOMAIN",
      type: "link" as const,
      visible: true,
    },
    {
      key: "theme",
      label: "THEME",
      visible: true,
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: value.primary }}
          />
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: value.secondary }}
          />
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      type: "badge" as const,
      visible: true,
    },
  ];

  const data = [
    {
      id: 1,
      account: "Alpha Logistics",
      domain: "https://portal.alpha.com",
      theme: {
        primary: "#7C3AED",
        secondary: "#10B981",
      },
      status: "Active",
    },
  ];

  const handleEdit = (row: any) => {
    console.log("Edit:", row);
    router.push("/provisionBranding");
  };

  const handleDelete = (row: any) => {
    console.log("Delete:", row);
    alert(`Deleting ${row.account}`);
  };

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1); // Reset to first page when page size changes
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-20`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="White Label"
          subtitle="Manage identities, taxonomies, and global parameters."
          breadcrumbs={[{ label: "Accounts" }, { label: "White Label" }]}
          showButton={true}
          buttonText="Provision Branding"
          buttonRoute="/provisionBranding"
        />

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
          variant="simple"
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

export default WhiteLabel;
