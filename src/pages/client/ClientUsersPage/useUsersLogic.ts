import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
  } from "react";
  import { useAuth } from "../../../context/AuthContext";
  import { api } from "../../../api/http";
  import { createUser, getUsersByClient, updateUser } from "../../../api/users";
  import { getLinesByClient } from "../../../api/lines";
  import type { User } from "../../../types/User";
  import type { Line } from "../../../types/Line";
  import type {
    CreateUserPayload,
    UserRoleValue,
    UserStatusValue,
  } from "../../../api/model/CreateUserPayload";
  import type { UpdateUserPayload } from "../../../api/model/UpdateUserPayload";
  
  export type RoleOption = "" | UserRoleValue;
  export type StatusOption = "" | UserStatusValue;
  export type SnackbarSeverity = "success" | "error" | "warning" | "info";
  
  export interface UserFormValues {
    fullName: string;
    email: string;
    department: string;
    role: RoleOption;
    status: StatusOption;
    clientId: number;
    lineId: number | null;
  }
  
  export interface FormErrors {
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
  
  export const useUsersLogic = () => {
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
      defaultFormValues(clientId ?? 0),
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
      [],
    );
  
    const handleSnackbarClose = () => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    };
  
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
  
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };
  
    const filteredUsers = useMemo(
      () =>
        users.filter((u) => {
          const term = search.toLowerCase().trim();
          if (!term) return true;
  
          return (
            u.fullName.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            (u.department ?? "").toLowerCase().includes(term) ||
            u.status.toLowerCase().includes(term) ||
            u.role.toLowerCase().includes(term)
          );
        }),
      [users, search],
    );
  
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
          prev.filter((id) => !filteredUsers.some((u) => u.id === id)),
        );
      }
    };
  
    const handleSelectOne =
      (userId: number) => (event: ChangeEvent<HTMLInputElement>) => {
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
      value: string | number | null,
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
      setConfirmDeleteOpen(false);
      setSelectionMode(false);
      setSelected([]);
    };

    const handleCloseDeleteDialog = () => {
      if (deleteLoading) return;
      setConfirmDeleteOpen(false);
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
  
    const tableColumnCount = 8 + (selectionMode ? 1 : 0);
  
    return {
      clientId,
      users,
      loading,
      search,
      setSearch,
      handleSearchChange,
      filteredUsers,
      selectionMode,
      selected,
      isAllSelected,
      isIndeterminate,
      handleSelectAll,
      handleSelectOne,
      dialogOpen,
      dialogMode,
      currentUser,
      formValues,
      formErrors,
      saving,
      selectableLines,
      linesLoading,
      handleOpenCreate,
      handleOpenEdit,
      handleDialogClose,
      handleFormValueChange,
      handleSaveUser,
      handleDeleteSelected,
      handleCancelSelection,
      handleCloseDeleteDialog,
      confirmDeleteOpen,
      deleteLoading,
      handleConfirmDelete,
      snackbar,
      handleSnackbarClose,
      tableColumnCount,
    };
  };
  