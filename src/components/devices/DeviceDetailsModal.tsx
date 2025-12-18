import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import type { Device } from "../../types/Device";
import { translate } from "../../utils/translate";

interface Props {
  open: boolean;
  device: Device | null;
  onClose: () => void;
}

export const DeviceDetailsModal = ({ open, device, onClose }: Props) => {
  if (!device) return null;

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Typography className="text-slate-700 dark:text-slate-100">
      <strong className="text-slate-600 dark:text-slate-200">{label}:</strong>{" "}
      {value ?? "—"}
    </Typography>
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
            "rounded-xl bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-100",
        },
      }}
    >
      <DialogTitle className="font-semibold text-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        Detalles del dispositivo
      </DialogTitle>

      <DialogContent
        dividers
        className="space-y-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100"
      >
        {/* Información general */}
        <div className="space-y-2">
          <Row label="ID" value={device.id} />
          <Row label="Tipo" value={translate("type", device.type ?? "")} />
          <Row label="Marca" value={device.brand} />
          <Row label="Modelo" value={device.model} />
          <Row label="Número de serie" value={device.serialNumber || "—"} />
          <Row label="IMEI" value={device.imei} />
          <Row label="Sistema operativo" value={device.os || "—"} />
          <Row label="Estado" value={translate("device", device.status ?? "")} />
        </div>

        <Divider />

        {/* Asignaciones */}
        <div className="space-y-2">
          <Row label="Empleado asignado" value={device.employeeId ?? "Sin asignar"} />
          <Row label="Línea asignada" value={device.lineId ?? "Sin línea"} />
          <Row label="Fecha de activación" value={device.activationDate} />
        </div>
      </DialogContent>

      <DialogActions className="p-4 bg-white dark:bg-slate-900 dark:text-slate-100">
        <Button onClick={onClose} variant="contained" fullWidth>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
