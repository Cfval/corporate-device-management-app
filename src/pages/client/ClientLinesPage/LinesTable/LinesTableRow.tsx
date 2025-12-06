import type { FC } from "react";
import { Checkbox } from "../../../../components/ui/Checkbox";
import { Edit3, Eye } from "lucide-react";
import { IconButton } from "../../../../components/ui/IconButton";
import { LineStatusChip } from "../../../../components/ui/LineStatusChip";
import { OperatorChip } from "../../../../components/ui/OperatorChip";
import type { Line } from "../../../../types/Line";

interface LinesTableRowProps {
  line: Line;
  selectionMode: boolean;
  isSelected: boolean;
  onSelectOne: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: () => void;
  onView: () => void;
}

const LinesTableRow: FC<LinesTableRowProps> = ({
  line,
  selectionMode,
  isSelected,
  onSelectOne,
  onEdit,
  onView,
}) => {
  return (
    <tr
      className={`
        text-sm transition
        hover:bg-slate-50 dark:hover:bg-slate-800/40
        border-b border-slate-200 dark:border-slate-700
      `}
    >
      {selectionMode && (
        <td className="w-10 px-3">
          <Checkbox checked={isSelected} onChange={onSelectOne} />
        </td>
      )}

      <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{line.id}</td>
      <td className="px-3 py-3">{line.phoneNumber}</td>
      <td className="px-3 py-3">{line.tariffType || "—"}</td>

      <td className="px-3 py-3">
        <LineStatusChip status={line.status} />
      </td>

      <td className="px-3 py-3">
        <OperatorChip operator={line.operator} />
      </td>

      <td className="px-3 py-3">{line.employeeId ?? "—"}</td>
      <td className="px-3 py-3">{line.deviceId ?? "—"}</td>

      <td className="px-3 py-3 flex items-center justify-center gap-2">
        <IconButton onClick={onEdit}>
          <Edit3 className="h-4 w-4" />
        </IconButton>

        <IconButton onClick={onView}>
          <Eye className="h-4 w-4" />
        </IconButton>
      </td>
    </tr>
  );
};

export default LinesTableRow;
