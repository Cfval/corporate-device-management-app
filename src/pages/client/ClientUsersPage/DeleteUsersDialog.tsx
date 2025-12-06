import type { FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";

interface DeleteUsersDialogProps {
  open: boolean;
  loading: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteUsersDialog: FC<DeleteUsersDialogProps> = ({
  open,
  loading,
  selectedCount,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      disableRestoreFocus
      disableEnforceFocus={false}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          className:
            "rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50",
        },
      }}
    >
      <DialogTitle className="text-lg font-semibold">
        Eliminar usuarios seleccionados
      </DialogTitle>
      <DialogContent dividers className="space-y-2 text-sm">
        <Typography className="text-slate-600 dark:text-slate-300">
          ¿Seguro que quieres eliminar{" "}
          <strong className="font-semibold text-slate-900 dark:text-white">
            {selectedCount}
          </strong>{" "}
          {selectedCount === 1 ? "usuario" : "usuarios"}? Esta acción no se puede
          deshacer.
        </Typography>
      </DialogContent>
      <DialogActions className="px-4 py-3">
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          className="text-slate-700 dark:text-slate-200"
        >
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Eliminar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUsersDialog;
