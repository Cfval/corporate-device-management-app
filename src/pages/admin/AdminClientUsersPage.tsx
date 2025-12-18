import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "react-router-dom";

import { getUsersByClient } from "../../api/users";
import type { User } from "../../types/User";

import { UserStatusChip } from "../../components/ui/UserStatusChip";
import { UserRoleChip } from "../../components/ui/UserRoleChip";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Search } from "lucide-react";

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
      <Box className="flex justify-center items-center min-h-[60vh]">
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
    <div className="px-6 py-6 max-w-screen-xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <Typography variant="h4" className="font-bold text-slate-900 dark:text-slate-50">
          Usuarios del Cliente
        </Typography>

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar usuarios"
            aria-label="Buscar usuarios"
            className="w-72 max-w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/40"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full border-collapse text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="text-left text-sm text-slate-600 dark:text-slate-300">
              <th className="px-3 py-3 font-semibold">ID</th>
              <th className="px-3 py-3 font-semibold">Nombre</th>
              <th className="px-3 py-3 font-semibold">Email</th>
              <th className="px-3 py-3 font-semibold">Departamento</th>
              <th className="px-3 py-3 font-semibold">Estado</th>
              <th className="px-3 py-3 font-semibold">Rol</th>
              <th className="px-3 py-3 font-semibold">Registro</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700"
              >
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{u.id}</td>
                <td className="px-3 py-3 text-slate-900 dark:text-slate-50">{u.fullName}</td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                  <span className="block truncate" title={u.email}>
                    {u.email}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                  {u.department || "—"}
                </td>
                <td className="px-3 py-3">
                  <UserStatusChip status={u.status} />
                </td>
                <td className="px-3 py-3">
                  <UserRoleChip role={u.role} />
                </td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                  {new Date(u.registrationDate).toLocaleDateString()}
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No se han encontrado usuarios con ese criterio de búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminClientUsersPage;

