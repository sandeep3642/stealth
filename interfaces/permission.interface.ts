export interface Permission {
  formId: number;
  formCode: string;
  formName: string;
  moduleName: string;
  pageUrl: string;
  isActive: boolean;
  resource: string; // for UI label
  read: boolean;
  write: boolean;
  delete: boolean;
  export: boolean;
}

export interface RoleFormData {
  account: string;
  roleName: string;
  description: string;
  permissions: Permission[];
}
