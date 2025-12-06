import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getClientById } from "../../../api/clients";
import type { Client } from "../../../types/Client";

export const useClientProfile = () => {
  const { user } = useAuth();
  const clientId = user?.clientId ? Number(user.clientId) : undefined;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await getClientById(clientId);
        setClient(res.client);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId]);

  return { clientId, client, loading };
};
