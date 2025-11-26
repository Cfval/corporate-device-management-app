import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { getUsersByClient } from "../../api/users";
import type { User } from "../../types/User";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  TextField,
  Box,
  Container,
} from "@mui/material";

import { UserStatusChip } from "../../components/ui/UserStatusChip";
import { UserRoleChip } from "../../components/ui/UserRoleChip";

const AdminClientUsersPage = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = id ? Number(id) : undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      setLoading(true);

      try {
        const data = await getUsersByClient(clientId);
        setUsers([...data.users].sort((a, b) => a.id - b.id));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;

    return (
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.department ?? "").toLowerCase().includes(term) ||
      u.status.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" className="text-center mt-8">
          No hay usuarios registrados en este cliente.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          Usuarios del Cliente
        </Typography>

        <TextField
          label="Buscar usuarios"
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
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Departamento</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Rol</strong></TableCell>
              <TableCell><strong>Registro</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.fullName}</TableCell>

                <TableCell
                  sx={{
                    maxWidth: 220,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={u.email}
                >
                  {u.email}
                </TableCell>

                <TableCell>{u.department}</TableCell>

                <TableCell>
                  <UserStatusChip status={u.status} />
                </TableCell>

                <TableCell>
                  <UserRoleChip role={u.role} />
                </TableCell>

                <TableCell>
                  {new Date(u.registrationDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}

            {filteredUsers.length === 0 && users.length > 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    No se han encontrado usuarios con ese criterio de búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminClientUsersPage;

