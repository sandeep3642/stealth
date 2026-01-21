export interface InstanceData {
  main: string;
  sub: string;
}

export interface ContactData {
  main: string;
  sub: string;
}

export interface AccountData {
  id: number;
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
