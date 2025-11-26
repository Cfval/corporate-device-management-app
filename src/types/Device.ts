export interface Device {
    id: number;
    type: string;
    imei: string;               
    brand: string;              
    model: string;              
    serialNumber: string;       
    os: string;                 
    status: string;
    activationDate: string;
    clientId: number;
    lineId: number | null;      // nullable en JSON
    employeeId: number | null;  // nullable en JSON
  }
  