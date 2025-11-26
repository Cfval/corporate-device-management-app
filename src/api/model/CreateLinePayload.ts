export interface CreateLinePayload {
  phoneNumber: string;
  tariffType?: string | null;
  iccid?: string | null;
  simType?: string | null;
  pin?: string | null;
  puk?: string | null;
  operator: string;
  status: string;
  clientId: number;
  employeeId?: number | null;
  deviceId?: number | null;
}

