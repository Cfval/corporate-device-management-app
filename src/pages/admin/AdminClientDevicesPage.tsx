import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { getDevicesByClient } from "../../api/devices";
import type { Device } from "../../types/Device";

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

import { DeviceStatusChip } from "../../components/ui/DeviceStatusChip";
import { DeviceDetailsModal } from "../../components/devices/DeviceDetailsModal";
import { translate } from "../../utils/translate";

const AdminClientDevicesPage = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = id ? Number(id) : undefined;

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openDetails = (device: Device) => {
    setSelectedDevice(device);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedDevice(null);
    setModalOpen(false);
  };

  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      setLoading(true);

      try {
        const res = await getDevicesByClient(clientId);
        setDevices([...res.devices].sort((a, b) => a.id - b.id));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredDevices = devices.filter((d) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;

    return (
      d.id.toString().includes(term) ||
      d.type.toLowerCase().includes(term) ||
      (d.brand ?? "").toLowerCase().includes(term) ||
      (d.model ?? "").toLowerCase().includes(term) ||
      d.status.toLowerCase().includes(term) ||
      (d.employeeId?.toString() ?? "").includes(term) ||
      (d.lineId?.toString() ?? "").includes(term)
    );
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (devices.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" className="text-center mt-8">
          No hay dispositivos registrados.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">
          Dispositivos del Cliente
        </Typography>

        <TextField
          label="Buscar dispositivos"
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
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Marca</strong></TableCell>
              <TableCell><strong>Modelo</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Empleado</strong></TableCell>
              <TableCell><strong>Línea</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDevices.map((d) => (
              <TableRow
                key={d.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => openDetails(d)}
              >
                <TableCell>{d.id}</TableCell>
                <TableCell>{translate("type", d.type ?? "")}</TableCell>
                <TableCell>{d.brand}</TableCell>
                <TableCell>{d.model}</TableCell>
                <TableCell><DeviceStatusChip status={d.status} /></TableCell>
                <TableCell>{d.employeeId ?? "—"}</TableCell>
                <TableCell>{d.lineId ?? "—"}</TableCell>
              </TableRow>
            ))}

            {filteredDevices.length === 0 && devices.length > 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    No se han encontrado dispositivos con ese criterio de búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DeviceDetailsModal
        open={modalOpen}
        device={selectedDevice}
        onClose={closeDetails}
      />
    </Container>
  );
};

export default AdminClientDevicesPage;

