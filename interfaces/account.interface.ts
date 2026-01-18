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
