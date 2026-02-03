export interface InstanceData {
  main: string;
  sub: string;
}

export interface ContactData {
  main: string;
  sub: string;
}

export interface AccountData {
  accountId: number;
  no: number;
  code: string;
  instance: InstanceData;
  contact: ContactData;
  location: string;
  status: string;
}

export interface FormData {
  accountName: string;
  accountCode: string;
  categoryId: number;
  primaryDomain: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  location: string;
}

export interface Category {
  categoryId: number;
  labelName: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AccountRights {
  formId: number;
  formCode: string;
  formName: string;
  pageUrl: string;
  icon: string;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canAll: boolean;
}


