"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { getConfigurations, deleteConfiguration } from "@/services/configurationService";
import   { Configuration } from "@/interfaces/configuration.interface";
import { useRouter } from "next/navigation";

const ConfigurationPage: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  const columns = [
    {
      key: "accountConfigurationId",
      label: "ID",
      visible: true,
    },
    {
      key: "accountName",
      label: "ACCOUNT",
      visible: true,
    },
    {
      key: "mapProvider",
      label: "MAP PROVIDER",
      visible: true,
    },
    {
      key: "dateFormat",
      label: "DATE FORMAT",
      visible: true,
    },
    {
      key: "defaultLanguage",
      label: "LANGUAGE",
      visible: true,
      render: (value: string) => {
        const langMap: Record<string, string> = {
          en: "English",
          es: "Spanish",
          fr: "French",
          de: "German",
        };
        return langMap[value] || value;
      },
    },
    {
      key: "updatedOn",
      label: "LAST UPDATED",
      visible: true,
      render: (value: string) => {
        if (!value) return "Never";
        const date = new Date(value);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
      },
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

  const handleDelete = async (row: Configuration) => {
    if (confirm(`Are you sure you want to delete configuration for "${row.accountName}"?`)) {
      const response = await deleteConfiguration(row.accountConfigurationId);
      if (response.success) {
        alert("Configuration deleted successfully!");
        fetchConfigurations();
      } else {
        alert(`Failed to delete: ${response.message}`);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setPageNo(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNo(1);
  };

  useEffect(() => {
    fetchConfigurations();
  }, [pageNo, pageSize]);

  return (
    <div className={`${isDark ? "dark" : ""} mt-20`}>
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
            variant="simple"
            pageNo={pageNo}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default ConfigurationPage;