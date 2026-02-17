"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { Download, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Invoices: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [selectedAccount, setSelectedAccount] = useState<string>("all");

  const columns = [
    {
      key: "invoiceNumber",
      label: "INVOICE #",
      visible: true,
    },
    {
      key: "account",
      label: "ACCOUNT",
      visible: true,
    },
    {
      key: "amount",
      label: "AMOUNT",
      visible: true,
    },
    {
      key: "invoiceDate",
      label: "INVOICE DATE",
      visible: true,
    },
    {
      key: "dueDate",
      label: "DUE DATE",
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
      invoiceId: "1",
      invoiceNumber: "INV-5001",
      account: "Alpha Logistics",
      amount: "USD 29.99",
      invoiceDate: "2024-10-01",
      dueDate: "2024-10-15",
      status: "Paid",
    },
    {
      invoiceId: "2",
      invoiceNumber: "INV-5002",
      account: "Beta Fleet",
      amount: "USD 2,250",
      invoiceDate: "2024-11-01",
      dueDate: "2024-11-15",
      status: "Pending",
    },
    {
      invoiceId: "3",
      invoiceNumber: "INV-5003",
      account: "Alpha Logistics",
      amount: "USD 29.99",
      invoiceDate: "2024-11-01",
      dueDate: "2024-11-15",
      status: "Overdue",
    },
  ]);

  // Calculate metrics
  const paidCount = data.filter((item) => item.status === "Paid").length;
  const pendingCount = data.filter((item) => item.status === "Pending").length;
  const overdueCount = data.filter((item) => item.status === "Overdue").length;

  const handleEdit = (row: any) => {
    router.push(`/invoices/${row.invoiceId}`);
  };

  const handleDelete = async (row: any) => {
    // Add delete invoice API call here
    toast.success("Invoice deleted successfully");
  };

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  async function getInvoicesList() {
    // Add API call here
    // const response = await getInvoices(pageNo, pageSize, debouncedQuery, selectedAccount);
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
    getInvoicesList();
  }, [pageNo, pageSize, debouncedQuery, selectedAccount]);

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title="Invoices"
            subtitle="Financial ledger and billing cycle automation control."
            breadcrumbs={[{ label: "Billing" }, { label: "Invoices" }]}
            showButton={false}
          />
        </div>

        {/* Filter and Metrics Section */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Filter Dropdown */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
                  Filter by Account
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Accounts</option>
                  <option value="alpha">Alpha Logistics</option>
                  <option value="beta">Beta Fleet</option>
                </select>
              </div>

              {/* Metrics */}
              <div className="flex gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-1">
                    Paid
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {paidCount}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase mb-1">
                    Pending
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pendingCount}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase mb-1">
                    Overdue
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overdueCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default Invoices;
