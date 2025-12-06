import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { getClients } from "../../api/clients";
import type { Client } from "../../types/Client";

import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Eye } from "lucide-react";

import { motion } from "framer-motion";
import { ClientStatusChip } from "../../components/ui/ClientStatusChip";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </div>
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
    <Box className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.2 }}
        className="flex justify-between items-end flex-wrap gap-4"
      >
        <div>
          <Typography variant="h4" className="font-bold text-slate-900 mb-1">
            Gestión de clientes
          </Typography>

          <Typography variant="subtitle1" className="text-slate-500">
            Total de clientes: {totalClients}
          </Typography>
        </div>

        <TextField
          label="Buscar nombre, CIF o email"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{
            minWidth: 260,
          }}
        />
      </motion.div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-4">
        <TableContainer component="div">
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
                <TableRow
                  key={client.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(148,163,184,0.10)",
                    },
                  }}
                  onClick={() => navigate(`/admin/clients/${client.id}`)}
                >
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

                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Ver cliente" arrow>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography
                      variant="body1"
                      align="center"
                      sx={{ py: 3, color: "text.secondary" }}
                    >
                      No se han encontrado clientes con ese criterio de búsqueda.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

          </Table>
        </TableContainer>
      </div>
    </Box>
  );
};

export default AdminClientsPage;


