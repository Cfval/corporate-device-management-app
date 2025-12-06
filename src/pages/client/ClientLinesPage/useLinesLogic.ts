import {
    useState,
    useCallback,
    useEffect,
    useMemo,
    type ChangeEvent,
  } from "react";
  import { useAuth } from "../../../context/AuthContext";
  
  import {
    getLinesByClient,
    createLine,
    updateLine,
    deleteLineById,
  } from "../../../api/lines";
  import { getUsersByClient } from "../../../api/users";
    import { getDevicesByClient } from "../../../api/devices";
  
  import type { Line } from "../../../types/Line";
  import type { User } from "../../../types/User";
  import type { Device } from "../../../types/Device";
  import type { CreateLinePayload } from "../../../api/model/CreateLinePayload";
  import type { UpdateLinePayload } from "../../../api/model/UpdateLinePayload";
  
  export const STATUS_OPTIONS = ["ACTIVE", "SUSPENDED", "DEACTIVATED"] as const;
  export const OPERATOR_OPTIONS = ["Movistar", "Orange", "Vodafone", "Pepephone"] as const;
  export const SIM_TYPE_OPTIONS = ["SIM", "ESIM", "DUAL SIM", "MULTISIM"] as const;
  
  export interface LineFormValues {
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
  
  export interface FormErrors {
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
  
  export const useLinesLogic = () => {
    const { user } = useAuth();
    const clientId = user?.clientId ? Number(user.clientId) : undefined;
  
    // --------------------------------------------------
    // STATE
    // --------------------------------------------------
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
  
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
  
    // DETAILS MODAL
    const [selectedLine, setSelectedLine] = useState<Line | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
  
    // SNACKBAR
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success" as "success" | "error" | "warning" | "info",
    });
  
    const showNotification = useCallback(
      (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
        setSnackbar({ open: true, message, severity });
      },
      []
    );
  
    const blurActiveElement = () => {
      (document.activeElement as HTMLElement | null)?.blur();
    };
  
    // --------------------------------------------------
    // LOADERS
    // --------------------------------------------------
    const loadLines = useCallback(async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const res = await getLinesByClient(clientId);
        setLines([...res.lines].sort((a, b) => a.id - b.id));
        setSelectedIds([]);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Error cargando líneas.";
        showNotification(msg, "error");
      } finally {
        setLoading(false);
      }
    }, [clientId, showNotification]);
  
    const loadEmployees = useCallback(async () => {
      if (!clientId) return;
      setEmployeesLoading(true);
      try {
        const res = await getUsersByClient(clientId);
        setEmployees(res.users);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Error cargando usuarios.";
        showNotification(msg, "error");
      } finally {
        setEmployeesLoading(false);
      }
    }, [clientId, showNotification]);
  
    const loadDevices = useCallback(async () => {
      if (!clientId) return;
      setDevicesLoading(true);
      try {
        const res = await getDevicesByClient(clientId);
        setDevices(res.devices);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Error cargando dispositivos.";
        showNotification(msg, "error");
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
  
    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------
    const handleSearchChange = (value: string) => {
      setSearch(value);
    };
  
    const filteredLines = useMemo(() => {
      const term = search.toLowerCase().trim();
      if (!term) return lines;
  
      return lines.filter((line) => {
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
    }, [lines, search]);
  
    // --------------------------------------------------
    // DETAILS MODAL
    // --------------------------------------------------
    const openDetails = (line: Line) => {
      blurActiveElement();
      setSelectedLine(line);
      setDetailsOpen(true);
    };
  
    const closeDetails = () => {
      setSelectedLine(null);
      setDetailsOpen(false);
    };
  
    // --------------------------------------------------
    // SELECTION MODE
    // --------------------------------------------------
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
  
    const handleSelectOne =
      (lineId: number) => (event: ChangeEvent<HTMLInputElement>) => {
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
        showNotification("Selecciona al menos una línea.", "warning");
        return;
      }
  
      blurActiveElement();
      setConfirmDeleteOpen(true);
    };
  
    const handleCancelSelection = () => {
      setConfirmDeleteOpen(false);
      setSelectionMode(false);
      setSelectedIds([]);
    };

    const handleCloseDeleteDialog = () => {
      if (deleteLoading) return;
      setConfirmDeleteOpen(false);
    };
  
    // --------------------------------------------------
    // FORM
    // --------------------------------------------------
    const resetForm = (id?: number) => {
      const resolvedClientId = id ?? clientId ?? 0;
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
  
    // --------------------------------------------------
    // FORM VALIDATION
    // --------------------------------------------------
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
  
    // --------------------------------------------------
    // FORM SAVE
    // --------------------------------------------------
    const normalizeOptionalString = (value: string) => {
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    };
  
    const normalizeId = (value: number | null) => (value === null ? null : value);
  
    const handleFormValueChange = (
      field: keyof LineFormValues,
      value: string | number | null
    ) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };
  
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
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "Error al guardar cambios.";
        showNotification(msg, "error");
      } finally {
        setSaving(false);
      }
    };
  
    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------
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
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "No se pudieron eliminar.";
        showNotification(msg, "error");
      } finally {
        setDeleteLoading(false);
        setConfirmDeleteOpen(false);
      }
    };
  
    // --------------------------------------------------
    // TABLE COLUMN COUNT
    // --------------------------------------------------
    const baseColumns = 9; // ID, Número, Tarifa, Estado, Operador, Empleado, Dispositivo, Edit, Ver
    const tableColumnCount = baseColumns + (selectionMode ? 1 : 0);
  
    // --------------------------------------------------
    // RETURN
    // --------------------------------------------------
    return {
      // IDs / data
      clientId,
      lines,
      employees,
      devices,
      filteredLines,
  
      // Loading
      loading,
      saving,
      deleteLoading,
      employeesLoading,
      devicesLoading,
  
      // search
      search,
      handleSearchChange,
  
      // selection
      selectionMode,
      selectedIds,
      isAllSelected,
      isIndeterminate,
      handleSelectAll,
      handleSelectOne,
      handleDeleteSelected,
      handleCancelSelection,
      handleCloseDeleteDialog,
  
      // details modal
      detailsOpen,
      selectedLine,
      openDetails,
      closeDetails,
  
      // form dialog
      dialogOpen,
      dialogMode,
      currentLine,
      formValues,
      formErrors,
      handleOpenCreate,
      handleOpenEdit,
      handleDialogClose,
      handleFormValueChange,
      handleSaveLine,
  
      // delete dialog
      confirmDeleteOpen,
      handleConfirmDelete,
  
      // table
      tableColumnCount,
  
      // snackbar
      snackbar,
      setSnackbar,
    };
  };
  