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
  category: string;
  primaryDomain: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  location: string;
}
