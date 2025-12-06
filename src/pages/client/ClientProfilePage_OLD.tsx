import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import { getClientById } from "../../api/clients";
import type { Client } from "../../types/Client";

import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Divider,
  Box,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { translate } from "../../utils/translate";

const ClientProfilePage = () => {
  const { user } = useAuth();
  const clientId = user?.clientId ? Number(user.clientId) : undefined;
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getClientById(clientId);
        setClient(data.client);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId]);

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
        Mi Perfil de Empresa
      </Typography>

      <Card elevation={3}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h5">
                {client.companyName}
              </Typography>
              <Chip
                label={translate("client", client.status)}
                color={client.status === "ACTIVE" ? "success" : "default"}
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate("/client/profile/edit")}
            >
              Editar cliente
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ lineHeight: 1.8 }}>
            <Typography><strong>CIF:</strong> {client.cif}</Typography>
            <Typography><strong>Email:</strong> {client.email}</Typography>
            <Typography><strong>Teléfono:</strong> {client.phoneNumber}</Typography>
            <Typography><strong>Dirección:</strong> {client.address}</Typography>
            <Typography>
              <strong>Fecha de registro:</strong>{" "}
              {new Date(client.registrationDate).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProfilePage;

