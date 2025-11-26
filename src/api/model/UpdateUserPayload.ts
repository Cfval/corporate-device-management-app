import type { UserRoleValue, UserStatusValue } from "./CreateUserPayload";

export interface UpdateUserPayload {
  id: number;
  fullName: string;
  email: string;
  department: string;
  status: UserStatusValue;
  role: UserRoleValue;
  clientId: number;
  lineId: number | null;
}

