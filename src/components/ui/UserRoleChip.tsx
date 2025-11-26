import { Chip } from "@mui/material";

export const UserRoleChip = ({ role }: { role: string }) => {
  const colorMap: Record<
    string,
    "primary" | "secondary" | "success" | "warning" | "info" | "default"
  > = {
    ADMIN: "primary",
    GERENTE: "secondary",
    TÉCNICO: "warning",
    ANALISTA: "info",
    SOPORTE: "warning",
    EMPLEADO: "default",
  };

  const color = colorMap[role] ?? "default";

  return <Chip label={role} color={color} size="small" />;
};

