import { Chip } from "@mui/material";
import { translate } from "../../utils/translate";

const COLOR_MAP: Record<string, "success" | "primary" | "warning" | "error" | "default"> = {
  ASSIGNED: "primary",
  STORAGE: "warning",
  REPAIR: "warning",
  LOST: "error",
  DECOMMISSIONED: "default",
};

export const DeviceStatusChip = ({ status }: { status: string }) => {
  const color = COLOR_MAP[status] ?? "default";
  const label = translate("device", status);

  return <Chip component="span" label={label} color={color} size="small" />;
};

