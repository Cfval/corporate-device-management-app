import type { Device } from "../../types/Device";

export interface DevicesByClientResponse {
  devices: Device[];
  totalDevices: number;
  totalDevicesFiltered: number;
}

