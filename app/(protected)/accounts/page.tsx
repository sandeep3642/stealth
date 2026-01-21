"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { getAccounts } from "@/services/accountService";
import { AccountData } from "@/interfaces/account.interface";
import { Building2, CheckCircle, Clock, XCircle, MapPin } from "lucide-react";
import { toast } from "react-toastify";

const Accounts: React.FC = () => {
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
      key: "accountName",
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
      key: "countryName",
      label: "LOCATION",
      type: "icon-text" as const,
      icon: <MapPin className="w-4 h-4" />,
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

  async function getAccountsList() {
    const response = await getAccounts(pageNo, pageSize);
    console.log("response", response);
    if (response && response.statusCode === 200) {
      toast.success(response.message);
      setData(response.data.items);
    }
  }

  useEffect(() => {
    getAccountsList();
  }, []);

  return (
    <div className={isDark ? "dark" : ""}>
      <div
        className={`min-h-screen  ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        {/* Page Header - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title="Account List"
            subtitle="Manage identities, taxonomies, and global parameters."
            breadcrumbs={[{ label: "Accounts" }, { label: "Account List" }]}
            showButton={true}
            buttonText="Add Account"
            buttonRoute="/addAccount"
          />
        </div>

        {/* Metric Cards - Truly Mobile Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={Building2}
            label="TOTAL"
            value={4}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            isDark={isDark}
          />
          <MetricCard
            icon={CheckCircle}
            label="ACTIVE"
            value={2}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            isDark={isDark}
          />
          <MetricCard
            icon={Clock}
            label="PENDING"
            value={1}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
            isDark={isDark}
          />
          <MetricCard
            icon={XCircle}
            label="INACTIVE"
            value={1}
            iconBgColor="bg-red-100 dark:bg-red-900/30"
            iconColor="text-red-600 dark:text-red-400"
            isDark={isDark}
          />
        </div>

        {/* Table Section - Mobile Optimized */}
        <div className="w-full">
          <CommonTable
            columns={columns}
            data={data}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            searchPlaceholder="Search..."
            rowsPerPageOptions={[10, 25, 50, 100]}
            defaultRowsPerPage={10}
            pageNo={pageNo}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default Accounts;
