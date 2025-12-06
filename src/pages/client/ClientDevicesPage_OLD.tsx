import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createDevice,
  deleteDeviceById,
  getDevicesByClient,
  updateDevice,
} from "../../api/devices";
import { getLinesByClient } from "../../api/lines";
import { getUsersByClient } from "../../api/users";

import type { Device } from "../../types/Device";
import type { Line } from "../../types/Line";
import type { User } from "../../types/User";
import type { CreateDevicePayload } from "../../api/model/CreateDevicePayload";
import type { UpdateDevicePayload } from "../../api/model/UpdateDevicePayload";

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
  Button,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Stack,
  Grow,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { DeviceStatusChip } from "../../components/ui/DeviceStatusChip";
import { DeviceDetailsModal } from "../../components/devices/DeviceDetailsModal";
import { Notification } from "../../components/ui/Notification";
import { translate } from "../../utils/translate";

type DialogMode = "create" | "edit";

const DEVICE_TYPE_OPTIONS = [
  "SMARTPHONE",
  "TABLET",
  "LAPTOP",
  "DESKTOP",
  "SMARTWATCH",
  "OTHER",
] as const;

const DEVICE_STATUS_OPTIONS = [
  "ASSIGNED",
  "STORAGE",
  "REPAIR",
  "LOST",
  "DECOMMISSIONED",
] as const;

const OS_OPTIONS = ["ANDROID", "IOS", "WINDOWS", "MACOS", "LINUX", "OTHER"];

interface DeviceFormValues {
  type: string;
  imei: string;
  brand: string;
  model: string;
  serialNumber: string;
  os: string;
  status: string;
  clientId: number;
  lineId: number | null;
  employeeId: number | null;
}

interface FormErrors {
  type?: string;
  imei?: string;
  brand?: string;
  model?: string;
  status?: string;
}

const defaultFormValues = (clientId: number): DeviceFormValues => ({
  type: "",
  imei: "",
  brand: "",
  model: "",
  serialNumber: "",
  os: "",
  status: "",
  clientId,
  lineId: null,
  employeeId: null,
});

