import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";

import {
  getLinesByClient,
  createLine,
  updateLine,
  deleteLineById,
} from "../../api/lines";
import { getUsersByClient } from "../../api/users";
import { getDevicesByClient } from "../../api/devices";
import type { Line } from "../../types/Line";
import type { User } from "../../types/User";
import type { Device } from "../../types/Device";
import type { CreateLinePayload } from "../../api/model/CreateLinePayload";
import type { UpdateLinePayload } from "../../api/model/UpdateLinePayload";

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
  Button,
  Checkbox,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { LineStatusChip } from "../../components/ui/LineStatusChip";
import { OperatorChip } from "../../components/ui/OperatorChip";
import { LineDetailsModal } from "../../components/lines/LineDetailsModal";
import { Notification } from "../../components/ui/Notification";
import { translate } from "../../utils/translate";

const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "DEACTIVATED"] as const;
const OPERATOR_OPTIONS = ["Movistar", "Orange", "Vodafone", "Pepephone"] as const;
const SIM_TYPE_OPTIONS = ["SIM", "ESIM", "DUAL SIM", "MULTISIM"] as const;

interface LineFormValues {
  phoneNumber: string;
  tariffType: string;
  iccid: string;
  simType: string;
  pin: string;
  puk: string;
  operator: string;
  status: string;
  clientId: number;
  employeeId: number | null;
  deviceId: number | null;
}

interface FormErrors {
  phoneNumber?: string;
  operator?: string;
  status?: string;
}

const defaultFormValues = (clientId: number): LineFormValues => ({
  phoneNumber: "",
  tariffType: "",
  iccid: "",
  simType: "",
  pin: "",
  puk: "",
  operator: "",
  status: "",
  clientId,
  employeeId: null,
  deviceId: null,
});

