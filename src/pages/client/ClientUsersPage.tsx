import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useAuth } from "../../context/AuthContext";

import { api } from "../../api/http";
import { createUser, getUsersByClient, updateUser } from "../../api/users";
import { getLinesByClient } from "../../api/lines";
import type { User } from "../../types/User";
import type { Line } from "../../types/Line";
import type {
  CreateUserPayload,
  UserRoleValue,
  UserStatusValue,
} from "../../api/model/CreateUserPayload";
import type { UpdateUserPayload } from "../../api/model/UpdateUserPayload";

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
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { UserStatusChip } from "../../components/ui/UserStatusChip";
import { UserRoleChip } from "../../components/ui/UserRoleChip";
import { Notification } from "../../components/ui/Notification";
import { translate } from "../../utils/translate";

type RoleOption = "" | UserRoleValue;
type StatusOption = "" | UserStatusValue;
type SnackbarSeverity = "success" | "error" | "warning" | "info";

const ROLE_OPTIONS: UserRoleValue[] = [
  "ADMIN",
  "EMPLOYEE",
  "MANAGER",
  "TECHNICIAN",
  "ANALYST",
  "SUPPORT",
];

const STATUS_OPTIONS: UserStatusValue[] = ["ACTIVE", "INACTIVE"];

interface UserFormValues {
  fullName: string;
  email: string;
  department: string;
  role: RoleOption;
  status: StatusOption;
  clientId: number;
  lineId: number | null;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  role?: string;
  status?: string;
}

const defaultFormValues = (clientIdValue: number): UserFormValues => ({
  fullName: "",
  email: "",
  department: "",
  role: "",
  status: "ACTIVE",
  clientId: clientIdValue,
  lineId: null,
});

