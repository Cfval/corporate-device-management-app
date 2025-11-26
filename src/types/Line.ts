export interface Line {
    id: number;
    phoneNumber: string;
    tariffType: string;
    activationDate: string;
  
    // SIMCard VOs: siempre string, nunca null
    iccid: string;
    simType: string;
    pin: string;
    puk: string;
    operator: string;
  
    status: string;
  
    clientId: number;
    employeeId: number | null; // nullable
    deviceId: number | null;
  }
  
  