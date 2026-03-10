"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { exportInvoices, getInvoices } from "@/services/invoiceService";

const toLocalDate = (value: string | null | undefined) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
};

const Invoices: React.FC = () => {
  const { isDark } = useTheme();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [loadingExport, setLoadingExport] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const columns = [
    {
      key: "no",
      label: "NO",
      visible: true,
    },
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

  const [data, setData] = useState<any[]>([]);

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  const handleExport = async () => {
    setLoadingExport(true);
    try {
      const response = await exportInvoices(1, 500);
      if (!response?.success) {
        toast.error(response?.message || "Export failed");
        return;
      }

      const fileBlob = response?.data?.blob;
      const fileName = response?.data?.fileName || "invoices-export.xlsx";
      if (!(fileBlob instanceof Blob)) {
        toast.error("Export file data is invalid");
        return;
      }

      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Invoices exported successfully");
    } catch (error) {
      toast.error("Failed to export invoices");
    } finally {
      setLoadingExport(false);
    }
  };

  async function getInvoicesList() {
    try {
      const response = await getInvoices(pageNo, pageSize, debouncedQuery);
      if (response && response.statusCode === 200) {
        const items = Array.isArray(response?.data?.items)
          ? response.data.items
          : [];

        const mapped = items.map((item: any, index: number) => {
          const currency = String(item?.currency || "USD");
          const amount = Number(item?.amount || 0);
          return {
            invoiceId: String(item?.id || item?.invoiceId || 0),
            no: (pageNo - 1) * pageSize + index + 1,
            invoiceNumber: String(
              item?.invoiceNumber || item?.invoiceNo || `INV-${index + 1}`,
            ),
            account: String(item?.accountName || item?.accountId || "-"),
            amount: `${currency} ${amount.toLocaleString("en-IN")}`,
            invoiceDate: toLocalDate(item?.invoiceDate),
            dueDate: toLocalDate(item?.dueDate),
            status: String(item?.status || "Pending"),
          };
        });

        setData(mapped);
        setTotalRecords(Number(response?.data?.totalRecords || items.length));
      } else {
        toast.error(response?.message || "Failed to fetch invoices");
      }
    } catch (error) {
      toast.error("Failed to fetch invoices");
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    getInvoicesList();
  }, [pageNo, pageSize, debouncedQuery]);

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title="Invoices"
            subtitle="Financial ledger and billing cycle automation control."
            breadcrumbs={[{ label: "Billing" }, { label: "Invoices" }]}
            showButton={true}
            buttonText="Add Invoice"
            buttonRoute="/invoices/0"
            showExportButton={true}
            ExportbuttonText={loadingExport ? "Exporting..." : "Export"}
            onExportClick={handleExport}
          />
        </div>

        <div className="w-full">
          <CommonTable
            columns={columns}
            data={data}
            showActions={false}
            searchPlaceholder="Search invoices..."
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

export default Invoices;
