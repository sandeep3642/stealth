"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import PageHeader from "@/components/PageHeader";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useTheme } from "@/context/ThemeContext";
import { getCategories, deleteCategory } from "@/services/categoryService";
import { Category } from "@/interfaces/category.interface";
import { useRouter } from "next/navigation";
import { FormRights } from "@/interfaces/account.interface";
import { toast } from "react-toastify";

const Categories: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [categoryRights, setCategoryRights] = useState<FormRights | null>(null);

  // Confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );

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

  // Show confirmation dialog instead of browser confirm
  const handleDelete = (row: Category) => {
    setCategoryToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  // Actual delete operation after confirmation
  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await deleteCategory(categoryToDelete.categoryId);
      if (response.success) {
        toast.success("Category deleted successfully!");
        fetchCategories(); // Refresh list
      } else {
        toast.error(`Failed to delete: ${response.message}`);
      }
    } catch (error) {
      toast.error("Error deleting category");
      console.error("Error deleting category:", error);
    } finally {
      setCategoryToDelete(null);
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

  useEffect(() => {
    function getPermissionsList() {
      try {
        if (typeof window === "undefined") return;
        const storedPermissions = localStorage.getItem("permissions");

        if (storedPermissions) {
          const parsedPermissions = JSON.parse(storedPermissions);

          const rights = parsedPermissions.find(
            (val: { formName: string }) => val.formName === "Categories",
          );

          if (rights) {
            setCategoryRights(rights);
          } else {
            console.warn('No matching rights found for "Categories".');
          }
        } else {
          console.warn("No permissions found in localStorage.");
        }
      } catch (error) {
        console.error("Error fetching permissions from localStorage:", error);
      }
    }

    getPermissionsList();
  }, []);

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="Categories"
          subtitle="Manage identities, taxonomies, and global parameters."
          breadcrumbs={[{ label: "Accounts" }, { label: "Categories" }]}
          showButton={true}
          buttonText="Add Category"
          buttonRoute="/categories/0"
          showWriteButton={categoryRights?.canWrite || false}
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
            pageNo={pageNo}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isServerSide={false}
          />
        )}

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Category"
          message={`Are you sure you want to delete the category "${categoryToDelete?.labelName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default Categories;
