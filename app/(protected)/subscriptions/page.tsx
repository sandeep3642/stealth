"use client";

import { Activity, Clock, Package, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MetricCard } from "@/components/CommonCard";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { getSubscriptions } from "@/services/subscriptionService";

const toLocalDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
};

const Subscriptions: React.FC = () => {
  const { isDark } = useTheme();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    managedUnits: 0,
  });

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

  const [data, setData] = useState<any[]>([]);

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  async function getSubscriptionsList() {
    try {
      const response = await getSubscriptions(pageNo, pageSize, debouncedQuery);
      if (response && response.statusCode === 200) {
        const items = Array.isArray(response?.data?.items)
          ? response.data.items
          : [];

        const mapped = items.map((item: any, index: number) => ({
          subscriptionId: String(item?.id || item?.subscriptionId || 0),
          no: (pageNo - 1) * pageSize + index + 1,
          account: {
            main: String(item?.accountName || "-"),
            sub: item?.accountId ? `ACC-${item.accountId}` : "-",
          },
          planDetails: {
            main: String(item?.planName || "-"),
            sub: `${Number(item?.units || 0)} Units`,
          },
          period: {
            main: `Start: ${toLocalDate(item?.startDate)}`,
            sub: `End: ${toLocalDate(item?.endDate)}`,
          },
          status: String(item?.status || "Inactive"),
        }));

        const activeCount = items.filter(
          (x: any) => String(x?.status || "").toLowerCase() === "active",
        ).length;
        const managedUnits = items.reduce(
          (acc: number, x: any) => acc + Number(x?.units || 0),
          0,
        );

        setData(mapped);
        setTotalRecords(Number(response?.data?.totalRecords || items.length));
        setSummary({
          total: Number(response?.data?.totalRecords || items.length),
          active: activeCount,
          expiringSoon: 0,
          managedUnits,
        });
      } else {
        toast.error(response?.message || "Failed to fetch subscriptions");
      }
    } catch (error) {
      toast.error("Failed to fetch subscriptions");
    }
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
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title="Subscriptions"
            subtitle="Real-time monitoring of active licenses and contract adherence."
            breadcrumbs={[{ label: "Billing" }, { label: "Subscriptions" }]}
            showButton={true}
            buttonText="Add Subscription"
            buttonRoute="/subscriptions/0"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={Activity}
            label="TOTAL SUBSCRIPTIONS"
            value={summary.total}
            iconBgColor="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-400"
            isDark={isDark}
          />
          <MetricCard
            icon={TrendingUp}
            label="ACTIVE"
            value={summary.active}
            iconBgColor="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
            isDark={isDark}
          />
          <MetricCard
            icon={Clock}
            label="EXPIRING SOON"
            value={summary.expiringSoon}
            iconBgColor="bg-orange-100 dark:bg-orange-900/30"
            iconColor="text-orange-600 dark:text-orange-400"
            isDark={isDark}
          />
          <MetricCard
            icon={Package}
            label="MANAGED UNITS"
            value={summary.managedUnits}
            iconBgColor="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
            isDark={isDark}
          />
        </div>

        <div className="w-full">
          <CommonTable
            columns={columns}
            data={data}
            showActions={false}
            searchPlaceholder="Search subscriptions..."
            rowsPerPageOptions={[10, 25, 50, 100]}
            defaultRowsPerPage={10}
            pageNo={pageNo}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            totalRecords={totalRecords}
          />
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