const ClientUsersPage = () => {
  const { user } = useAuth();
  const clientId = user?.clientId ? Number(user.clientId) : undefined;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<number[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formValues, setFormValues] = useState<UserFormValues>(
    defaultFormValues(clientId ?? 0)
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const [lines, setLines] = useState<Line[]>([]);
  const [linesLoading, setLinesLoading] = useState(false);
  const selectableLines = useMemo(() => {
    if (lines.length === 0) return [];
    return lines.filter((line) => {
      if (line.employeeId == null) return true;
      if (dialogMode === "edit" && currentUser?.lineId === line.id) {
        return true;
      }
      return false;
    });
  }, [lines, dialogMode, currentUser]);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
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
    (message: string, severity: SnackbarSeverity = "info") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const loadUsers = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const data = await getUsersByClient(clientId);
      setUsers([...data.users].sort((a, b) => a.id - b.id));
      setSelected([]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudieron cargar los usuarios.";
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

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    loadUsers();
  }, [clientId, loadUsers]);

  useEffect(() => {
    if (!clientId) return;
    loadLines();
  }, [clientId, loadLines]);

  useEffect(() => {
    if (clientId) {
      setFormValues((prev) => ({ ...prev, clientId }));
    }
  }, [clientId]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;

    return (
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.department ?? "").toLowerCase().includes(term) ||
      u.status.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  const isAllSelected =
    selectionMode &&
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selected.includes(u.id));
  const isIndeterminate =
    selectionMode &&
    selected.length > 0 &&
    !isAllSelected &&
    filteredUsers.some((u) => selected.includes(u.id));

  const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(filteredUsers.map((u) => u.id));
    } else {
      setSelected((prev) =>
        prev.filter((id) => !filteredUsers.some((u) => u.id === id))
      );
    }
  };

  const handleSelectOne = (userId: number) => (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected((prev) => [...prev, userId]);
    } else {
      setSelected((prev) => prev.filter((id) => id !== userId));
    }
  };

  const resetForm = (clientIdentifier?: number) => {
    const resolvedClientId = clientIdentifier ?? clientId ?? 0;
    setFormValues(defaultFormValues(resolvedClientId));
    setFormErrors({});
    setCurrentUser(null);
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

  const handleOpenEdit = (userToEdit: User) => {
    blurActiveElement();
    setDialogMode("edit");
    setCurrentUser(userToEdit);
    setFormValues({
      fullName: userToEdit.fullName,
      email: userToEdit.email,
      department: userToEdit.department ?? "",
      role: (userToEdit.role as RoleOption) || "",
      status: (userToEdit.status as StatusOption) || "",
      clientId: userToEdit.clientId,
      lineId: userToEdit.lineId ?? null,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (saving) return;
    setDialogOpen(false);
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formValues.fullName.trim()) {
      errors.fullName = "El nombre es obligatorio.";
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formValues.email.trim())) {
      errors.email = "Ingresa un email válido.";
    }

    if (!formValues.role) {
      errors.role = "Selecciona un rol.";
    }

    if (!formValues.status) {
      errors.status = "Selecciona un estado.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormValueChange = (
    field: keyof UserFormValues,
    value: string | number | null
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async () => {
    if (!clientId) {
      showNotification("No se ha encontrado el cliente actual.", "error");
      return;
    }

    if (!validateForm()) return;

    setSaving(true);
    try {
      if (dialogMode === "create") {
        const normalizedRole = (formValues.role as string).toUpperCase() as UserRoleValue;
        const normalizedStatus = (formValues.status as string).toUpperCase() as UserStatusValue;
        const payload: CreateUserPayload = {
          fullName: formValues.fullName.trim(),
          email: formValues.email.trim(),
          department: formValues.department.trim(),
          role: normalizedRole,
          status: normalizedStatus,
          clientId,
          lineId: formValues.lineId ?? null,
        };
        await createUser(payload);
        showNotification("Usuario creado correctamente.", "success");
      } else if (dialogMode === "edit" && currentUser) {
        const normalizedRole = (formValues.role as string).toUpperCase() as UserRoleValue;
        const normalizedStatus = (formValues.status as string).toUpperCase() as UserStatusValue;
        const payload: UpdateUserPayload = {
          id: currentUser.id,
          fullName: formValues.fullName.trim(),
          email: formValues.email.trim(),
          department: formValues.department.trim(),
          role: normalizedRole,
          status: normalizedStatus,
          clientId: currentUser.clientId,
          lineId: formValues.lineId ?? null,
        };
        await updateUser(currentUser.id, payload);
        showNotification("Usuario actualizado correctamente.", "success");
      }

      await loadUsers();
      setDialogOpen(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudo guardar el usuario.";
      showNotification(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelected([]);
      return;
    }

    if (selected.length === 0) {
      showNotification("Selecciona al menos un usuario para borrar.", "warning");
      return;
    }

    blurActiveElement();
    setConfirmDeleteOpen(true);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelected([]);
  };

  const handleConfirmDelete = async () => {
    if (selected.length === 0) return;
    setDeleteLoading(true);
    try {
      for (const id of selected) {
        await api.delete(`/users/${id}`);
      }
      showNotification("Usuarios eliminados correctamente.", "success");
      await loadUsers();
      setSelected([]);
      setSelectionMode(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "No se pudieron eliminar los usuarios.";
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

  const tableColumnCount = 8 + (selectionMode ? 1 : 0);

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
          <Typography variant="h4">Mis Usuarios</Typography>
          <TextField
            label="Buscar usuarios"
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Crear usuario
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
                <strong>Nombre</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Departamento</strong>
              </TableCell>
              <TableCell>
                <strong>Estado</strong>
              </TableCell>
              <TableCell>
                <strong>Rol</strong>
              </TableCell>
              <TableCell>
                <strong>Registro</strong>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.map((u) => {
              const isRowSelected =
                selectionMode && selected.includes(u.id);
              return (
                <TableRow key={u.id} hover selected={isRowSelected}>
                  {selectionMode && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isRowSelected}
                        onChange={handleSelectOne(u.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.fullName}</TableCell>

                  <TableCell
                    sx={{
                      maxWidth: 220,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={u.email}
                  >
                    {u.email}
                  </TableCell>

                  <TableCell>{u.department || "Sin departamento"}</TableCell>

                  <TableCell>
                    <UserStatusChip status={u.status} />
                  </TableCell>

                  <TableCell>
                    <UserRoleChip role={u.role} />
                  </TableCell>

                  <TableCell>
                    {new Date(u.registrationDate).toLocaleDateString()}
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="Editar" arrow>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredUsers.length === 0 && users.length > 0 && (
              <TableRow>
                <TableCell colSpan={tableColumnCount}>
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    No se han encontrado usuarios con ese criterio de búsqueda.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableColumnCount}>
                  <Typography variant="body1" align="center" sx={{ py: 3 }}>
                    No hay usuarios registrados en este cliente.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="sm"
        disableRestoreFocus
        disableEnforceFocus={false}
      >
        <DialogTitle>
          {dialogMode === "create" ? "Crear usuario" : "Editar usuario"}
        </DialogTitle>
        <DialogContent dividers>
          {dialogMode === "edit" && currentUser && (
            <Box display="flex" gap={2} mb={2}>
              <TextField
                label="ID"
                value={currentUser.id}
                fullWidth
                disabled
              />
              <TextField
                label="Fecha de registro"
                value={new Date(currentUser.registrationDate).toLocaleDateString()}
                fullWidth
                disabled
              />
            </Box>
          )}

          <Stack spacing={2}>
            <TextField
              label="Nombre completo"
              id="fullName"
              name="fullName"
              value={formValues.fullName}
              onChange={(event) =>
                handleFormValueChange("fullName", event.target.value)
              }
              error={Boolean(formErrors.fullName)}
              helperText={formErrors.fullName}
              disabled={saving}
              fullWidth
            />
            <TextField
              label="Email"
              id="email"
              name="email"
              value={formValues.email}
              onChange={(event) =>
                handleFormValueChange("email", event.target.value)
              }
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              disabled={saving}
              fullWidth
            />
            <TextField
              label="Departamento"
              id="department"
              name="department"
              value={formValues.department}
              onChange={(event) =>
                handleFormValueChange("department", event.target.value)
              }
              disabled={saving}
              fullWidth
            />
            <TextField
              select
              label="Rol"
              id="role"
              name="role"
              value={formValues.role}
              onChange={(event) =>
                handleFormValueChange("role", event.target.value)
              }
              error={Boolean(formErrors.role)}
              helperText={formErrors.role}
              disabled={saving}
              fullWidth
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
              id="status"
              name="status"
              value={formValues.status}
              onChange={(event) =>
                handleFormValueChange("status", event.target.value)
              }
              error={Boolean(formErrors.status)}
              helperText={formErrors.status}
              disabled={saving}
              fullWidth
            >
              <MenuItem value="">Selecciona un estado</MenuItem>
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {translate("user", option)}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Línea asignada"
              value={formValues.lineId ?? ""}
              onChange={(event) =>
                handleFormValueChange(
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
              fullWidth
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
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveUser}
            disabled={saving}
          >
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
        <DialogTitle>Eliminar usuarios seleccionados</DialogTitle>
        <DialogContent dividers>
          <Typography>
            ¿Seguro que quieres eliminar {selected.length}{" "}
            {selected.length === 1 ? "usuario" : "usuarios"}? Esta acción no se
            puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDeleteOpen(false)}
            disabled={deleteLoading}
          >
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

export default ClientUsersPage;



