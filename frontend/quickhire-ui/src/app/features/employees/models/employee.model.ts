export interface Department {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateHired: string;
  departmentId: string;
  departmentName?: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  dateHired: string;
  departmentId: string;
}

export type UpdateEmployeeRequest = CreateEmployeeRequest;
