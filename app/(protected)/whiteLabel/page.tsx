"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import ConfirmationDialog from "@/components/ConfirmationDialog";
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
  const [loading, setLoading] = useState(true);

  // Confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [whiteLabelToDelete, setWhiteLabelToDelete] =
    useState<WhiteLabel | null>(null);

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
    },
  ];

  // Fetch White Labels Data
  const fetchWhiteLabels = async () => {
    try {
      setLoading(true);
      const response = await getWhiteLabels(pageNo, pageSize);

      if (response.success && response.data) {
        setData(response.data.items || []);
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        console.error("Failed to fetch white labels:", response.message);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching white labels:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWhiteLabels();
  }, [pageNo, pageSize]);

  const handleEdit = (row: WhiteLabel) => {
    router.push(`/provisionBranding?id=${row.whiteLabelId}`);
  };

  // Open confirmation dialog
  const handleDelete = (row: WhiteLabel) => {
    setWhiteLabelToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!whiteLabelToDelete) return;

    try {
      const response = await deleteWhiteLabel(whiteLabelToDelete.whiteLabelId);
      if (response.success) {
        toast.success("White label deleted successfully!");
        fetchWhiteLabels();
      } else {
        toast.error(response.message || "Failed to delete white label");
      }
    } catch (error) {
      console.error("Error deleting white label:", error);
      toast.error("An error occurred while deleting.");
    } finally {
      setWhiteLabelToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePageChange = (page: number) => setPageNo(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
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
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className={isDark ? "text-foreground" : "text-gray-900"}>
              Loading white labels...
            </p>
          </div>
        ) : (
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
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setWhiteLabelToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete White Label"
          message={`Are you sure you want to delete the white label for "${whiteLabelToDelete?.accountName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default WhiteLabelPage;
