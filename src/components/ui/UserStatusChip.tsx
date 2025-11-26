import { Chip } from "@mui/material";
import { translate } from "../../utils/translate";

export const UserStatusChip = ({ status }: { status: string }) => {
  const color = status === "ACTIVE" ? "success" : "default";
  const label = translate("user", status);

  return <Chip label={label} color={color} size="small" />;
};

