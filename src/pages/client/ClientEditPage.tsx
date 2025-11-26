import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import { getClientById, updateClient } from "../../api/clients";
import type { UpdateClientPayload } from "../../api/model/UpdateClientPayload";
import type { Client } from "../../types/Client";
import { Notification } from "../../components/ui/Notification";

import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
  Button,
  Box,
  Divider,
} from "@mui/material";
import { translate } from "../../utils/translate";

const ClientEditPage = () => {
  const { user } = useAuth();
  const clientId = user?.clientId ? Number(user.clientId) : undefined;
  const navigate = useNavigate();

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    if (!clientId) return;
  
    const load = async () => {
      setLoading(true);
      try {
        const data = await getClientById(clientId);
  
        setClient(data.client);
  
        setForm({
          companyName: data.client.companyName,
          cif: data.client.cif,          // obligatorio
          email: data.client.email,
          phoneNumber: data.client.phoneNumber,
          address: data.client.address,
          status: data.client.status as "ACTIVE" | "INACTIVE",  // <-- evita errores de TS
        });
      } finally {
        setLoading(false);
      }
    };
  
    load();
  }, [clientId]);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      status: e.target.value as "ACTIVE" | "INACTIVE",  // <-- evitar TS errors
    }));
  };

  const extractDbErrorMessage = (raw: string): string => {
    // Buscar el patrón [ERROR: ...] - los corchetes necesitan ser escapados en regex
    // Usamos .*? (non-greedy) para capturar hasta el primer ] que cierra
    const match = raw.match(/\[ERROR:\s*([^\]]+)\]/);
    if (match && match[1]) {
      return "ERROR: " + match[1].trim();
    }
    // Si no encuentra el patrón, devolver el mensaje original
    return raw;
  };

  const showMessage = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    setSaving(true);
    try {
      await updateClient(clientId, form);
      showMessage("Cliente actualizado correctamente", "success");
      // Retrasar la navegación para que se vea el mensaje de éxito
      setTimeout(() => {
        navigate("/client/profile");
      }, 1500); // 1.5 segundos para ver el mensaje
    } catch (err: any) {
      console.error(err);
      const rawMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al actualizar el cliente";
      console.log("Raw error message:", rawMessage); // Debug temporal
      const prettyMessage = extractDbErrorMessage(rawMessage);
      console.log("Extracted message:", prettyMessage); // Debug temporal
      showMessage(prettyMessage, "error");
      setSaving(false); // Solo desactivar loading en error, en éxito se navega
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <CircularProgress />
      </div>
    );
  }

  if (!client) {
    return (
      <Typography variant="h6" className="text-center mt-6">
        No se encontró información del cliente.
      </Typography>
    );
  }

  return (
    <div className="p-6">
      <Typography variant="h4" className="mb-6">
        Editar datos de la empresa
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {client.companyName}
              </Typography>

              <Button
                variant="outlined"
                onClick={() => navigate("/client/profile")}
                disabled={saving}
              >
                Cancelar
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Nombre de la empresa"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="CIF"
                name="cif"
                value={form.cif}
                fullWidth
                disabled
              />

              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Teléfono"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                label="Dirección"
                name="address"
                value={form.address}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />

              <TextField
                select
                label="Estado"
                name="status"
                value={form.status}
                onChange={handleStatusChange}
                fullWidth
              >
                <MenuItem value="ACTIVE">{translate("client", "ACTIVE")}</MenuItem>
                <MenuItem value="INACTIVE">{translate("client", "INACTIVE")}</MenuItem>
              </TextField>

              <TextField
                label="Fecha de registro"
                value={new Date(client.registrationDate).toLocaleDateString()}
                fullWidth
                disabled
              />
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={4}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ClientEditPage;

