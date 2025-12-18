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
  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      color: "inherit",
      backgroundColor: "transparent",
    },
    "& .MuiOutlinedInput-input": { color: "inherit" },
    "& .MuiSelect-select": { color: "inherit" },
    "& .MuiInputLabel-root": { color: "rgba(100,116,139,1)" }, // slate-500
    "& .MuiFormHelperText-root": { color: "rgba(100,116,139,1)" }, // slate-500
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(148,163,184,0.55)", // slate-400/55
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(148,163,184,0.85)", // slate-400/85
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(56,189,248,0.9)", // sky-400
    },
    "& .MuiSvgIcon-root": { color: "currentColor" },

    "html.dark & .MuiOutlinedInput-root": {
      color: "rgba(241,245,249,1)", // slate-100
    },
    "html.dark & .MuiInputLabel-root": { color: "rgba(203,213,225,1)" }, // slate-300
    "html.dark & .MuiFormHelperText-root": { color: "rgba(148,163,184,1)" }, // slate-400
    "html.dark & .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(51,65,85,1)", // slate-700
    },
    "html.dark &:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(71,85,105,1)", // slate-600
    },
    "html.dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(56,189,248,0.9)", // sky-400
    },
    "html.dark & .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "rgba(203,213,225,0.65)", // slate-300/65
    },
  } as const;

  const readOnlyTextFieldSx = {
    ...textFieldSx,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(148,163,184,0.35)", // slate-400/35
    },
    "html.dark & .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(51,65,85,0.65)", // slate-700/65
    },
  } as const;

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
          className:
            "rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
        },
      }}
    >
      <DialogTitle className="font-semibold text-lg text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        {mode === "create" ? "Crear dispositivo" : "Editar dispositivo"}
      </DialogTitle>

      <DialogContent dividers className="space-y-6 bg-white dark:bg-slate-900">
        {/* ID en modo edición */}
        {mode === "edit" && currentDevice && (
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="ID"
              value={currentDevice.id}
              fullWidth
              disabled
              sx={readOnlyTextFieldSx}
            />
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
            sx={textFieldSx}
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
            sx={textFieldSx}
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
              sx={textFieldSx}
            />

            <TextField
              label="Modelo"
              value={formValues.model}
              onChange={(e) => onChangeField("model", e.target.value)}
              error={Boolean(formErrors.model)}
              helperText={formErrors.model}
              disabled={saving}
              sx={textFieldSx}
            />
          </div>

          {/* Nº serie */}
          <TextField
            label="Número de serie"
            value={formValues.serialNumber}
            onChange={(e) => onChangeField("serialNumber", e.target.value)}
            disabled={saving}
            sx={textFieldSx}
          />

          {/* OS */}
          <TextField
            select
            label="Sistema operativo"
            value={formValues.os}
            onChange={(e) => onChangeField("os", e.target.value)}
            disabled={saving}
            sx={textFieldSx}
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
            sx={textFieldSx}
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
            sx={textFieldSx}
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
            sx={textFieldSx}
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

      <DialogActions className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
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

