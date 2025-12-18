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
import type { User } from "../../../types/User";
import type { Line } from "../../../types/Line";
import type {
  UserRoleValue,
  UserStatusValue,
} from "../../../api/model/CreateUserPayload";
import { translate } from "../../../utils/translate";
import type { FormErrors, UserFormValues } from "./useUsersLogic";

const ROLE_OPTIONS: UserRoleValue[] = [
  "EMPLEADO",
  "GERENTE",
  "TÉCNICO",
  "ANALISTA",
  "SOPORTE",
  "ADMIN",
];

const STATUS_OPTIONS: UserStatusValue[] = ["ACTIVE", "INACTIVE"];

interface UserFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  saving: boolean;
  currentUser: User | null;
  formValues: UserFormValues;
  formErrors: FormErrors;
  selectableLines: Line[];
  linesLoading: boolean;
  onClose: () => void;
  onChangeField: (
    field: keyof UserFormValues,
    value: string | number | null
  ) => void;
  onSave: () => void;
}

const UserFormDialog: FC<UserFormDialogProps> = ({
  open,
  mode,
  saving,
  currentUser,
  formValues,
  formErrors,
  selectableLines,
  linesLoading,
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

  const translatedStatusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((value) => ({
        value,
        label: translate("user", value),
      })),
    [],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
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
        {mode === "create" ? "Crear usuario" : "Editar usuario"}
      </DialogTitle>

      <DialogContent dividers className="space-y-6 bg-white dark:bg-slate-900">
        {/* Información fija del usuario si está en modo edición */}
        {mode === "edit" && currentUser && (
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="ID"
              value={currentUser.id}
              fullWidth
              disabled
              sx={readOnlyTextFieldSx}
            />
            <TextField
              label="Fecha de registro"
              value={new Date(
                currentUser.registrationDate
              ).toLocaleDateString()}
              fullWidth
              disabled
              sx={readOnlyTextFieldSx}
            />
          </div>
        )}

        <Divider />

        {/* Campos principales */}
        <Stack spacing={3}>
          <TextField
            label="Nombre completo"
            value={formValues.fullName}
            onChange={(event) =>
              onChangeField("fullName", event.target.value)
            }
            error={Boolean(formErrors.fullName)}
            helperText={formErrors.fullName}
            disabled={saving}
            sx={textFieldSx}
          />

          <TextField
            label="Email"
            type="email"
            value={formValues.email}
            onChange={(event) =>
              onChangeField("email", event.target.value)
            }
            error={Boolean(formErrors.email)}
            helperText={formErrors.email}
            disabled={saving}
            sx={textFieldSx}
          />

          <TextField
            label="Departamento"
            value={formValues.department}
            onChange={(event) =>
              onChangeField("department", event.target.value)
            }
            disabled={saving}
            sx={textFieldSx}
          />

          <TextField
            select
            label="Rol"
            value={formValues.role}
            onChange={(event) =>
              onChangeField("role", event.target.value)
            }
            error={Boolean(formErrors.role)}
            helperText={formErrors.role}
            disabled={saving}
            sx={textFieldSx}
          >
            <MenuItem value="">Selecciona un rol</MenuItem>
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Estado"
            value={formValues.status}
            onChange={(event) =>
              onChangeField("status", event.target.value)
            }
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

          <TextField
            select
            label="Línea asignada"
            value={formValues.lineId ?? ""}
            onChange={(event) =>
              onChangeField(
                "lineId",
                event.target.value === "" ? null : Number(event.target.value)
              )
            }
            disabled={saving || linesLoading}
            helperText={
              linesLoading
                ? "Cargando líneas..."
                : "Opcional: asigna una línea existente"
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

export default UserFormDialog;
