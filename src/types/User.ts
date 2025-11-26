export interface User {
    id: number;
    fullName: string;
    email: string;
    department: string;         
    registrationDate: string;
    status: string;             // ACTIVE / INACTIVE
    role: string;
    clientId: number;
    lineId: number | null;      // opcional en JPA/JSON
  }
  