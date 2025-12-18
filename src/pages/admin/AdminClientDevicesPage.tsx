import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "react-router-dom";

import { getDevicesByClient } from "../../api/devices";
import type { Device } from "../../types/Device";

import { DeviceStatusChip } from "../../components/ui/DeviceStatusChip";
import { DeviceDetailsModal } from "../../components/devices/DeviceDetailsModal";
import { translate } from "../../utils/translate";

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
      <Box className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </Box>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="px-6 py-6 max-w-screen-xl mx-auto">
        <Typography variant="h6" className="text-center mt-8">
          No hay dispositivos registrados.
        </Typography>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-screen-xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <Typography variant="h4" className="font-bold text-slate-900 dark:text-slate-50">
          Dispositivos del Cliente
        </Typography>

        <TextField
          label="Buscar dispositivos"
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

      {/* Tabla */}
      <TableContainer
        component={Paper}
        elevation={1}
        className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      >
        <Table className="text-slate-700 dark:text-slate-200">
          <TableHead className="bg-slate-50 dark:bg-slate-900">
            <TableRow>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>ID</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Tipo</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Marca</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Modelo</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Estado</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Empleado</strong></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-300"><strong>Línea</strong></TableCell>
              <TableCell align="right" className="text-slate-700 dark:text-slate-300"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody className="bg-white dark:bg-slate-900">
            {filteredDevices.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell className="text-slate-700 dark:text-slate-200">{d.id}</TableCell>
                <TableCell className="text-slate-700 dark:text-slate-200">{translate("type", d.type ?? "")}</TableCell>
                <TableCell className="text-slate-700 dark:text-slate-200">{d.brand}</TableCell>
                <TableCell className="text-slate-700 dark:text-slate-200">{d.model}</TableCell>
                <TableCell>
                  <DeviceStatusChip status={d.status} />
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-200">{d.employeeId ?? "—"}</TableCell>
                <TableCell className="text-slate-700 dark:text-slate-200">{d.lineId ?? "—"}</TableCell>

                {/* Actions */}
                <TableCell align="right">
                  <IconButton
                    onClick={() => openDetails(d)}
                    className="hover:bg-slate-200 dark:hover:bg-slate-800 p-1"
                  >
                    <Eye size={18} className="text-slate-600 dark:text-slate-200" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filteredDevices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography
                    variant="body1"
                    align="center"
                    sx={{ py: 3 }}
                    color="text.secondary"
                  >
                    No se han encontrado dispositivos con ese criterio de búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <DeviceDetailsModal
        open={modalOpen}
        device={selectedDevice}
        onClose={closeDetails}
      />
    </div>
  );
};

export default AdminClientDevicesPage;

