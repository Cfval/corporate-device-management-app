export type UserRoleValue =
  | "EMPLEADO"
  | "GERENTE"
  | "TÉCNICO"
  | "ANALISTA"
  | "SOPORTE"
  | "ADMIN";

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

