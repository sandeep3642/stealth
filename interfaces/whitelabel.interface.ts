// White Label Interface
export interface WhiteLabel {
  whiteLabelId: number;
  accountId: number;
  accountName: string;
  customEntryFqdn: string;
  logoUrl: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  isActive: boolean;
  createdOn: string;
  updatedOn: string | null;
}

// White Label Form Data (for Add/Edit)
export interface WhiteLabelFormData {
  accountId: number;
  customEntryFqdn: string;
  logoUrl: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  isActive: boolean;
}

// White Label Update Data (PUT request)
export interface WhiteLabelUpdateData {
  customEntryFqdn: string;
  logoUrl: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  isActive: boolean;
}

// Paginated Response Interface
export interface WhiteLabelPaginatedResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    items: WhiteLabel[];
  };
}

// Single Item Response Interface
export interface WhiteLabelResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: WhiteLabel | null;
}

