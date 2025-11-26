import type { Client } from "../../types/Client";

export interface ClientsListResponse {
  clientsList: Client[];
  totalClients: number;
  totalClientsFiltered: number;
}

