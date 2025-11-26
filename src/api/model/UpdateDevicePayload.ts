import type { CreateDevicePayload } from "./CreateDevicePayload";

export interface UpdateDevicePayload extends CreateDevicePayload {
  id: number;
}

