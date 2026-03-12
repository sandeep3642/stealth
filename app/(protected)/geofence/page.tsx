"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import CommonTable from "@/components/CommonTable";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import PageHeader from "@/components/PageHeader";
import { useTheme } from "@/context/ThemeContext";
import type { GeofenceZone, ZoneStatus } from "@/interfaces/geofence.interface";
import { getFormRightForPath } from "@/services/commonServie";
import { deleteGeofence, getGeofences } from "@/services/geofenceService";

const STATUS_STYLE: Record<ZoneStatus, string> = {
  enabled: "bg-emerald-100 text-emerald-700",
  disabled: "bg-red-100 text-red-700",
};

type ApiZone = {
  id?: string | number;
  uniqueCode?: string;
  displayName?: string;
  classificationCode?: string;
  geometryType?: string;
  status?: string;
  colorTheme?: string;
  radiusM?: number;
  coordinates?: { latitude: number; longitude: number }[];
};

export default function GeofencePage() {
  const { isDark } = useTheme();
  const router = useRouter();
  const t = useTranslations("pages.geofence.list");
  const pageRight = getFormRightForPath("/geofence");
  const canRead = pageRight ? Boolean(pageRight.canRead) : true;

  const [zones, setZones] = useState<GeofenceZone[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loadingZones, setLoadingZones] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<GeofenceZone | null>(null);
  const [summary, setSummary] = useState({
    totalZones: 0,
    enabled: 0,
    disabled: 0,
  });

  const mapApiZoneToUi = useCallback(
    (zone: ApiZone, index: number): GeofenceZone => {
      const geometry = zone?.geometryType === "POLYGON" ? "polygon" : "circle";
      const status: ZoneStatus =
        zone?.status === "ENABLED" ? "enabled" : "disabled";
      const firstCoordinate =
        Array.isArray(zone?.coordinates) && zone.coordinates.length > 0
          ? zone.coordinates[0]
          : undefined;

      return {
        id: String(zone?.id ?? `zone-${index}`),
        code: String(zone?.uniqueCode ?? `GF-${index + 1}`),
        displayName: String(zone?.displayName ?? t("fallback.unnamedZone")),
        classification: String(zone?.classificationCode ?? t("fallback.safe")),
        geometry,
        status,
        color: zone?.colorTheme || "#6366f1",
        center:
          geometry === "circle" && firstCoordinate
            ? { lat: firstCoordinate.latitude, lng: firstCoordinate.longitude }
            : undefined,
        radius: geometry === "circle" ? Number(zone?.radiusM ?? 0) : undefined,
        paths:
          geometry === "polygon"
            ? zone?.coordinates?.map((coord) => ({
                lat: coord.latitude,
                lng: coord.longitude,
              }))
            : undefined,
      };
    },
    [t],
  );

  const fetchGeofenceList = useCallback(async () => {
    try {
      if (isInitialLoad) setLoadingZones(true);
      const response = await getGeofences(pageNo, pageSize, debouncedQuery);
      if (!response?.success) return;

      const zonesData = response?.data?.zones;
      const rawList = zonesData?.items || [];
      setTotalRecords(zonesData?.totalRecords || rawList.length);
      setSummary({
        totalZones: Number(
          response?.data?.summary?.totalZones || rawList.length,
        ),
        enabled: Number(response?.data?.summary?.enabled || 0),
        disabled: Number(response?.data?.summary?.disabled || 0),
      });

      setZones(Array.isArray(rawList) ? rawList.map(mapApiZoneToUi) : []);
    } catch (error) {
      console.error("Error fetching geofences:", error);
    } finally {
      setLoadingZones(false);
      setIsInitialLoad(false);
    }
  }, [pageNo, pageSize, debouncedQuery, isInitialLoad, mapApiZoneToUi]);

  useEffect(() => {
    fetchGeofenceList();
  }, [fetchGeofenceList]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleEdit = (row: GeofenceZone) => {
    router.push(`/geofence/${row.id}`);
  };

  const handleDelete = (row: GeofenceZone) => {
    setZoneToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!zoneToDelete) return;

    try {
      const response = await deleteGeofence(zoneToDelete.id);

      if (response?.success || response?.statusCode === 200) {
        toast.success(response?.message || t("toast.deleted"));
        if (pageNo > 1 && zones.length === 1) {
          setPageNo((prev) => prev - 1);
        } else {
          fetchGeofenceList();
        }
      } else {
        toast.error(response?.message || t("toast.deleteFailed"));
      }
    } catch (error) {
      console.error("Error deleting geofence:", error);
      toast.error(t("toast.deleteError"));
    } finally {
      setZoneToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const columns = [
    {
      key: "identity",
      label: t("table.identity"),
      visible: true,
      render: (_: string, row: GeofenceZone) => (
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: row.color }}
          />
          <div className="min-w-0">
            <button
              type="button"
              className={`text-sm font-semibold truncate cursor-pointer hover:underline text-left ${
                isDark ? "text-foreground" : "text-gray-900"
              }`}
              onClick={() => router.push(`/geofence/${row.id}`)}
            >
              {row.displayName}
            </button>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
              >
                {row.code}
              </span>
              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  isDark
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {row.classification.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "geometry",
      label: t("table.geometry"),
      visible: true,
      render: (value: GeofenceZone["geometry"]) => (
        <span
          className={`inline-flex items-center justify-center text-2xl font-bold leading-none ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
        >
          {value === "circle" ? "○" : "⬠"}
        </span>
      ),
    },
    {
      key: "status",
      label: t("table.status"),
      visible: true,
      render: (value: ZoneStatus) => (
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded ${STATUS_STYLE[value]}`}
        >
          {value.toUpperCase()}
        </span>
      ),
    },
  ];

  if (!canRead) {
    return (
      <div className={`${isDark ? "dark" : ""} mt-10`}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-foreground">{t("noReadPermission")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? "dark" : ""} mt-10`}>
      <div
        className={`min-h-screen ${isDark ? "bg-background" : ""} p-2 sm:p-0 md:p-2`}
      >
        <div className="mb-4 sm:mb-6">
          <PageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            breadcrumbs={[
              { label: t("breadcrumbs.fleet") },
              { label: t("breadcrumbs.current") },
            ]}
            showButton={true}
            buttonText={t("addButton")}
            buttonRoute="/geofence/0"
            showExportButton={false}
            showFilterButton={false}
          />
        </div>

        <div className="w-full">
          {loadingZones ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {t("loading")}
            </div>
          ) : (
            <CommonTable
              columns={columns}
              data={zones.map((zone) => ({
                ...zone,
                identity: zone.displayName,
              }))}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions={true}
              searchPlaceholder={t("searchPlaceholder")}
              rowsPerPageOptions={[5, 10, 25, 50]}
              pageNo={pageNo}
              pageSize={pageSize}
              onPageChange={setPageNo}
              onPageSizeChange={setPageSize}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalRecords={totalRecords}
              isServerSide={true}
            />
          )}
        </div>

        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setZoneToDelete(null);
          }}
          onConfirm={confirmDelete}
          title={t("deleteTitle")}
          message={t("deleteMessage", {
            name: zoneToDelete?.displayName || "",
          })}
          confirmText={t("confirmDelete")}
          cancelText={t("cancel")}
          type="danger"
          isDark={isDark}
        />
      </div>
    </div>
  );
}
