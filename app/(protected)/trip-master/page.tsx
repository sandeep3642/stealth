"use client";

import { CalendarClock, Route, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { MetricCard } from "@/components/CommonCard";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";

type TripListRow = {
  id: number;
  tripName: string;
  routeName: string;
  vehicleNo: string;
  driverName: string;
  cycle: "Weekly" | "Monthly" | "One-Off";
  status: "Active" | "Pending" | "In Transit" | "Completed";
  startTime: string;
};

const STATIC_TRIPS: TripListRow[] = [
  {
    id: 101,
    tripName: "Delhi North Milk Run",
    routeName: "Narela - Panipat - Karnal",
    vehicleNo: "DL01AB5541",
    driverName: "Rajan Kumar",
    cycle: "Weekly",
    status: "Active",
    startTime: "2026-03-05T06:00:00",
  },
  {
    id: 102,
    tripName: "Mumbai Pune Express",
    routeName: "Andheri Hub - Talegaon - Pune Yard",
    vehicleNo: "MH12PQ8890",
    driverName: "Amit Singh",
    cycle: "Monthly",
    status: "In Transit",
    startTime: "2026-03-07T07:30:00",
  },
  {
    id: 103,
    tripName: "Jaipur Retail Drop",
    routeName: "Gurugram DC - Neemrana - Jaipur",
    vehicleNo: "RJ14CD1203",
    driverName: "Vijay Tomar",
    cycle: "One-Off",
    status: "Pending",
    startTime: "2026-03-08T09:15:00",
  },
  {
    id: 104,
    tripName: "Shimla Mountain Supply",
    routeName: "Delhi WH - Chandigarh Relay - Shimla",
    vehicleNo: "HP01AA4001",
    driverName: "Mohit Rana",
    cycle: "Monthly",
    status: "Completed",
    startTime: "2026-03-02T05:30:00",
  },
];

const TripMasterPage: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();

  const [rows, setRows] = useState<TripListRow[]>(STATIC_TRIPS);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const summary = useMemo(() => {
    const totalTrips = rows.length;
    const activeTrips = rows.filter((row) => row.status === "Active").length;
    const inTransitTrips = rows.filter(
      (row) => row.status === "In Transit",
    ).length;
    return { totalTrips, activeTrips, inTransitTrips };
  }, [rows]);

  const columns = useMemo(
    () => [
      { key: "no", label: "NO", visible: true },
      { key: "tripName", label: "TRIP NAME", visible: true },
      { key: "routeName", label: "ROUTE", visible: true },
      { key: "vehicleNo", label: "VEHICLE", visible: true },
      { key: "driverName", label: "DRIVER", visible: true },
      {
        key: "cycle",
        label: "CYCLE",
        visible: true,
        render: (value: TripListRow["cycle"]) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
              value === "Weekly"
                ? "bg-indigo-100 text-indigo-700"
                : value === "Monthly"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-gray-100 text-gray-700"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        key: "status",
        label: "STATUS",
        visible: true,
        render: (value: TripListRow["status"]) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
              value === "Active"
                ? "bg-emerald-100 text-emerald-700"
                : value === "In Transit"
                  ? "bg-yellow-100 text-yellow-700"
                  : value === "Pending"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        key: "startTime",
        label: "START TIME",
        visible: true,
        render: (value: string) =>
          value ? new Date(value).toLocaleString("en-IN") : "-",
      },
    ],
    [],
  );

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        <PageHeader
          title="Trip Master"
          subtitle="Manage trip schedules and routing templates."
          breadcrumbs={[{ label: "Fleet" }, { label: "Trip Master" }]}
          showButton={true}
          buttonText="Add Trip"
          buttonRoute="/trip-master/0"
          showExportButton={false}
          showFilterButton={false}
          showBulkUpload={false}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            icon={Route}
            label="TOTAL TRIPS"
            value={summary.totalTrips}
            iconBgColor="bg-indigo-100 dark:bg-indigo-900/30"
            iconColor="text-indigo-600 dark:text-indigo-400"
            isDark={isDark}
          />
          <MetricCard
            icon={Truck}
            label="ACTIVE TRIPS"
            value={summary.activeTrips}
            iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-400"
            isDark={isDark}
          />
          <MetricCard
            icon={CalendarClock}
            label="IN TRANSIT"
            value={summary.inTransitTrips}
            iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
            iconColor="text-yellow-600 dark:text-yellow-400"
            isDark={isDark}
          />
        </div>

        <CommonTable
          columns={columns}
          data={rows}
          onEdit={(row) => router.push(`/trip-master/${row.id}`)}
          onDelete={(row) =>
            setRows((prev) => prev.filter((item) => item.id !== row.id))
          }
          showActions={true}
          searchPlaceholder="Search trips..."
          rowsPerPageOptions={[10, 25, 50, 100]}
          pageNo={pageNo}
          pageSize={pageSize}
          onPageChange={setPageNo}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNo(1);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalRecords={rows.length}
          isServerSide={false}
        />
      </div>
    </div>
  );
};

export default TripMasterPage;
