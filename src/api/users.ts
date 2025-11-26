import { api } from "./http";
import type { UsersByClientResponse } from "./model/UsersByClientResponse";
import type { CreateUserPayload } from "./model/CreateUserPayload";
import type { UpdateUserPayload } from "./model/UpdateUserPayload";

export const getUsersByClient = async (clientId: number) => {
  const res = await api.get<UsersByClientResponse>(`/users/client/${clientId}`);
  return res.data;
};

export const createUser = async (payload: CreateUserPayload) => {
  const res = await api.post("/users", payload);
  return res.data;
};

export const updateUser = async (id: number, payload: UpdateUserPayload) => {
  const res = await api.put(`/users/${id}`, payload);
  return res.data;
};
