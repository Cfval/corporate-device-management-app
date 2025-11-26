export interface CreateDevicePayload {
  type: string;
  imei: string;
  brand: string;
  model: string;
  serialNumber?: string | null;
  os?: string | null;
  status: string;
  clientId: number;
  lineId?: number | null;
  employeeId?: number | null;
}

