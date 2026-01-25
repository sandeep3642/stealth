export interface FormData {
  accountName: string;
  accountCode: string;
  accountId: number;
  primaryDomain: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  location: string;
  roleId: number;
}

export interface UserItem {
  userId: string;
  fullName: string;
  email: string;
  roleId: number;
  roleName: string;
  accountId: number;
  accountName: string;
  status: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
}
