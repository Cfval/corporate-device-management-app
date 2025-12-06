import type { FC, ChangeEvent } from "react";
import type { Device } from "../../../../types/Device";
import { Checkbox } from "../../../../components/ui/Checkbox";
import { DeviceStatusChip } from "../../../../components/ui/DeviceStatusChip";
import { IconButton } from "../../../../components/ui/IconButton";
import { Edit3, Eye } from "lucide-react";
import { translate } from "../../../../utils/translate";

interface DevicesTableRowProps {
  device: Device;
  selectionMode: boolean;
  selected: boolean;
  onSelectChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onEdit: () => void;
  onViewDetails: () => void;
}

const DevicesTableRow: FC<DevicesTableRowProps> = ({
  device,
  selectionMode,
  selected,
  onSelectChange,
  onEdit,
  onViewDetails,
}) => {
  return (
    <tr
      className={`text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700 ${
        selected ? "bg-sky-50/60 dark:bg-sky-900/30" : ""
      }`}
    >
      {selectionMode && (
        <td className="w-10 px-3 py-3">
          <Checkbox checked={selected} onChange={onSelectChange} />
        </td>
      )}
      <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{device.id}</td>
      <td className="px-3 py-3 text-slate-900 dark:text-slate-50">
        {translate("type", device.type ?? "")}
      </td>
      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{device.brand || "—"}</td>
      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{device.model || "—"}</td>
      <td className="px-3 py-3">
        <DeviceStatusChip status={device.status} />
      </td>
      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
        {device.employeeId ?? "—"}
      </td>
      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{device.lineId ?? "—"}</td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-2">
          <IconButton onClick={onEdit} aria-label="Editar dispositivo">
            <Edit3 className="h-4 w-4" />
          </IconButton>
          <IconButton onClick={onViewDetails} aria-label="Ver detalles del dispositivo">
            <Eye className="h-4 w-4" />
          </IconButton>
        </div>
      </td>
    </tr>
  );
};

export default DevicesTableRow;
