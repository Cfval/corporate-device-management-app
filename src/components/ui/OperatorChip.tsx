import { Chip } from "@mui/material";

export const OperatorChip = ({ operator }: { operator: string }) => {
  const colorMap: Record<string, "primary" | "info" | "warning" | "secondary" | "default"> = {
    Movistar: "primary",
    Orange: "warning",
    Vodafone: "secondary",
    Pepephone: "info",
  };

  const color = colorMap[operator] ?? "default";

  return <Chip label={operator} color={color} size="small" />;
};


