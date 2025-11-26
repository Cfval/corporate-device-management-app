import type { User } from "../../types/User";

export interface UsersByClientResponse {
  users: User[];
  totalUsers: number;
  totalUsersFiltered: number;
}

