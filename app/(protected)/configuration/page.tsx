"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { getAccounts } from "@/services/accountService";

const Configuration: React.FC = () => {
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
      key: "account",
      label: "ACCOUNT",
      visible: true,
    },
    {
      key: "mapProvider",
      label: "MAP PROVIDER",
      visible: true,
    },
    {
      key: "dateFormat",
      label: "DATE FORMAT",
      visible: true,
    },
    {
      key: "language",
      label: "LANGUAGE",
      visible: true,
    },
    {
      key: "lastUpdated",
      label: "LAST UPDATED",
      visible: true,
    },
  ];

  const data = [
    {
      id: 1,
      no: 1,
      account: "Alpha Logistics",
      mapProvider: "Google Maps",
      dateFormat: "DD/MM/YYYY",
      language: "English",
      lastUpdated: "2 days ago",
    },
    {
      id: 2,
      no: 2,
      account: "Beta Fleet",
      mapProvider: "Here Maps",
      dateFormat: "MM/DD/YYYY",
      language: "Spanish",
      lastUpdated: "1 week ago",
    },
    {
      id: 3,
      no: 3,
      account: "Gamma Transport",
      mapProvider: "Google Maps",
      dateFormat: "DD/MM/YYYY",
      language: "English",
      lastUpdated: "3 weeks ago",
    },
  ];

  const handleEdit = (row: any) => {
    console.log("Edit:", row);
    alert(`Editing ${row.account}`);
  };

  const handleDelete = (row: any) => {
    console.log("Delete:", row);
    alert(`Deleting ${row.account}`);
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
    <div className={isDark ? "dark" : ""}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="Configuration"
          subtitle="Global settings for account management."
          breadcrumbs={[{ label: "Accounts" }, { label: "Configuration" }]}
          showButton={true}
          buttonText="New Configuration"
          buttonRoute="/addConfiguration"
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

export default Configuration;
