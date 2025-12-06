import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getClientById } from "../../../api/clients";
import type { Client } from "../../../types/Client";
import type { UpdateClientPayload } from "../../../api/model/UpdateClientPayload";

export const useClientEdit = () => {
  const { user } = useAuth();
  const clientId = user?.clientId ? Number(user.clientId) : undefined;

  const [client, setClient] = useState<Client | null>(null);
  const [form, setForm] = useState<UpdateClientPayload>({
    companyName: "",
    cif: "",
    email: "",
    phoneNumber: "",
    address: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getClientById(clientId);

        setClient(data.client);

        setForm({
          companyName: data.client.companyName,
          cif: data.client.cif,
          email: data.client.email,
          phoneNumber: data.client.phoneNumber,
          address: data.client.address,
          status: data.client.status as "ACTIVE" | "INACTIVE",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId]);

  const extractDbErrorMessage = (raw: string): string => {
    const match = raw.match(/\[ERROR:\s*([^\]]+)\]/);
    return match?.[1] ? "ERROR: " + match[1].trim() : raw;
  };

  return {
    clientId,
    client,
    form,
    setForm,
    loading,
    saving,
    setSaving,
    extractDbErrorMessage,
  };
};
