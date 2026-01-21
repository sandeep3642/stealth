"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import HierarchicalTable from "@/components/HierarchicalTable";
import PageHeader from "@/components/PageHeader";
import ThemeCustomizer from "@/components/ThemeCustomizer";

const Hierarchy: React.FC = () => {
  const { isDark } = useTheme();

  const hierarchyData = [
    {
      id: "1",
      name: "Alpha Logistics",
      type: "DISTRIBUTOR",
      code: "ACC-001",
      status: "Active",
      managed: "45 Assets",
      avatar: "AL",
      avatarColor: "#8b5cf6",
      children: [
        {
          id: "2",
          name: "Beta Fleet Services",
          type: "ENTERPRISE",
          code: "ACC-002",
          status: "Active",
          managed: "20 Assets",
          avatar: "BE",
          avatarColor: "#e5e7eb",
          children: [
            {
              id: "3",
              name: "Delta Quick Cabs",
              type: "DEALER",
              code: "ACC-004",
              status: "Under Review",
              managed: "15 Assets",
              avatar: "DE",
              avatarColor: "#e5e7eb",
            },
          ],
        },
        {
          id: "4",
          name: "Gamma Transport",
          type: "RESELLER",
          code: "ACC-003",
          status: "Suspended",
          managed: "0 Assets",
          avatar: "GA",
          avatarColor: "#8b5cf6",
        },
      ],
    },
  ];

  const handleEdit = (node: any) => {
    console.log("Edit node:", node);
    alert(`Editing ${node.name}`);
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-20`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="Hierarchy"
          subtitle="Manage identities, taxonomies, and global parameters."
          breadcrumbs={[{ label: "Accounts" }, { label: "Hierarchy" }]}
        />

        {/* Hierarchical Table */}
        <HierarchicalTable
          title="RELATIONAL MAPPING"
          subtitle="Recursive visualization of distributor-dealer relationships."
          data={hierarchyData}
          onEdit={handleEdit}
          showSearch={true}
        />
      </div>
      <ThemeCustomizer />
    </div>
  );
};

export default Hierarchy;
