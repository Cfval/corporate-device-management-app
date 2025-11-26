export type UserRole = "ADMIN" | "CLIENT";

export interface User {
  role: UserRole;
  clientId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (role: UserRole, clientId?: string) => void;
  logout: () => void;
}

