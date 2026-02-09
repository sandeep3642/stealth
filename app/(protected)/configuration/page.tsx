"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useTheme } from "@/context/ThemeContext";
import {
  getConfigurations,
  deleteConfiguration,
} from "@/services/configurationService";
import { Configuration } from "@/interfaces/configuartion.interface";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ConfigurationPage: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<Configuration | null>(
    null,
  );

  const columns = [
    { key: "accountConfigurationId", label: "ID", visible: true },
    { key: "accountName", label: "ACCOUNT", visible: true },
    { key: "mapProvider", label: "MAP PROVIDER", visible: true },
    { key: "dateFormat", label: "DATE FORMAT", visible: true },
    { key: "defaultLanguage", label: "LANGUAGE", visible: true },
    {
      key: "updatedOn",
      label: "LAST UPDATED",
      visible: true,
      type: "date" as const,
    },
  ];

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      const response = await getConfigurations(pageNo, pageSize);
      if (response.success) {
        setConfigurations(response.data?.items || []);
        setTotalRecords(response.data?.totalRecords || 0);
      } else {
        console.error("Failed to fetch configurations:", response.message);
      }
    } catch (error) {
      console.error("Error fetching configurations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: Configuration) => {
    router.push(`/configuration/${row.accountConfigurationId}`);
  };

  // Open confirmation dialog
  const handleDelete = (row: Configuration) => {
    setConfigToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!configToDelete) return;

    try {
      const response = await deleteConfiguration(
        configToDelete.accountConfigurationId,
      );
      if (response.success) {
        toast.success("Configuration deleted successfully!");
        fetchConfigurations();
      } else {
        toast.error(`Failed to delete: ${response.message}`);
      }
    } catch (error) {
      toast.error("Error deleting configuration");
      console.error("Error deleting configuration:", error);
    } finally {
      setConfigToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handlePageChange = (page: number) => setPageNo(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  useEffect(() => {
    fetchConfigurations();
  }, [pageNo, pageSize]);

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="Configuration"
          subtitle="Global settings for account management."
          breadcrumbs={[{ label: "Accounts" }, { label: "Configuration" }]}
          showButton={true}
          buttonText="New Configuration"
          buttonRoute="/configuration/0"
        />

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className={isDark ? "text-foreground" : "text-gray-900"}>
              Loading configurations...
            </p>
          </div>
        ) : (
          <CommonTable
            columns={columns}
            data={configurations}
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
            totalRecords={totalRecords}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setConfigToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Configuration"
          message={`Are you sure you want to delete configuration for "${configToDelete?.accountName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default ConfigurationPage;