const ClientLinesPage = () => {
  const { user } = useAuth();
  const clientId = user?.clientId ? Number(user.clientId) : undefined;

  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [formValues, setFormValues] = useState<LineFormValues>(
    defaultFormValues(clientId ?? 0)
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [employees, setEmployees] = useState<User[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
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

  const loadLines = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const res = await getLinesByClient(clientId);
      setLines([...res.lines].sort((a, b) => a.id - b.id));
      setSelectedIds([]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudieron cargar las líneas.";
      showNotification(message, "error");
    } finally {
      setLoading(false);
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

  const loadDevices = useCallback(async () => {
    if (!clientId) return;
    setDevicesLoading(true);
    try {
      const data = await getDevicesByClient(clientId);
      setDevices(data.devices);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudieron cargar los dispositivos.";
      showNotification(message, "error");
    } finally {
      setDevicesLoading(false);
    }
  }, [clientId, showNotification]);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    loadLines();
    loadEmployees();
    loadDevices();
  }, [clientId, loadLines, loadEmployees, loadDevices]);

  useEffect(() => {
    if (clientId) {
      setFormValues((prev) => ({ ...prev, clientId }));
    }
  }, [clientId]);

  const openDetails = (line: Line) => {
    blurActiveElement();
    setSelectedLine(line);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setSelectedLine(null);
    setDetailsOpen(false);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredLines = lines.filter((line) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;

    return (
      line.id.toString().includes(term) ||
      line.phoneNumber.toLowerCase().includes(term) ||
      (line.tariffType ?? "").toLowerCase().includes(term) ||
      line.status.toLowerCase().includes(term) ||
      line.operator.toLowerCase().includes(term) ||
      (line.employeeId?.toString() ?? "").includes(term) ||
      (line.deviceId?.toString() ?? "").includes(term)
    );
  });

  const isAllSelected =
    selectionMode &&
    filteredLines.length > 0 &&
    filteredLines.every((line) => selectedIds.includes(line.id));

  const isIndeterminate =
    selectionMode &&
    selectedIds.length > 0 &&
    !isAllSelected &&
    filteredLines.some((line) => selectedIds.includes(line.id));

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(filteredLines.map((line) => line.id));
    } else {
      setSelectedIds((prev) =>
        prev.filter((id) => !filteredLines.some((line) => line.id === id))
      );
    }
  };

  const handleSelectOne = (lineId: number) => (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.target.checked) {
      setSelectedIds((prev) => [...prev, lineId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== lineId));
    }
  };

  const handleDeleteSelected = () => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds([]);
      return;
    }

    if (selectedIds.length === 0) {
      showNotification("Selecciona al menos una línea para borrar.", "warning");
      return;
    }

    blurActiveElement();
    setConfirmDeleteOpen(true);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const resetForm = (clientIdentifier?: number) => {
    const resolvedClientId = clientIdentifier ?? clientId ?? 0;
    setFormValues(defaultFormValues(resolvedClientId));
    setFormErrors({});
    setCurrentLine(null);
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

  const handleOpenEdit = (line: Line) => {
    blurActiveElement();
    setDialogMode("edit");
    setCurrentLine(line);
    setFormValues({
      phoneNumber: line.phoneNumber ?? "",
      tariffType: line.tariffType ?? "",
      iccid: line.iccid ?? "",
      simType: line.simType ?? "",
      pin: line.pin ?? "",
      puk: line.puk ?? "",
      operator: line.operator ?? "",
      status: line.status ?? "",
      clientId: line.clientId,
      employeeId: line.employeeId,
      deviceId: line.deviceId,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const handleFormValueChange = (
    field: keyof LineFormValues,
    value: string | number | null
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formValues.phoneNumber.trim()) {
      errors.phoneNumber = "El número es obligatorio.";
    }

    if (!formValues.operator) {
      errors.operator = "Selecciona un operador.";
    }

    if (!formValues.status) {
      errors.status = "Selecciona un estado.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const normalizeOptionalString = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  };

  const normalizeId = (value: number | null) => (value === null ? null : value);

  const handleSaveLine = async () => {
    if (!clientId) {
      showNotification("No se ha encontrado el cliente actual.", "error");
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload: CreateLinePayload = {
        phoneNumber: formValues.phoneNumber.trim(),
        tariffType: formValues.tariffType.trim(),
        operator: formValues.operator,
        status: formValues.status,
        clientId,
        employeeId: normalizeId(formValues.employeeId),
        deviceId: normalizeId(formValues.deviceId),
      };

      const iccid = normalizeOptionalString(formValues.iccid);
      if (iccid !== undefined) payload.iccid = iccid;
      const simType = normalizeOptionalString(formValues.simType);
      if (simType !== undefined) payload.simType = simType;
      const pin = normalizeOptionalString(formValues.pin);
      if (pin !== undefined) payload.pin = pin;
      const puk = normalizeOptionalString(formValues.puk);
      if (puk !== undefined) payload.puk = puk;

      if (dialogMode === "create") {
        await createLine(payload);
        showNotification("Línea creada correctamente.", "success");
      } else if (dialogMode === "edit" && currentLine) {
        const updatePayload: UpdateLinePayload = {
          ...payload,
          id: currentLine.id,
        };
        await updateLine(currentLine.id, updatePayload);
        showNotification("Cambios guardados.", "success");
      }

      await loadLines();
      setDialogOpen(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        (dialogMode === "create"
          ? "Error al crear la línea."
          : "Error al actualizar la línea.");
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
        await deleteLineById(id);
      }
      showNotification("Líneas eliminadas.", "success");
      await loadLines();
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudieron eliminar las líneas.";
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

  const baseColumns = 8; // ID, Número, Tarifa, Estado, Operador, Empleado, Dispositivo, Acciones
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
          <Typography variant="h4">Mis Líneas</Typography>
          <TextField
            label="Buscar líneas"
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
            Crear línea
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
                <strong>Número</strong>
              </TableCell>
              <TableCell>
                <strong>Tarifa</strong>
              </TableCell>
              <TableCell>
                <strong>Estado</strong>
              </TableCell>
              <TableCell>
                <strong>Operador</strong>
              </TableCell>
              <TableCell>
                <strong>Empleado</strong>
              </TableCell>
              <TableCell>
                <strong>Dispositivo</strong>
              </TableCell>
              <TableCell sx={{ width: 50 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredLines.map((line) => {
              const isRowSelected = selectionMode && selectedIds.includes(line.id);
              return (
                <TableRow
                  key={line.id}
                  hover
                  selected={isRowSelected}
                  sx={{ cursor: "pointer" }}
                  onClick={() => openDetails(line)}
                >
                  {selectionMode && (
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        color="primary"
                        checked={isRowSelected}
                        onChange={handleSelectOne(line.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{line.id}</TableCell>
                  <TableCell>{line.phoneNumber}</TableCell>
                  <TableCell>{line.tariffType ?? "—"}</TableCell>
                  <TableCell>
                    <LineStatusChip status={line.status} />
                  </TableCell>
                  <TableCell>
                    <OperatorChip operator={line.operator} />
                  </TableCell>
                  <TableCell>{line.employeeId ?? "—"}</TableCell>
                  <TableCell>{line.deviceId ?? "—"}</TableCell>
                  <TableCell sx={{ width: 50 }} onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Editar" arrow>
                      <IconButton color="primary" onClick={() => handleOpenEdit(line)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredLines.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableColumnCount}>
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    {lines.length === 0
                      ? "No hay líneas registradas."
                      : "No se han encontrado líneas con ese criterio de búsqueda."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <LineDetailsModal open={detailsOpen} line={selectedLine} onClose={closeDetails} />

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        disableEnforceFocus={false}
      >
        <DialogTitle>
          {dialogMode === "create" ? "Crear línea" : "Editar línea"}
        </DialogTitle>
        <DialogContent dividers>
          {dialogMode === "edit" && currentLine && (
            <Box display="flex" gap={2} mb={2}>
              <TextField label="ID" value={currentLine.id} fullWidth disabled />
            </Box>
          )}

          <Stack spacing={2}>
            <TextField
              label="Número de teléfono"
              id="phoneNumber"
              name="phoneNumber"
              value={formValues.phoneNumber}
              onChange={(event) => handleFormValueChange("phoneNumber", event.target.value)}
              error={Boolean(formErrors.phoneNumber)}
              helperText={formErrors.phoneNumber}
              disabled={saving}
              fullWidth
            />

            <TextField
              label="Tarifa"
              id="tariffType"
              name="tariffType"
              value={formValues.tariffType}
              onChange={(event) => handleFormValueChange("tariffType", event.target.value)}
              disabled={saving}
              fullWidth
            />

            <TextField
              label="ICCID"
              id="iccid"
              name="iccid"
              value={formValues.iccid}
              onChange={(event) => handleFormValueChange("iccid", event.target.value)}
              disabled={saving}
              fullWidth
            />

            <TextField
              select
              label="Tipo de SIM"
              id="simType"
              name="simType"
              value={formValues.simType}
              onChange={(event) => handleFormValueChange("simType", event.target.value)}
              disabled={saving}
              helperText="Selecciona el tipo de SIM"
              fullWidth
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {SIM_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="PIN"
              id="pin"
              name="pin"
              value={formValues.pin}
              onChange={(event) => handleFormValueChange("pin", event.target.value)}
              disabled={saving}
              fullWidth
            />

            <TextField
              label="PUK"
              id="puk"
              name="puk"
              value={formValues.puk}
              onChange={(event) => handleFormValueChange("puk", event.target.value)}
              disabled={saving}
              fullWidth
            />

            <TextField
              select
              label="Operador"
              id="operator"
              name="operator"
              value={formValues.operator}
              onChange={(event) => handleFormValueChange("operator", event.target.value)}
              error={Boolean(formErrors.operator)}
              helperText={formErrors.operator}
              disabled={saving}
              fullWidth
            >
              <MenuItem value="">Selecciona un operador</MenuItem>
              {OPERATOR_OPTIONS.map((option) => (
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
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {translate("line", option)}
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
                  : "Opcional: asigna la línea a un usuario"
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

            <TextField
              select
              label="Dispositivo asociado"
              id="deviceId"
              name="deviceId"
              value={formValues.deviceId ?? ""}
              onChange={(event) =>
                handleFormValueChange(
                  "deviceId",
                  event.target.value === "" ? null : Number(event.target.value)
                )
              }
              disabled={saving || devicesLoading}
              helperText={
                devicesLoading
                  ? "Cargando dispositivos..."
                  : "Opcional: vincula la línea a un dispositivo"
              }
              fullWidth
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {devices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.brand} {device.model} (#{device.id})
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSaveLine} disabled={saving}>
            {saving ? <CircularProgress size={22} /> : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        disableRestoreFocus
        disableEnforceFocus={false}
      >
        <DialogTitle>Eliminar líneas seleccionadas</DialogTitle>
        <DialogContent dividers>
          <Typography>
            ¿Seguro que quieres eliminar {selectedIds.length}{" "}
            {selectedIds.length === 1 ? "línea" : "líneas"}? Esta acción no se puede
            deshacer.
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

export default ClientLinesPage;


