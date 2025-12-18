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
import { Eye } from "lucide-react";

// MUI
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

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

        <TextField
          label="Buscar líneas"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{
            minWidth: 240,
            "& .MuiOutlinedInput-root": { color: "text.primary" },
            "& .MuiInputLabel-root": { color: "text.secondary" },
          }}
        />
      </div>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={1}
        className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      >
        <Table className="text-slate-700 dark:text-slate-200">
          <TableHead className="bg-slate-50 dark:bg-slate-900">
            <TableRow>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>ID</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Número</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Tarifa</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Estado</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Operador</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Empleado</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Dispositivo</strong></TableCell>
              <TableCell align="right" className="text-slate-700 dark:text-slate-300"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody className="bg-white dark:bg-slate-900">
            {filteredLines.map((l) => (
              <TableRow key={l.id} hover>
                <TableCell className="text-slate-700 dark:text-slate-200">{l.id}</TableCell>
                <TableCell className="text-slate-700 dark:text-slate-200">{l.phoneNumber}</TableCell>
                <TableCell className="text-slate-700 dark:text-slate-200">{l.tariffType}</TableCell>
                <TableCell>
                  <LineStatusChip status={l.status} />
                </TableCell>
                <TableCell>
                  <OperatorChip operator={l.operator} />
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-200">{l.employeeId ?? "—"}</TableCell>
                <TableCell className="text-slate-700 dark:text-slate-200">{l.deviceId ?? "—"}</TableCell>

                {/* Eye button actions */}
                <TableCell align="right">
                  <IconButton
                    onClick={() => openDetails(l)}
                    className="hover:bg-slate-200 dark:hover:bg-slate-800 p-1"
                  >
                    <Eye size={18} className="text-slate-600 dark:text-slate-200" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filteredLines.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography
                    variant="body1"
                    align="center"
                    sx={{ py: 3 }}
                    color="text.secondary"
                  >
                    No se han encontrado líneas con ese criterio de búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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


