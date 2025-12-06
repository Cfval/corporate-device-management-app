import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ChangeEvent,
  } from "react";
  import { useAuth } from "../../../context/AuthContext";
  
  import {
    createDevice,
    deleteDeviceById,
    getDevicesByClient,
    updateDevice,
  } from "../../../api/devices";
  import { getLinesByClient } from "../../../api/lines";
    import { getUsersByClient } from "../../../api/users";
  
  import type { Device } from "../../../types/Device";
  import type { Line } from "../../../types/Line";
  import type { User } from "../../../types/User";
  
  import type { CreateDevicePayload } from "../../../api/model/CreateDevicePayload";
  import type { UpdateDevicePayload } from "../../../api/model/UpdateDevicePayload";
  
  export const DEVICE_TYPE_OPTIONS = [
    "SMARTPHONE",
    "TABLET",
    "LAPTOP",
    "DESKTOP",
    "SMARTWATCH",
    "OTHER",
  ] as const;
  
  export const DEVICE_STATUS_OPTIONS = [
    "ASSIGNED",
    "STORAGE",
    "REPAIR",
    "LOST",
    "DECOMMISSIONED",
  ] as const;
  
  export const OS_OPTIONS = [
    "Android",
    "iOS",
    "Windows",
    "macOS",
    "Linux",
    "Otro",
  ] as const;
  
  // ---------------------------------------------------------------
  // FORM DATA TYPES
  // ---------------------------------------------------------------
  
  export interface DeviceFormValues {
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
  
  export interface FormErrors {
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
  
  export const useDevicesLogic = () => {
    const { user } = useAuth();
    const clientId = user?.clientId ? Number(user.clientId) : undefined;
  
    // ---------------------------------------------------------------
    // STATES
    // ---------------------------------------------------------------
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
  
    const [search, setSearch] = useState("");
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  
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
  
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success" as "success" | "error" | "warning" | "info",
    });
  
    // ---------------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------------
  
    const blurActiveElement = () => {
      const el = document.activeElement as HTMLElement | null;
      el?.blur();
    };
  
    const showNotification = useCallback(
      (message: string, severity: "success" | "error" | "warning" | "info" = "info") => {
        setSnackbar({ open: true, message, severity });
      },
      []
    );
  
    // ---------------------------------------------------------------
    // LOADERS
    // ---------------------------------------------------------------
  
    const loadDevices = useCallback(async () => {
      if (!clientId) return;
      setLoading(true);
      try {
        const res = await getDevicesByClient(clientId);
        setDevices([...res.devices].sort((a, b) => a.id - b.id));
        setSelectedIds([]);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Error cargando dispositivos.";
        showNotification(msg, "error");
      } finally {
        setLoading(false);
      }
    }, [clientId, showNotification]);
  
    const loadLines = useCallback(async () => {
      if (!clientId) return;
      setLinesLoading(true);
      try {
        const res = await getLinesByClient(clientId);
        setLines(res.lines);
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? err?.message ?? "Error cargando líneas.";
        showNotification(msg, "error");
      } finally {
        setLinesLoading(false);
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
  
    useEffect(() => {
      if (!clientId) return;
      loadDevices();
      loadLines();
      loadEmployees();
    }, [clientId, loadDevices, loadLines, loadEmployees]);
  
    useEffect(() => {
      if (clientId) {
        setFormValues((prev) => ({ ...prev, clientId }));
      }
    }, [clientId]);
  
    // ---------------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------------
  
    const handleSearchChange = (value: string) => {
      setSearch(value);
    };
  
    const filteredDevices = useMemo(() => {
      const term = search.toLowerCase().trim();
      if (!term) return devices;
  
      return devices.filter((d) => {
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
    }, [devices, search]);
  
    // ---------------------------------------------------------------
    // LINE FILTERING
    // ---------------------------------------------------------------
  
    const selectableLines = useMemo(() => {
      if (lines.length === 0) return [];
      return lines.filter((line) => {
        if (line.deviceId == null) return true;
        if (dialogMode === "edit" && currentDevice?.lineId === line.id) return true;
        return false;
      });
    }, [lines, dialogMode, currentDevice]);
  
    // ---------------------------------------------------------------
    // SELECTION MODE
    // ---------------------------------------------------------------
  
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
  
    const handleSelectOne =
      (deviceId: number) => (event: ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        if (event.target.checked) {
          setSelectedIds((prev) => [...prev, deviceId]);
        } else {
          setSelectedIds((prev) => prev.filter((id) => id !== deviceId));
        }
      };
  
    // ---------------------------------------------------------------
    // DETAILS MODAL (view)
    // ---------------------------------------------------------------
  
    const openDetails = (device: Device) => {
      blurActiveElement();
      setSelectedDevice(device);
      setDetailsOpen(true);
    };
  
    const closeDetails = () => {
      setSelectedDevice(null);
      setDetailsOpen(false);
    };
  
    // ---------------------------------------------------------------
    // CREATE / EDIT
    // ---------------------------------------------------------------
  
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
  
    // ---------------------------------------------------------------
    // FORM VALIDATION
    // ---------------------------------------------------------------
  
    const validateForm = () => {
      const errors: FormErrors = {};
  
      if (!formValues.type) errors.type = "El tipo es obligatorio.";
  
      const imeiRegex = /^\d{15}$/;
      if (!imeiRegex.test(formValues.imei.trim()))
        errors.imei = "El IMEI debe tener 15 dígitos.";
  
      if (!formValues.brand.trim()) errors.brand = "La marca es obligatoria.";
  
      if (!formValues.model.trim()) errors.model = "El modelo es obligatorio.";
  
      if (!formValues.status) errors.status = "Selecciona un estado.";
  
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };
  
    const normalizeOptionalField = (value: string | number | null | undefined) => {
      if (value === "" || value === undefined) return null;
      return value;
    };
  
    const handleFormValueChange = (
      field: keyof DeviceFormValues,
      value: string | number | null
    ) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
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
          employeeId:
            (normalizeOptionalField(formValues.employeeId) as number) ?? null,
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
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          "No se pudo guardar el dispositivo.";
        showNotification(msg, "error");
      } finally {
        setSaving(false);
      }
    };
  
    // ---------------------------------------------------------------
    // DELETE MULTIPLE
    // ---------------------------------------------------------------
  
    const handleDeleteSelected = () => {
      if (!selectionMode) {
        setSelectionMode(true);
        setSelectedIds([]);
        return;
      }
  
      if (selectedIds.length === 0) {
        showNotification("Selecciona al menos un dispositivo.", "warning");
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
  
    // ---------------------------------------------------------------
    // TABLE COLUMN COUNT
    // ---------------------------------------------------------------
  
  const baseColumns = 8; // ID, Tipo, Marca, Modelo, Estado, Empleado, Línea, Acciones
    const tableColumnCount = baseColumns + (selectionMode ? 1 : 0);
  
    // ---------------------------------------------------------------
    // RETURN
    // ---------------------------------------------------------------
  
    return {
      // IDs / data
      clientId,
      devices,
      filteredDevices,
      selectedDevice,
      lines,
      employees,
  
      // Loading
      loading,
      saving,
      linesLoading,
      employeesLoading,
      deleteLoading,
  
      // Search
      search,
      handleSearchChange,
  
      // Modals: details
      detailsOpen,
      openDetails,
      closeDetails,
  
      // Selection
      selectionMode,
      selectedIds,
      isAllSelected,
      isIndeterminate,
      handleSelectAll,
      handleSelectOne,
      handleDeleteSelected,
      handleCancelSelection,
      handleCloseDeleteDialog,
  
      // Form dialog
      dialogOpen,
      dialogMode,
      currentDevice,
      formValues,
      formErrors,
      selectableLines,
      handleOpenCreate,
      handleOpenEdit,
      handleDialogClose,
      handleFormValueChange,
      handleSaveDevice,
  
      // Delete confirm dialog
      confirmDeleteOpen,
      handleConfirmDelete,
  
      // Table columns
      tableColumnCount,
  
      // Snackbar
      snackbar,
      setSnackbar,
    };
  };
  