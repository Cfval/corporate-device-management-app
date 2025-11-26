import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { getLinesByClient } from "../../api/lines";
import type { Line } from "../../types/Line";

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  CircularProgress,
  TextField,
  Box,
  Container,
} from "@mui/material";

import { LineStatusChip } from "../../components/ui/LineStatusChip";
import { OperatorChip } from "../../components/ui/OperatorChip";
import { LineDetailsModal } from "../../components/lines/LineDetailsModal";

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (lines.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" className="text-center mt-8">
          No hay líneas registradas.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          Líneas del Cliente
        </Typography>

        <TextField
          label="Buscar líneas"
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
              <TableCell><strong>Número</strong></TableCell>
              <TableCell><strong>Tarifa</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Operador</strong></TableCell>
              <TableCell><strong>Empleado</strong></TableCell>
              <TableCell><strong>Dispositivo</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredLines.map((line) => (
              <TableRow
                key={line.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => openDetails(line)}
              >
                <TableCell>{line.id}</TableCell>
                <TableCell>{line.phoneNumber}</TableCell>
                <TableCell>{line.tariffType}</TableCell>
                <TableCell>
                  <LineStatusChip status={line.status} />
                </TableCell>
                <TableCell>
                  <OperatorChip operator={line.operator} />
                </TableCell>
                <TableCell>{line.employeeId ?? "—"}</TableCell>
                <TableCell>{line.deviceId ?? "—"}</TableCell>
              </TableRow>
            ))}

            {filteredLines.length === 0 && lines.length > 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    No se han encontrado líneas con ese criterio de búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <LineDetailsModal
        open={modalOpen}
        line={selectedLine}
        onClose={closeDetails}
      />
    </Container>
  );
};

export default AdminClientLinesPage;

