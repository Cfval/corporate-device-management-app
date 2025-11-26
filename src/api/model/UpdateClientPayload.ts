export interface UpdateClientPayload {
  companyName: string;
  cif: string;                    // obligatorio
  email: string;
  phoneNumber: string;
  address: string;
  status: "ACTIVE" | "INACTIVE";
}


