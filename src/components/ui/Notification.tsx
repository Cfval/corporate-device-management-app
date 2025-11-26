import { Snackbar, Alert } from "@mui/material";

interface Props {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  onClose: () => void;
  autoHideDuration?: number;
}

export const Notification = ({ 
  open, 
  message, 
  severity = "info", 
  onClose,
  autoHideDuration 
}: Props) => {
  // Duración por defecto: errores duran más (6s), éxito/info/warning 3s
  const defaultDuration = severity === "error" ? 6000 : 3000;
  const duration = autoHideDuration ?? defaultDuration;

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
