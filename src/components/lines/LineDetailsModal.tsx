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
    <Typography className="text-gray-900">
      <strong className="text-gray-700">{label}:</strong> {value ?? "—"}
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
          className: "rounded-xl",
        },
      }}
    >
      <DialogTitle className="font-semibold text-lg">
        Detalles de la línea
      </DialogTitle>

      <DialogContent dividers className="space-y-4">
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

      <DialogActions className="p-4">
        <Button variant="contained" onClick={onClose} fullWidth>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

  