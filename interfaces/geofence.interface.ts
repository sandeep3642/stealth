export type GeometryType = "circle" | "polygon";
export type ZoneStatus = "enabled" | "disabled";
export type ZoneClassification =
  | "Warehouse"
  | "Port"
  | "Client Site"
  | "Depot"
  | "Restricted Area"
  | string;

export interface GeofenceZone {
  id: string;
  code: string;
  displayName: string;
  classification: ZoneClassification;
  geometry: GeometryType;
  status: ZoneStatus;
  color: string;
  // circle
  center?: { lat: number; lng: number };
  radius?: number;
  // polygon
  paths?: { lat: number; lng: number }[];
}
