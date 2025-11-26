import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { getClients } from "../../api/clients";
import type { Client } from "../../types/Client";

import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TextField,
  Button,
} from "@mui/material";
import { ClientStatusChip } from "../../components/ui/ClientStatusChip";

const AdminClientsPage = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getClients();
        // backend: { clientsList, totalClients, totalClientsFiltered }
        setClients([...data.clientsList].sort((a, b) => a.id - b.id));
        setTotalClients(data.totalClients);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la lista de clientes.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Filtro simple por nombre o email en el front
  const filteredClients = clients.filter((c) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;

    return (
      c.companyName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.cif.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <Box className="flex justify-center py-10">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6">
        <Typography variant="h5" color="error" className="mb-4">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="p-6">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestión de clientes
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Total de clientes: {totalClients}
          </Typography>
        </Box>

        <TextField
          label="Buscar por nombre, CIF o email"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
        />
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Empresa</strong></TableCell>
              <TableCell><strong>CIF</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Teléfono</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id} hover>
                <TableCell>{client.id}</TableCell>
                <TableCell>{client.companyName}</TableCell>
                <TableCell>{client.cif}</TableCell>
                <TableCell
                  sx={{
                    maxWidth: 240,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={client.email}
                >
                  {client.email}
                </TableCell>
                <TableCell>{client.phoneNumber}</TableCell>
                <TableCell>
                  <ClientStatusChip status={client.status} />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/admin/clients/${client.id}`)}
                  >
                    Ver detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    No se han encontrado clientes con ese criterio de búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminClientsPage;

