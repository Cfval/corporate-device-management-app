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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      disableEnforceFocus={false}
    >
      <DialogTitle>Detalles del dispositivo</DialogTitle>

      <DialogContent dividers>
        <Typography variant="subtitle1"><strong>ID:</strong> {device.id}</Typography>
        <Typography>
          <strong>Tipo:</strong> {translate("type", device.type ?? "")}
        </Typography>
        <Typography><strong>Marca:</strong> {device.brand}</Typography>
        <Typography><strong>Modelo:</strong> {device.model}</Typography>
        <Typography><strong>Serial Number:</strong> {device.serialNumber}</Typography>
        <Typography><strong>IMEI:</strong> {device.imei}</Typography>
        <Typography><strong>OS:</strong> {device.os}</Typography>

        <Divider sx={{ my: 2 }} />

        <Typography>
          <strong>Empleado asignado:</strong> {device.employeeId ?? "Sin asignar"}
        </Typography>
        <Typography>
          <strong>Línea asignada:</strong> {device.lineId ?? "Sin línea"}
        </Typography>
        <Typography><strong>Fecha activación:</strong> {device.activationDate}</Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
