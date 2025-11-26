export interface ClientReport {
    clientId: number;
    clientName: string;
    totalUsers: number;
    activeUsers: number;
    totalLines: number;
    activeLines: number;
    totalDevices: number;
    activeLineNumbers: string[];
  }
  
  export interface DeviceHealthReport {
    clientId: number;
    clientName: string;
    totalDevices: number;
    assignedDevices: number;
    storageDevices: number;
    repairDevices: number;
    lostDevices: number;
    decommissionedDevices: number;
  }
  
  export interface LineUsageReport {
    clientId: number;
    clientName: string;
    totalLines: number;
    activeLines: number;
    suspendedLines: number;
    deactivatedLines: number;
    linesByOperator: Record<string, number>;
    unassignedLines: number;
  }
  
  export interface SystemReport {
    reportName: string;
    generatedAt: string;
    totalClients: number;
    totalUsers: number;
    totalDevices: number;
    totalLines: number;
  }
  