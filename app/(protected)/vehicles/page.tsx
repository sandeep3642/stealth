"use client";

import React, { useEffect, useState } from "react";
import CommonTable from "@/components/CommonTable";
import PageHeader from "@/components/PageHeader";
import { MetricCard } from "@/components/CommonCard";
import { useTheme } from "@/context/ThemeContext";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Truck, ShieldCheck, AlertCircle, Activity } from "lucide-react";
import {
  VehicleBrand,
  VehicleItem,
  VehicleSummary,
  VehicleType,
} from "@/interfaces/vehicle.interface";
import {
  getVehicleBrands,
  getVehicles,
  getVehicleType,
} from "@/services/vehicleService";

async function deleteVehicle(
  vehicleId: number,
): Promise<{ statusCode: number; message: string }> {
  // TODO: replace with real API
  return { statusCode: 200, message: "Vehicle deleted successfully" };
}

// ── Component ──────────────────────────────────────────────────────────────
const Vehicles: React.FC = () => {
  const { isDark } = useTheme();
  const router = useRouter();

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<VehicleItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [summaryData, setSummaryData] = useState<VehicleSummary>({
    totalFleetSize: 0,
    inService: 0,
    offRoadOrOutOfService: 0,
    activeAccounts: 0,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleItem | null>(
    null,
  );
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const columns = [
    {
      key: "registrationNumber",
      label: "Registration",
      visible: true,
      render: (value: string) => (
        <span className="font-semibold text-purple-600 dark:text-purple-400">
          {value}
        </span>
      ),
    },
    {
      key: "vinNumber",
      label: "VIN / Chassis",
      visible: true,
    },
    // {
    //   key: "vehicleBrand",
    //   label: "Type & Brand",
    //   visible: true,
    //   render: (_: string, row: VehicleItem) => (
    //     <span>
    //       {[row.vehicleType, row.vehicleBrand].filter(Boolean).join(" · ")}
    //     </span>
    //   ),
    // },
    // {
    //   key: "ownershipBasis",
    //   label: "Ownership",
    //   visible: true,
    //   render: (value: string, row: VehicleItem) => (
    //     <div>
    //       <span
    //         className={`text-xs font-semibold px-2 py-0.5 rounded ${
    //           value === "OWNED"
    //             ? "bg-blue-100 text-blue-700"
    //             : "bg-yellow-100 text-yellow-700"
    //         }`}
    //       >
    //         {value}
    //       </span>
    //       {row.lessorName && (
    //         <p className="text-xs text-gray-500 mt-0.5">{row.lessorName}</p>
    //       )}
    //     </div>
    //   ),
    // },
    {
      key: "status",
      label: "Status",
      visible: true,
      type: "badge" as const,
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      visible: true,
      type: "date" as const,
    },
  ];

  const getVehicleBrand = (brandId: number) => {
    const brands: Record<number, string> = {
      1: "Tata",
      2: "Mahindra",
      3: "Maruti",
      4: "Ashok Leyland",
    };
    return brands[brandId] || "Unknown";
  };

  const getVehicleTypes = (typeId: number) => {
    const types: Record<number, string> = {
      1: "Sedan",
      2: "SUV",
      3: "Truck",
      4: "Hatchback",
      5: "Mini Truck",
    };
    return types[typeId] || "Unknown";
  };

  useEffect(() => {
    const init = async () => {
      const [typeRes, brandRes] = await Promise.all([
        getVehicleType(),
        getVehicleBrands(),
      ]);

      if (typeRes) setVehicleTypes(typeRes);
      if (brandRes) setVehicleBrands(brandRes);
    };
    init();
  }, []);


  const fetchVehicles = async () => {
  try {
    const response = await getVehicles(pageNo, pageSize);
    console.log("response", response);

    const vehiclesData = response.data?.data?.vehicles;
    const summaryData = response.data?.data?.summary;

    if (vehiclesData?.items?.length) {
      const mappedData = vehiclesData.items.map((v: any) => {
        const type = vehicleTypes.find((t) => t.id === v.vehicleTypeId);
        const brand = vehicleBrands.find((b) => b.id === v.vehicleBrandOemId);

        return {
          vehicleId: v.id,
          registrationNumber: v.vehicleNumber,
          vinNumber: v.vinOrChassisNumber,
          vehicleType: type
            ? type.vehicleTypeName
            : getVehicleTypes(v.vehicleTypeId),
          vehicleBrand: brand
            ? brand.name
            : getVehicleBrand(v.vehicleBrandOemId),
          ownershipBasis: v.ownershipType?.toUpperCase() || "UNKNOWN",
          lessorName: v.leasedVendorId ? `Vendor #${v.leasedVendorId}` : null,
          status: v.status,
          updatedAt: v.updatedAt || v.createdAt || null,
        };
      });

      // ✅ Use summary from response.data.data.summary
      setSummaryData({
        totalFleetSize: summaryData.totalFleetSize,
        inService: summaryData.inService,
        offRoadOrOutOfService: summaryData.outOfService,
        activeAccounts: summaryData.inService,
      });

      setData(mappedData);
      setTotalRecords(vehiclesData.totalRecords);
    } else {
      toast.error("Failed to fetch vehicles");
    }
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    toast.error("An error occurred while loading vehicles");
  }
};

  useEffect(() => {
    fetchVehicles();
  }, [pageNo, pageSize, vehicleTypes, vehicleBrands]);

  const handleEdit = (row: VehicleItem) => {
    router.push(`/vehicles/${row.vehicleId}`);
  };

  const handleDelete = (row: VehicleItem) => {
    setVehicleToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      const response = await deleteVehicle(vehicleToDelete.vehicleId);
      if (response && response.statusCode === 200) {
        toast.success("Vehicle removed from registry!");
        fetchVehicles();
      } else {
        toast.error(response.message || "Failed to delete vehicle");
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("An error occurred while deleting.");
    } finally {
      setVehicleToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div className={`min-h-screen ${isDark ? "bg-background" : ""} p-2`}>
        <PageHeader
          title="Fleet Registry"
          subtitle="Provision and manage organizational vehicles and asset identities."
          breadcrumbs={[{ label: "Fleet" }, { label: "Fleet Registry" }]}
          showButton={true}
          buttonText="Provision New Vehicle"
          buttonRoute="/vehicles/0"
          showExportButton={true}
          ExportbuttonText="Export"
          onExportClick={() => toast.info("Export coming soon!")}
          showFilterButton={false}
        />

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Truck}
            label="Total Fleet Size"
            value={summaryData.totalFleetSize}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            isDark={isDark}
          />
          <MetricCard
            icon={ShieldCheck}
            label="In Service"
            value={summaryData.inService}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            isDark={isDark}
          />
          <MetricCard
            icon={AlertCircle}
            label="Off-Road / Out of Service"
            value={summaryData.offRoadOrOutOfService}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            isDark={isDark}
          />
          <MetricCard
            icon={Activity}
            label="Active Accounts"
            value={summaryData.activeAccounts}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
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
          searchPlaceholder="Search vehicles..."
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          defaultRowsPerPage={10}
          pageNo={pageNo}
          pageSize={pageSize}
          onPageChange={(page) => setPageNo(page)}
          totalRecords={totalRecords}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNo(1);
          }}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setVehicleToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Remove Vehicle"
          message={`Are you sure you want to remove "${vehicleToDelete?.registrationNumber}" from the registry? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
};

export default Vehicles;
