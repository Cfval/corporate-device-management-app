export type UserRoleValue =
  | "ADMIN"
  | "EMPLOYEE"
  | "MANAGER"
  | "TECHNICIAN"
  | "ANALYST"
  | "SUPPORT";

export type UserStatusValue = "ACTIVE" | "INACTIVE";

export interface CreateUserPayload {
  fullName: string;
  email: string;
  department: string;
  status: UserStatusValue;
  role: UserRoleValue;
  clientId: number;
  lineId: number | null;
}