const ClientDevicesPage = () => {
  const { user } = useAuth();
  const clientId = user?.clientId ? Number(user.clientId) : undefined;

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [formValues, setFormValues] = useState<DeviceFormValues>(
    defaultFormValues(clientId ?? 0)
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [lines, setLines] = useState<Line[]>([]);
  const [linesLoading, setLinesLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const blurActiveElement = () => {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
  };

  const showNotification = useCallback(
    (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const loadDevices = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const res = await getDevicesByClient(clientId);
      setDevices([...res.devices].sort((a, b) => a.id - b.id));
      setSelectedIds([]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudieron cargar los dispositivos.";
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  }, [clientId, showNotification]);

  const loadLines = useCallback(async () => {
    if (!clientId) return;
    setLinesLoading(true);
    try {
      const data = await getLinesByClient(clientId);
      setLines(data.lines);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudieron cargar las líneas.";
      showNotification(message, "error");
    } finally {
      setLinesLoading(false);
    }
  }, [clientId, showNotification]);

  const loadEmployees = useCallback(async () => {
    if (!clientId) return;
    setEmployeesLoading(true);
    try {
      const data = await getUsersByClient(clientId);
      setEmployees(data.users);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudieron cargar los usuarios.";
      showNotification(message, "error");
    } finally {
      setEmployeesLoading(false);
    }
  }, [clientId, showNotification]);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    loadDevices();
    loadLines();
    loadEmployees();
  }, [clientId, loadDevices, loadLines, loadEmployees]);

  useEffect(() => {
    if (clientId) {
      setFormValues((prev) => ({ ...prev, clientId }));
    }
  }, [clientId]);

  const openDetails = (device: Device) => {
    blurActiveElement();
    setSelectedDevice(device);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setSelectedDevice(null);
    setDetailsOpen(false);
  };

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

  const selectableLines = useMemo(() => {
    if (lines.length === 0) return [];
    return lines.filter((line) => {
      if (line.deviceId == null) return true;
      if (dialogMode === "edit" && currentDevice?.lineId === line.id) {
        return true;
      }
      return false;
    });
  }, [lines, dialogMode, currentDevice]);

  const isAllSelected =
    selectionMode &&
    filteredDevices.length > 0 &&
    filteredDevices.every((d) => selectedIds.includes(d.id));

  const isIndeterminate =
    selectionMode &&
    selectedIds.length > 0 &&
    !isAllSelected &&
    filteredDevices.some((d) => selectedIds.includes(d.id));

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(filteredDevices.map((d) => d.id));
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredDevices.some((d) => d.id === id))
      );
    }
  };

  const handleSelectOne = (deviceId: number) => (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.target.checked) {
      setSelectedIds((prev) => [...prev, deviceId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== deviceId));
    }
  };

  const handleDeleteSelected = () => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds([]);
      return;
    }

    if (selectedIds.length === 0) {
      showNotification("Selecciona al menos un dispositivo para borrar.", "warning");
      return;
    }

    blurActiveElement();
    setConfirmDeleteOpen(true);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const resetForm = (id?: number) => {
    const resolvedClientId = id ?? clientId ?? 0;
    setFormValues(defaultFormValues(resolvedClientId));
    setFormErrors({});
    setCurrentDevice(null);
  };

  const handleOpenCreate = () => {
    if (!clientId) {
      showNotification("No se ha encontrado el cliente actual.", "error");
      return;
    }
    blurActiveElement();
    setDialogMode("create");
    resetForm(clientId);
    setDialogOpen(true);
  };

  const handleOpenEdit = (device: Device) => {
    blurActiveElement();
    setDialogMode("edit");
    setCurrentDevice(device);
    setFormValues({
      type: device.type ?? "",
      imei: device.imei ?? "",
      brand: device.brand ?? "",
      model: device.model ?? "",
      serialNumber: device.serialNumber ?? "",
      os: device.os ?? "",
      status: device.status ?? "",
      clientId: device.clientId,
      lineId: device.lineId,
      employeeId: device.employeeId,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleFormValueChange = (
    field: keyof DeviceFormValues,
    value: string | number | null
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formValues.type) {
      errors.type = "El tipo es obligatorio.";
    }

    const imeiRegex = /^\d{15}$/;
    if (!imeiRegex.test(formValues.imei.trim())) {
      errors.imei = "El IMEI debe tener 15 dígitos.";
    }

    if (!formValues.brand.trim()) {
      errors.brand = "La marca es obligatoria.";
    }

    if (!formValues.model.trim()) {
      errors.model = "El modelo es obligatorio.";
    }

    if (!formValues.status) {
      errors.status = "Selecciona un estado.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const normalizeOptionalField = (value: string | number | null | undefined) => {
    if (value === "" || value === undefined) return null;
    return value;
  };

  const handleSaveDevice = async () => {
    if (!clientId) {
      showNotification("No se ha encontrado el cliente actual.", "error");
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload: CreateDevicePayload = {
        type: formValues.type,
        imei: formValues.imei.trim(),
        brand: formValues.brand.trim(),
        model: formValues.model.trim(),
        serialNumber: formValues.serialNumber.trim() || null,
        os: formValues.os || null,
        status: formValues.status,
        clientId,
        lineId: (normalizeOptionalField(formValues.lineId) as number) ?? null,
        employeeId: (normalizeOptionalField(formValues.employeeId) as number) ?? null,
      };

      if (dialogMode === "create") {
        await createDevice(payload);
        showNotification("Dispositivo creado correctamente.", "success");
      } else if (dialogMode === "edit" && currentDevice) {
        const updatePayload: UpdateDevicePayload = {
          ...payload,
          id: currentDevice.id,
        };
        await updateDevice(currentDevice.id, updatePayload);
        showNotification("Cambios guardados.", "success");
      }

      await loadDevices();
      setDialogOpen(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudo guardar el dispositivo.";
      showNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleteLoading(true);
    try {
      for (const id of selectedIds) {
        await deleteDeviceById(id);
      }
      showNotification("Dispositivos eliminados.", "success");
      await loadDevices();
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudieron eliminar los dispositivos.";
      showNotification(message, "error");
    } finally {
      setDeleteLoading(false);
      setConfirmDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <CircularProgress />
      </div>
    );
  }

  const baseColumns = 8; // ID, Tipo, Marca, Modelo, Estado, Empleado, Línea, Acciones
  const tableColumnCount = baseColumns + (selectionMode ? 1 : 0);

  return (
    <div className="p-6">
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        justifyContent="space-between"
        alignItems="flex-end"
        mb={4}
      >
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h4">Mis Dispositivos</Typography>
          <TextField
            label="Buscar dispositivos"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            sx={{ minWidth: 260 }}
          />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
          >
            Borrar selección
          </Button>
          {selectionMode && (
            <Button variant="text" color="inherit" onClick={handleCancelSelection}>
              Cancelar selección
            </Button>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            Crear dispositivo
          </Button>
        </Stack>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              {selectionMode && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Tipo</strong>
              </TableCell>
              <TableCell>
                <strong>Marca</strong>
              </TableCell>
              <TableCell>
                <strong>Modelo</strong>
              </TableCell>
              <TableCell>
                <strong>Estado</strong>
              </TableCell>
              <TableCell>
                <strong>Empleado</strong>
              </TableCell>
              <TableCell>
                <strong>Línea</strong>
              </TableCell>
              <TableCell sx={{ width: 50 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredDevices.map((device) => {
              const isRowSelected = selectionMode && selectedIds.includes(device.id);
              return (
                <TableRow
                  key={device.id}
                  hover
                  selected={isRowSelected}
                  sx={{ cursor: "pointer" }}
                  onClick={() => openDetails(device)}
                >
                  {selectionMode && (
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        color="primary"
                        checked={isRowSelected}
                        onChange={handleSelectOne(device.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{device.id}</TableCell>
                  <TableCell>{translate("type", device.type ?? "")}</TableCell>
                  <TableCell>{device.brand}</TableCell>
                  <TableCell>{device.model}</TableCell>
                  <TableCell>
                    <DeviceStatusChip status={device.status} />
                  </TableCell>
                  <TableCell>{device.employeeId ?? "—"}</TableCell>
                  <TableCell>{device.lineId ?? "—"}</TableCell>
                  <TableCell sx={{ width: 50 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Editar" arrow>
                      <IconButton color="primary" onClick={() => handleOpenEdit(device)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredDevices.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableColumnCount}>
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    {devices.length === 0
                      ? "No hay dispositivos registrados."
                      : "No se han encontrado dispositivos con ese criterio de búsqueda."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <DeviceDetailsModal open={detailsOpen} device={selectedDevice} onClose={closeDetails} />

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Grow}
        disableRestoreFocus
        disableEnforceFocus={false}
      >
        <DialogTitle>
          {dialogMode === "create" ? "Crear dispositivo" : "Editar dispositivo"}
        </DialogTitle>
        <DialogContent dividers>
          {dialogMode === "edit" && currentDevice && (
            <Box display="flex" gap={2} mb={2}>
              <TextField label="ID" value={currentDevice.id} fullWidth disabled />
            </Box>
          )}

          <Stack spacing={2}>
            <TextField
              select
              label="Tipo"
              id="type"
              name="type"
              value={formValues.type}
              onChange={(event) => handleFormValueChange("type", event.target.value)}
              error={Boolean(formErrors.type)}
              helperText={formErrors.type}
              disabled={saving}
              fullWidth
            >
              <MenuItem value="">Selecciona un tipo</MenuItem>
              {DEVICE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {translate("type", option)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="IMEI"
              id="imei"
              name="imei"
              value={formValues.imei}
              onChange={(event) => handleFormValueChange("imei", event.target.value)}
              error={Boolean(formErrors.imei)}
              helperText={formErrors.imei ?? "15 dígitos"}
              disabled={saving}
              fullWidth
            />

            <TextField
              label="Marca"
              id="brand"
              name="brand"
              value={formValues.brand}
              onChange={(event) => handleFormValueChange("brand", event.target.value)}
              error={Boolean(formErrors.brand)}
              helperText={formErrors.brand}
              disabled={saving}
              fullWidth
            />

            <TextField
              label="Modelo"
              id="model"
              name="model"
              value={formValues.model}
              onChange={(event) => handleFormValueChange("model", event.target.value)}
              error={Boolean(formErrors.model)}
              helperText={formErrors.model}
              disabled={saving}
              fullWidth
            />

            <TextField
              label="Número de serie"
              id="serialNumber"
              name="serialNumber"
              value={formValues.serialNumber}
              onChange={(event) =>
                handleFormValueChange("serialNumber", event.target.value)
              }
              disabled={saving}
              fullWidth
            />

            <TextField
              select
              label="Sistema operativo"
              id="os"
              name="os"
              value={formValues.os}
              onChange={(event) => handleFormValueChange("os", event.target.value)}
              disabled={saving}
              fullWidth
            >
              <MenuItem value="">Selecciona un sistema operativo</MenuItem>
              {OS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Estado"
              id="status"
              name="status"
              value={formValues.status}
              onChange={(event) => handleFormValueChange("status", event.target.value)}
              error={Boolean(formErrors.status)}
              helperText={formErrors.status}
              disabled={saving}
              fullWidth
            >
              <MenuItem value="">Selecciona un estado</MenuItem>
              {DEVICE_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {translate("device", option)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Línea asociada"
              id="lineId"
              name="lineId"
              value={formValues.lineId ?? ""}
              onChange={(event) =>
                handleFormValueChange(
                  "lineId",
                  event.target.value === "" ? null : Number(event.target.value)
                )
              }
              disabled={saving || linesLoading}
              helperText={
                linesLoading ? "Cargando líneas..." : "Opcional: selecciona una línea libre"
              }
              fullWidth
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {selectableLines.map((line) => (
                <MenuItem key={line.id} value={line.id}>
                  {line.phoneNumber} • {line.operator}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Empleado asignado"
              id="employeeId"
              name="employeeId"
              value={formValues.employeeId ?? ""}
              onChange={(event) =>
                handleFormValueChange(
                  "employeeId",
                  event.target.value === "" ? null : Number(event.target.value)
                )
              }
              disabled={saving || employeesLoading}
              helperText={
                employeesLoading
                  ? "Cargando usuarios..."
                  : "Opcional: asigna el dispositivo a un usuario"
              }
              fullWidth
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.fullName} (#{emp.id})
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveDevice} disabled={saving}>
            {saving ? <CircularProgress size={22} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        TransitionComponent={Grow}
        disableRestoreFocus
        disableEnforceFocus={false}
      >
        <DialogTitle>Eliminar dispositivos seleccionados</DialogTitle>
        <DialogContent dividers>
          <Typography>
            ¿Seguro que quieres eliminar {selectedIds.length}{" "}
            {selectedIds.length === 1 ? "dispositivo" : "dispositivos"}? Esta acción no se
            puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={22} /> : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ClientDevicesPage;



