import { useMemo, type FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Button as MUIButton,
  CircularProgress,
  Divider,
} from "@mui/material";

import type { Device } from "../../../types/Device";
import type { Line } from "../../../types/Line";
import type { User } from "../../../types/User";

import {
  DEVICE_TYPE_OPTIONS,
  DEVICE_STATUS_OPTIONS,
  OS_OPTIONS,
  type DeviceFormValues,
  type FormErrors,
} from "./useDevicesLogic";

import { translate } from "../../../utils/translate";

interface DeviceFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  saving: boolean;
  currentDevice: Device | null;
  formValues: DeviceFormValues;
  formErrors: FormErrors;
  selectableLines: Line[];
  linesLoading: boolean;
  employees: User[];
  employeesLoading: boolean;
  onClose: () => void;
  onChangeField: (
    field: keyof DeviceFormValues,
    value: string | number | null
  ) => void;
  onSave: () => void;
}

const DeviceFormDialog: FC<DeviceFormDialogProps> = ({
  open,
  mode,
  saving,
  currentDevice,
  formValues,
  formErrors,
  selectableLines,
  linesLoading,
  employees,
  employeesLoading,
  onClose,
  onChangeField,
  onSave,
}) => {
  const deviceTypeOptions = useMemo(
    () =>
      DEVICE_TYPE_OPTIONS.map((value) => ({
        value,
        label: translate("type", value),
      })),
    [],
  );

  const deviceStatusOptions = useMemo(
    () =>
      DEVICE_STATUS_OPTIONS.map((value) => ({
        value,
        label: translate("device", value),
      })),
    [],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      disableEnforceFocus={false}
      slotProps={{
        paper: {
          className: "rounded-xl",
        },
      }}
    >
      <DialogTitle className="font-semibold text-lg">
        {mode === "create" ? "Crear dispositivo" : "Editar dispositivo"}
      </DialogTitle>

      <DialogContent dividers className="space-y-6">
        {/* ID en modo edición */}
        {mode === "edit" && currentDevice && (
          <div className="grid grid-cols-2 gap-4">
            <TextField label="ID" value={currentDevice.id} fullWidth disabled />
          </div>
        )}

        <Divider />

        {/* FORMULARIO PRINCIPAL */}
        <Stack spacing={3}>
          {/* Tipo */}
          <TextField
            select
            label="Tipo"
            value={formValues.type}
            onChange={(e) => onChangeField("type", e.target.value)}
            error={Boolean(formErrors.type)}
            helperText={formErrors.type}
            disabled={saving}
          >
            <MenuItem value="">Selecciona un tipo</MenuItem>
            {deviceTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {/* IMEI */}
          <TextField
            label="IMEI"
            value={formValues.imei}
            onChange={(e) => onChangeField("imei", e.target.value)}
            error={Boolean(formErrors.imei)}
            helperText={formErrors.imei ?? "15 dígitos"}
            disabled={saving}
          />

          {/* Marca / Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Marca"
              value={formValues.brand}
              onChange={(e) => onChangeField("brand", e.target.value)}
              error={Boolean(formErrors.brand)}
              helperText={formErrors.brand}
              disabled={saving}
            />

            <TextField
              label="Modelo"
              value={formValues.model}
              onChange={(e) => onChangeField("model", e.target.value)}
              error={Boolean(formErrors.model)}
              helperText={formErrors.model}
              disabled={saving}
            />
          </div>

          {/* Nº serie */}
          <TextField
            label="Número de serie"
            value={formValues.serialNumber}
            onChange={(e) => onChangeField("serialNumber", e.target.value)}
            disabled={saving}
          />

          {/* OS */}
          <TextField
            select
            label="Sistema operativo"
            value={formValues.os}
            onChange={(e) => onChangeField("os", e.target.value)}
            disabled={saving}
          >
            <MenuItem value="">Selecciona un sistema operativo</MenuItem>
            {OS_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* Estado */}
          <TextField
            select
            label="Estado"
            value={formValues.status}
            onChange={(e) => onChangeField("status", e.target.value)}
            error={Boolean(formErrors.status)}
            helperText={formErrors.status}
            disabled={saving}
          >
            <MenuItem value="">Selecciona un estado</MenuItem>
            {deviceStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          
          <Divider />

          {/* Línea asociada */}
          <TextField
            select
            label="Línea asociada"
            value={formValues.lineId ?? ""}
            onChange={(e) =>
              onChangeField(
                "lineId",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            disabled={saving || linesLoading}
            helperText={
              linesLoading
                ? "Cargando líneas..."
                : "Opcional: selecciona una línea libre"
            }
          >
            <MenuItem value="">Sin asignar</MenuItem>
            {selectableLines.map((line) => (
              <MenuItem key={line.id} value={line.id}>
                {line.phoneNumber} • {line.operator}
              </MenuItem>
            ))}
          </TextField>

          {/* Empleado asignado */}
          <TextField
            select
            label="Empleado asignado"
            value={formValues.employeeId ?? ""}
            onChange={(e) =>
              onChangeField(
                "employeeId",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            disabled={saving || employeesLoading}
            helperText={
              employeesLoading
                ? "Cargando usuarios..."
                : "Opcional: asigna el dispositivo a un usuario"
            }
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

      <DialogActions className="px-6 py-4">
        <MUIButton onClick={onClose} disabled={saving}>
          Cancelar
        </MUIButton>

        <MUIButton
          variant="contained"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={22} /> : "Guardar"}
        </MUIButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceFormDialog;

