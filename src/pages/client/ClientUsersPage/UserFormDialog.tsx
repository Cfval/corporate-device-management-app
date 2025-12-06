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
      PaperProps={{
        className: "rounded-xl",
      }}
    >
      <DialogTitle className="font-semibold text-lg">
        {mode === "create" ? "Crear usuario" : "Editar usuario"}
      </DialogTitle>

      <DialogContent dividers className="space-y-6">
        {/* Información fija del usuario si está en modo edición */}
        {mode === "edit" && currentUser && (
          <div className="grid grid-cols-2 gap-4">
            <TextField label="ID" value={currentUser.id} fullWidth disabled />
            <TextField
              label="Fecha de registro"
              value={new Date(
                currentUser.registrationDate
              ).toLocaleDateString()}
              fullWidth
              disabled
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
          />

          <TextField
            label="Departamento"
            value={formValues.department}
            onChange={(event) =>
              onChangeField("department", event.target.value)
            }
            disabled={saving}
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

export default UserFormDialog;
