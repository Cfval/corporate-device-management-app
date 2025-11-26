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
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      disableEnforceFocus={false}
    >
        <DialogTitle>Detalles de la línea</DialogTitle>
  
        <DialogContent dividers>
          <Typography><strong>ID:</strong> {line.id}</Typography>
          <Typography><strong>Número:</strong> {line.phoneNumber}</Typography>
          <Typography><strong>Tarifa:</strong> {line.tariffType}</Typography>
          <Typography><strong>Estado:</strong> <LineStatusChip status={line.status} /></Typography>
  
          <Divider sx={{ my: 2 }} />
  
          <Typography><strong>ICCID:</strong> {line.iccid}</Typography>
          <Typography><strong>Tipo SIM:</strong> {line.simType}</Typography>
          <Typography><strong>PIN:</strong> {line.pin}</Typography>
          <Typography><strong>PUK:</strong> {line.puk}</Typography>
          <Typography><strong>Operador:</strong> <OperatorChip operator={line.operator} /></Typography>
  
          <Divider sx={{ my: 2 }} />
  
          <Typography><strong>Empleado asignado:</strong> {line.employeeId ?? "Sin asignar"}</Typography>
          <Typography><strong>Dispositivo asociado:</strong> {line.deviceId ?? "Sin dispositivo"}</Typography>
          <Typography><strong>Fecha activación:</strong> {line.activationDate}</Typography>
        </DialogContent>
  
        <DialogActions>
          <Button variant="contained" onClick={onClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  