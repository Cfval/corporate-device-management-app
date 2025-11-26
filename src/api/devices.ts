import { api } from "./http";
import type { DevicesByClientResponse } from "./model/DevicesByClientResponse";
import type { CreateDevicePayload } from "./model/CreateDevicePayload";
import type { UpdateDevicePayload } from "./model/UpdateDevicePayload";

export const getDevicesByClient = async (clientId: number) => {
  const res = await api.get<DevicesByClientResponse>(
    `/devices/client/${clientId}`
  );
  return res.data;
};

export const createDevice = async (payload: CreateDevicePayload) => {
  const res = await api.post("/devices", payload);
  return res.data;
};

export const updateDevice = async (id: number, payload: UpdateDevicePayload) => {
  const res = await api.put(`/devices/${id}`, payload);
  return res.data;
};

export const deleteDeviceById = async (id: number) => {
  return api.delete(`/devices/${id}`);
};
