"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import { getCategories, deleteCategory } from "@/services/categoryService";
import { Category } from "@/interfaces/category.interface";
import { useRouter } from "next/navigation";

const Categories: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      key: "categoryId",
      label: "ID",
      visible: true,
    },
    {
      key: "labelName",
      label: "LABEL",
      visible: true,
    },
    {
      key: "description",
      label: "DESCRIPTION",
      visible: true,
    },
    {
      key: "isActive",
      label: "STATUS",
      type: "badge" as const,
      visible: true,
      render: (value: boolean) => (value ? "Active" : "Inactive"),
    },
    {
      key: "createdAt",
      label: "CREATED AT",
      visible: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data || []);
      } else {
        console.error("Failed to fetch categories:", response.message);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row: Category) => {
   router.push(`/categories/${row.categoryId}`);
  };

  const handleDelete = async (row: Category) => {
    if (confirm(`Are you sure you want to delete "${row.labelName}"?`)) {
      const response = await deleteCategory(row.categoryId);
      if (response.success) {
        alert("Category deleted successfully!");
        fetchCategories(); // Refresh list
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
    fetchCategories();
  }, []);

  return (
    <div className={`${isDark ? "dark" : ""} mt-20`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="Categories"
          subtitle="Manage identities, taxonomies, and global parameters."
          breadcrumbs={[{ label: "Accounts" }, { label: "Categories" }]}
          showButton={true}
          buttonText="Add Category"
          buttonRoute="/categories/0"
        />

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Loading categories...</p>
          </div>
        ) : (
          <CommonTable
            columns={columns}
            data={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            searchPlaceholder="Search categories..."
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

export default Categories;