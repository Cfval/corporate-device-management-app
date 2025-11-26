import { Chip } from "@mui/material";
import { translate } from "../../utils/translate";

type LineStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

const COLOR_MAP: Record<LineStatus, "success" | "warning" | "default"> = {
  ACTIVE: "success",
  SUSPENDED: "default",
  DEACTIVATED: "default",
};

export const LineStatusChip = ({ status }: { status: string }) => {
  const color = COLOR_MAP[status as LineStatus] ?? "default";
  const label = translate("line", status);

  return <Chip component="span" label={label} color={color} size="small" />;
};

