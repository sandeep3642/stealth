"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { getWhiteLabels, deleteWhiteLabel } from "@/services/whitelabelService";
import { WhiteLabel } from "@/interfaces/whitelabel.interface";
import { toast } from "react-toastify";

const WhiteLabelPage: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<WhiteLabel[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const columns = [
    {
      key: "accountName",
      label: "ACCOUNT",
      visible: true,
    },
    {
      key: "customEntryFqdn",
      label: "DOMAIN",
      type: "link" as const,
      visible: true,
    },
    {
      key: "theme",
      label: "THEME",
      visible: true,
      render: (value: any, row: WhiteLabel) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: row.primaryColorHex }}
            title={row.primaryColorHex}
          />
          <div
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: row.secondaryColorHex }}
            title={row.secondaryColorHex}
          />
        </div>
      ),
    },
    {
      key: "isActive",
      label: "STATUS",
      type: "badge" as const,
      visible: true,
      // render: (value: boolean) => (value ? "Active" : "Inactive"),
    },
  ];

  // Fetch White Labels Data
  const fetchWhiteLabels = async () => {
    // setLoading(true);
    try {
      const response = await getWhiteLabels(pageNo, pageSize);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalRecords(response.data.totalRecords || 0);
        // setTotalPages(response.data.totalPages || 0);
      } else {
        console.error("Failed to fetch white labels:", response.message);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching white labels:", error);
      setData([]);
    } finally {
      // setLoading(false);
    }
  };

  // Load data on component mount and when pagination changes
  useEffect(() => {
    fetchWhiteLabels();
  }, [pageNo, pageSize]);

  const handleEdit = (row: WhiteLabel) => {
    router.push(`/provisionBranding?id=${row.whiteLabelId}`);
  };

  const handleDelete = async (row: WhiteLabel) => {
    {
      try {
        const response = await deleteWhiteLabel(row.whiteLabelId);

        if (response.success) {
          toast.success("White label deleted successfully!");
          fetchWhiteLabels(); // Refresh data
        } else {
          toast.error(` ${response.message}`);
        }
      } catch (error) {
        console.error("Error deleting white label:", error);
        toast.error("An error occurred while deleting.");
      }
    }
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
          totalRecords={totalRecords}
          // totalPages={totalPages}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          // loading={loading}
        />
      </div>
      
    </div>
  );
};

export default WhiteLabelPage;
