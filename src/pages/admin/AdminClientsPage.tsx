import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { getClients } from "../../api/clients";
import type { Client } from "../../types/Client";

import {
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Eye, Search } from "lucide-react";

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
    <Box className="p-6 space-y-6 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.2 }}
        className="flex justify-between items-end flex-wrap gap-4"
      >
        <div>
          <Typography variant="h4" className="font-bold text-slate-900 dark:text-slate-50 mb-1">
            Gestión de clientes
          </Typography>

          <Typography variant="subtitle1" className="text-slate-500 dark:text-slate-300">
            Total de clientes: {totalClients}
          </Typography>
        </div>

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar nombre, CIF o email"
            aria-label="Buscar nombre, CIF o email"
            className="w-72 max-w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/40"
          />
        </div>
      </motion.div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full border-collapse text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="text-left text-sm text-slate-600 dark:text-slate-300">
              <th className="px-3 py-3 font-semibold">ID</th>
              <th className="px-3 py-3 font-semibold">Empresa</th>
              <th className="px-3 py-3 font-semibold">CIF</th>
              <th className="px-3 py-3 font-semibold">Email</th>
              <th className="px-3 py-3 font-semibold">Teléfono</th>
              <th className="px-3 py-3 font-semibold">Estado</th>
              <th className="px-3 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredClients.map((client) => (
              <tr
                key={client.id}
                className="text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700 cursor-pointer"
                onClick={() => navigate(`/admin/clients/${client.id}`)}
              >
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{client.id}</td>
                <td className="px-3 py-3 text-slate-900 dark:text-slate-50">{client.companyName}</td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{client.cif}</td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                  <span className="block truncate" title={client.email}>
                    {client.email}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{client.phoneNumber}</td>
                <td className="px-3 py-3">
                  <ClientStatusChip status={client.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/clients/${client.id}`);
                      }}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/50 transition"
                      aria-label="Ver cliente"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredClients.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No se han encontrado clientes con ese criterio de búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Box>
  );
};

export default AdminClientsPage;


