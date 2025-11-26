export interface Client {
    id: number;
    companyName: string;
    cif: string;
    email: string;
    phoneNumber: string;
    address: string;
    registrationDate: string; // LocalDate → ISO string
    status: string;
  }
  