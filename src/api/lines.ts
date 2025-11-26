import { api } from "./http";
import type { LinesByClientResponse } from "./model/LinesByClientResponse";
import type { CreateLinePayload } from "./model/CreateLinePayload";
import type { UpdateLinePayload } from "./model/UpdateLinePayload";

export const getLinesByClient = async (clientId: number) => {
  const res = await api.get<LinesByClientResponse>(`/lines/client/${clientId}`);
  return res.data;
};

export const createLine = async (payload: CreateLinePayload) => {
  const res = await api.post("/lines", payload);
  return res.data;
};

export const updateLine = async (id: number, payload: UpdateLinePayload) => {
  const res = await api.put(`/lines/${id}`, payload);
  return res.data;
};

export const deleteLineById = async (id: number) => {
  return api.delete(`/lines/${id}`);
};
