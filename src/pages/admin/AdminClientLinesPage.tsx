import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "react-router-dom";

import { getLinesByClient } from "../../api/lines";
import type { Line } from "../../types/Line";

// Chips
import { LineStatusChip } from "../../components/ui/LineStatusChip";
import { OperatorChip } from "../../components/ui/OperatorChip";

// Modal
import { LineDetailsModal } from "../../components/lines/LineDetailsModal";

// Icons
import { Eye, Search } from "lucide-react";

// MUI
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const AdminClientLinesPage = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = id ? Number(id) : undefined;

  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");

  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openDetails = (line: Line) => {
    setSelectedLine(line);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedLine(null);
    setModalOpen(false);
  };

  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await getLinesByClient(clientId);
        setLines([...res.lines].sort((a, b) => a.id - b.id));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredLines = lines.filter((l) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;

    return (
      l.id.toString().includes(term) ||
      l.phoneNumber.toLowerCase().includes(term) ||
      l.tariffType.toLowerCase().includes(term) ||
      l.status.toLowerCase().includes(term) ||
      l.operator.toLowerCase().includes(term) ||
      (l.employeeId?.toString() ?? "").includes(term) ||
      (l.deviceId?.toString() ?? "").includes(term)
    );
  });

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </Box>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="px-6 py-6 max-w-screen-xl mx-auto">
        <Typography variant="h6" className="text-center mt-8">
          No hay líneas registradas.
        </Typography>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-screen-xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <Typography variant="h4" className="font-bold text-slate-900 dark:text-slate-50">
          Líneas del Cliente
        </Typography>

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar líneas"
            aria-label="Buscar líneas"
            className="w-72 max-w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full border-collapse text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="text-left text-sm text-slate-600 dark:text-slate-300">
              <th className="px-3 py-3 font-semibold">ID</th>
              <th className="px-3 py-3 font-semibold">Número</th>
              <th className="px-3 py-3 font-semibold">Tarifa</th>
              <th className="px-3 py-3 font-semibold">Estado</th>
              <th className="px-3 py-3 font-semibold">Operador</th>
              <th className="px-3 py-3 font-semibold">Empleado</th>
              <th className="px-3 py-3 font-semibold">Dispositivo</th>
              <th className="px-3 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredLines.map((l) => (
              <tr
                key={l.id}
                className="text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700"
              >
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{l.id}</td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{l.phoneNumber}</td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{l.tariffType}</td>
                <td className="px-3 py-3">
                  <LineStatusChip status={l.status} />
                </td>
                <td className="px-3 py-3">
                  <OperatorChip operator={l.operator} />
                </td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{l.employeeId ?? "—"}</td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{l.deviceId ?? "—"}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => openDetails(l)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/50 transition"
                      aria-label="Ver detalles de la línea"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredLines.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No se han encontrado líneas con ese criterio de búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <LineDetailsModal
        open={modalOpen}
        line={selectedLine}
        onClose={closeDetails}
      />
    </div>
  );
};

export default AdminClientLinesPage;


