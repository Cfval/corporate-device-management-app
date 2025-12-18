import { useMemo, type FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";

import { translate } from "../../../utils/translate";
import type { Line } from "../../../types/Line";
import type { User } from "../../../types/User";
import type { Device } from "../../../types/Device";

import {
  STATUS_OPTIONS,
  OPERATOR_OPTIONS,
  SIM_TYPE_OPTIONS,
  type LineFormValues,
  type FormErrors,
} from "./useLinesLogic";

interface LineFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  saving: boolean;
  currentLine: Line | null;
  formValues: LineFormValues;
  formErrors: FormErrors;

  employees: User[];
  employeesLoading: boolean;

  devices: Device[];
  devicesLoading: boolean;

  onClose: () => void;
  onChange: (field: keyof LineFormValues, value: string | number | null) => void;
  onSave: () => void;
}

const LineFormDialog: FC<LineFormDialogProps> = ({
  open,
  mode,
  saving,
  currentLine,
  formValues,
  formErrors,
  employees,
  employeesLoading,
  devices,
  devicesLoading,
  onClose,
  onChange,
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

  const translatedStatusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((value) => ({
        value,
        label: translate("line", value),
      })),
    [],
  );

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      slotProps={{
        paper: {
          className:
            "rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
        },
      }}
    >
      <DialogTitle className="font-semibold text-lg text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        {mode === "create" ? "Crear línea" : "Editar línea"}
      </DialogTitle>

      <DialogContent dividers className="space-y-6 bg-white dark:bg-slate-900">
        {/* ID en modo edición */}
        {mode === "edit" && currentLine && (
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="ID"
              value={currentLine.id}
              fullWidth
              disabled
              sx={readOnlyTextFieldSx}
            />
          </div>
        )}

        <Divider />

        {/* FORMULARIO PRINCIPAL */}
        <Stack spacing={3}>
          <TextField
            label="Número de teléfono"
            value={formValues.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            error={Boolean(formErrors.phoneNumber)}
            helperText={formErrors.phoneNumber}
            disabled={saving}
            sx={textFieldSx}
          />

          <TextField
            label="Tarifa"
            value={formValues.tariffType}
            onChange={(e) => onChange("tariffType", e.target.value)}
            disabled={saving}
            sx={textFieldSx}
          />

          <TextField
            label="ICCID"
            value={formValues.iccid}
            onChange={(e) => onChange("iccid", e.target.value)}
            disabled={saving}
            sx={textFieldSx}
          />

          {/* Tipo SIM */}
          <TextField
            select
            label="Tipo de SIM"
            value={formValues.simType}
            onChange={(e) => onChange("simType", e.target.value)}
            disabled={saving}
            helperText="Selecciona el tipo de SIM"
            sx={textFieldSx}
          >
            <MenuItem value="">Sin asignar</MenuItem>
            {SIM_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          {/* PIN / PUK */}
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="PIN"
              value={formValues.pin}
              onChange={(e) => onChange("pin", e.target.value)}
              disabled={saving}
              sx={textFieldSx}
            />

            <TextField
              label="PUK"
              value={formValues.puk}
              onChange={(e) => onChange("puk", e.target.value)}
              disabled={saving}
              sx={textFieldSx}
            />
          </div>

          {/* Operador */}
          <TextField
            select
            label="Operador"
            value={formValues.operator}
            onChange={(e) => onChange("operator", e.target.value)}
            error={Boolean(formErrors.operator)}
            helperText={formErrors.operator}
            disabled={saving}
            sx={textFieldSx}
          >
            <MenuItem value="">Selecciona un operador</MenuItem>
            {OPERATOR_OPTIONS.map((op) => (
              <MenuItem key={op} value={op}>
                {op}
              </MenuItem>
            ))}
          </TextField>

          {/* Estado */}
          <TextField
            select
            label="Estado"
            value={formValues.status}
            onChange={(e) => onChange("status", e.target.value)}
            error={Boolean(formErrors.status)}
            helperText={formErrors.status}
            disabled={saving}
            sx={textFieldSx}
          >
            <MenuItem value="">Selecciona un estado</MenuItem>
            {translatedStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Divider />

          {/* Empleado asignado */}
          <TextField
            select
            label="Empleado asignado"
            value={formValues.employeeId ?? ""}
            onChange={(e) =>
              onChange(
                "employeeId",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            disabled={saving || employeesLoading}
            helperText={
              employeesLoading
                ? "Cargando usuarios..."
                : "Opcional: asigna la línea a un usuario"
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

          {/* Dispositivo asociado */}
          <TextField
            select
            label="Dispositivo asociado"
            value={formValues.deviceId ?? ""}
            onChange={(e) =>
              onChange(
                "deviceId",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            disabled={saving || devicesLoading}
            helperText={
              devicesLoading
                ? "Cargando dispositivos..."
                : "Opcional: vincula la línea a un dispositivo"
            }
            sx={textFieldSx}
          >
            <MenuItem value="">Sin asignar</MenuItem>
            {devices.map((dev) => (
              <MenuItem key={dev.id} value={dev.id}>
                {dev.brand} {dev.model} (#{dev.id})
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>

        <Button variant="contained" onClick={onSave} disabled={saving}>
          {saving ? <CircularProgress size={22} /> : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LineFormDialog;
