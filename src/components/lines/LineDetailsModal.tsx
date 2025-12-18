import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
} from "@mui/material";

import type { Line } from "../../types/Line";
import { LineStatusChip } from "../ui/LineStatusChip";
import { OperatorChip } from "../ui/OperatorChip";

interface Props {
  open: boolean;
  line: Line | null;
  onClose: () => void;
}

export const LineDetailsModal = ({ open, line, onClose }: Props) => {
  if (!line) return null;

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
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
        Detalles de la línea
      </DialogTitle>

      <DialogContent
        dividers
        className="space-y-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100"
      >
        {/* Información general */}
        <div className="space-y-2">
          <Row label="ID" value={line.id} />
          <Row label="Número" value={line.phoneNumber} />
          <Row label="Tarifa" value={line.tariffType || "—"} />
          <Row
            label="Estado"
            value={<LineStatusChip status={line.status} />}
          />
        </div>

        <Divider />

        {/* Información técnica */}
        <div className="space-y-2">
          <Row label="ICCID" value={line.iccid || "—"} />
          <Row label="Tipo SIM" value={line.simType || "—"} />
          <Row label="PIN" value={line.pin || "—"} />
          <Row label="PUK" value={line.puk || "—"} />
          <Row
            label="Operador"
            value={<OperatorChip operator={line.operator} />}
          />
        </div>

        <Divider />

        {/* Relaciones */}
        <div className="space-y-2">
          <Row label="Empleado asignado" value={line.employeeId ?? "Sin asignar"} />
          <Row
            label="Dispositivo asociado"
            value={line.deviceId ?? "Sin dispositivo"}
          />
          <Row label="Fecha activación" value={line.activationDate} />
        </div>
      </DialogContent>

      <DialogActions className="p-4 bg-white dark:bg-slate-900 dark:text-slate-100">
        <Button variant="contained" onClick={onClose} fullWidth>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

  