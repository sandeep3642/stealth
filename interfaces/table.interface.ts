export interface Column {
  key: string;
  label: string;
  visible?: boolean;
  type?: "badge" | "link" | "icon-text" | "multi-line";
  icon?: React.ReactNode;
  mainStyle?: string;
  subStyle?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface CommonTableProps {
  columns?: Column[];
  data?: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  showActions?: boolean;
  searchPlaceholder?: string;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
}
