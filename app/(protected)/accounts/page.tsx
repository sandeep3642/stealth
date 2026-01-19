"use client";

import React, { useEffect } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import { getAccounts } from "@/services/accountService";
import { AccountData } from "@/interfaces/account.interface";
import {
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Home,
  MapPin,
} from "lucide-react";
import { useColor } from "@/context/ColorContext";
import { useRouter } from "next/navigation";

const Accounts: React.FC = () => {
  const { isDark } = useTheme();
  const { selectedColor } = useColor();
  const router = useRouter();

  const columns = [
    {
      key: "no",
      label: "NO",
      visible: true,
    },
    {
      key: "code",
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

  const data: AccountData[] = [
    {
      id: 1,
      no: 1,
      code: "ACC-001",
      instance: { main: "Alpha Logistics", sub: "DISTRIBUTOR" },
      contact: { main: "John Alpha", sub: "contact@alpha.com" },
      location: "New York, NY",
      status: "Active",
    },
    {
      id: 2,
      no: 2,
      code: "ACC-002",
      instance: { main: "Beta Fleet Services", sub: "ENTERPRISE" },
      contact: { main: "Sarah Beta", sub: "admin@beta.com" },
      location: "Chicago, IL",
      status: "Active",
    },
    {
      id: 3,
      no: 3,
      code: "ACC-003",
      instance: { main: "Gamma Transport", sub: "RESELLER" },
      contact: { main: "Mike Gamma", sub: "info@gamma.com" },
      location: "Houston, TX",
      status: "Suspended",
    },
    {
      id: 4,
      no: 4,
      code: "ACC-004",
      instance: { main: "Delta Quick Cabs", sub: "DEALER" },
      contact: { main: "David Delta", sub: "support@delta.com" },
      location: "Phoenix, AZ",
      status: "Under Review",
    },
  ];

  const handleEdit = (row: AccountData) => {
    console.log("Edit:", row);
    alert(`Editing ${row.instance.main}`);
  };

  const handleDelete = (row: AccountData) => {
    console.log("Delete:", row);
    alert(`Deleting ${row.instance.main}`);
  };

  async function getAccountsList() {
    const response = await getAccounts();
    console.log("response", response);
  }

  useEffect(() => {
    getAccountsList();
  }, []);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Home
            className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          />
          <span className={isDark ? "text-gray-400" : "text-gray-500"}>›</span>
          <span className={isDark ? "text-gray-400" : "text-gray-500"}>
            Accounts
          </span>
          <span className={isDark ? "text-gray-400" : "text-gray-500"}>›</span>
          <span className={isDark ? "text-foreground" : "text-gray-900"}>
            Account List
          </span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1
              className={`text-4xl font-bold mb-2 ${isDark ? "text-foreground" : "text-gray-900"}`}
            >
              Account List
            </h1>
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              Manage identities, taxonomies, and global parameters.
            </p>
          </div>
          <button
            onClick={() => router.push("/addAccount")}
            style={{ background: selectedColor }}
            className={`cursor-pointer hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors`}
          >
            <span className="text-xl">+</span>
            Add Account
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Building2}
            label="TOTAL ACCOUNTS"
            value={4}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={CheckCircle}
            label="ACTIVE"
            value={2}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            isDark={isDark}
          />
          <MetricCard
            icon={Clock}
            label="PENDING"
            value={1}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            isDark={isDark}
          />
          <MetricCard
            icon={XCircle}
            label="INACTIVE"
            value={1}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
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
        />
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default Accounts;
