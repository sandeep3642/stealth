"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { Activity, TrendingUp, Clock, Package } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Subscriptions: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  const columns = [
    {
      key: "no",
      label: "NO",
      visible: true,
    },
    {
      key: "account",
      label: "ACCOUNT",
      type: "multi-line" as const,
      visible: true,
    },
    {
      key: "planDetails",
      label: "PLAN DETAILS",
      type: "multi-line" as const,
      visible: true,
    },
    {
      key: "period",
      label: "PERIOD",
      type: "multi-line" as const,
      visible: true,
    },
    {
      key: "status",
      label: "STATUS",
      type: "badge" as const,
      visible: true,
    },
  ];

  const [data, setData] = useState<any[]>([
    {
      subscriptionId: "1",
      no: 1,
      account: {
        line1: "Alpha Logistics",
        line2: "ACC-001",
      },
      planDetails: {
        line1: "Standard End User",
        line2: "ACCOUNT SPECIFIC",
      },
      period: {
        line1: "📅 2024-01-01",
        line2: "↻ 2025-01-01",
      },
      status: "Active",
    },
    {
      subscriptionId: "2",
      no: 2,
      account: {
        line1: "Beta Fleet",
        line2: "ACC-002",
      },
      planDetails: {
        line1: "Enterprise Fleet Hub",
        line2: "VEHICLE SPECIFIC (150 Units)",
      },
      period: {
        line1: "📅 2024-03-15",
        line2: "↻ 2025-03-15",
      },
      status: "Active",
    },
  ]);

  const handleEdit = (row: any) => {
    router.push(`/subscriptions/${row.subscriptionId}`);
  };

  const handleDelete = async (row: any) => {
    // Add delete subscription API call here
    toast.success("Subscription deleted successfully");
  };

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  async function getSubscriptionsList() {
    // Add API call here
    // const response = await getSubscriptions(pageNo, pageSize, debouncedQuery);
    // if (response && response.statusCode === 200) {
    //   toast.success(response.message);
    //   setData(response.data.items);
    // }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    getSubscriptionsList();
  }, [pageNo, pageSize, debouncedQuery]);

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title="Subscriptions"
            subtitle="Real-time monitoring of active licenses and contract adherence."
            breadcrumbs={[{ label: "Billing" }, { label: "Subscriptions" }]}
            showButton={false}
          />
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={Activity}
            label="TOTAL ACTIVE"
            value={3}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            isDark={isDark}
          />
          <MetricCard
            icon={TrendingUp}
            label="MONTHLY RECURRING"
            value="$42,500"
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            isDark={isDark}
          />
          <MetricCard
            icon={Clock}
            label="EXPIRING SOON"
            value={12}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
            isDark={isDark}
          />
          <MetricCard
            icon={Package}
            label="MANAGED UNITS"
            value="1,840"
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            isDark={isDark}
          />
        </div>

        {/* Table Section */}
        <div className="w-full">
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
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
