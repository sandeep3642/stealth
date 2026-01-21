"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { getAccounts } from "@/services/accountService";
import { AccountData } from "@/interfaces/account.interface";

const Categories: React.FC = () => {
  const { isDark } = useTheme();

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const columns = [
    {
      key: "id",
      label: "ID",
      visible: true,
    },
    {
      key: "label",
      label: "LABEL",
      visible: true,
    },
    {
      key: "description",
      label: "DESCRIPTION",
      visible: true,
    },
    {
      key: "accounts",
      label: "ACCOUNTS",
      visible: true,
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
      id: "CAT-01",
      label: "Distributor",
      description: "Tier 1 high-volume distribution pa...",
      accounts: "5 Instances",
      status: "Active",
    },
    {
      id: "CAT-02",
      label: "Reseller",
      description: "Regional value-added resellers.",
      accounts: "12 Instances",
      status: "Active",
    },
    {
      id: "CAT-03",
      label: "Enterprise",
      description: "Direct large-scale corporate fleet...",
      accounts: "8 Instances",
      status: "Active",
    },
    {
      id: "CAT-04",
      label: "Dealer",
      description: "Independent hardware dealers.",
      accounts: "20 Instances",
      status: "Active",
    },
  ];

  const handleEdit = (row: any) => {
    console.log("Edit:", row);
    alert(`Editing ${row.label}`);
  };

  const handleDelete = (row: any) => {
    console.log("Delete:", row);
    alert(`Deleting ${row.label}`);
  };

  async function getAccountsList() {
    const response = await getAccounts();
    console.log("response", response);
  }

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1); // Reset to first page when page size changes
  };

  useEffect(() => {
    getAccountsList();
  }, []);

  return (
    <div className={`${isDark ? "dark" : ""} mt-20`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="Categories"
          subtitle="Manage identities, taxonomies, and global parameters."
          breadcrumbs={[{ label: "Accounts" }, { label: "Categories" }]}
          showButton={true}
          buttonText="Add Taxonomy"
          buttonRoute="/addCategory"
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

export default Categories;
