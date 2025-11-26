import { api } from "./http";
import type { ClientsListResponse } from "./model/ClientsListResponse";
import type { ClientDetailResponse } from "./model/ClientDetailResponse";
import type { UpdateClientPayload } from "./model/UpdateClientPayload";

export type { UpdateClientPayload };

export const getClients = async () => {
  const res = await api.get<ClientsListResponse>("/clients");
  return res.data;
};

export const getClientById = async (clientId: number) => {
  const res = await api.get<ClientDetailResponse>(`/clients/${clientId}`);
  return res.data;
};

export const updateClient = async (clientId: number, payload: UpdateClientPayload) => {
  const res = await api.put(`/clients/${clientId}`, payload);
  return res.data.data;   // <-- sacar el campo data
};
