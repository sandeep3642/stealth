export interface FormMasterItem {
  formId: number;
  formCode: string;
  formName: string;
  moduleName: string;
  pageUrl: string;
  iconName?: string;
  sortOrder?: number;
  isMenu?: boolean;
  isVisible?: boolean;
  isActive: boolean;
}

export interface FormMasterPayload {
  formCode: string;
  formName: string;
  moduleName: string;
  pageUrl: string;
  iconName: string;
  sortOrder: number;
  isMenu: boolean;
  isVisible: boolean;
  isActive: boolean;
}
