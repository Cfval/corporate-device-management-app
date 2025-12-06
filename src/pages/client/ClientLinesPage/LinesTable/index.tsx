import type { FC } from "react";
import LinesTableHeader from "./LinesTableHeader";
import LinesTableRow from "./LinesTableRow";
import type { Line } from "../../../../types/Line";

interface LinesTableProps {
  lines: Line[];
  selectionMode: boolean;
  selectedIds: number[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (id: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (line: Line) => void;
  onView: (line: Line) => void;
}

const LinesTable: FC<LinesTableProps> = ({
  lines,
  selectionMode,
  selectedIds,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectOne,
  onEdit,
  onView,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full border-collapse text-slate-700 dark:text-slate-200">
        <LinesTableHeader
          selectionMode={selectionMode}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onSelectAll={onSelectAll}
        />

        <tbody>
          {lines.map((line) => {
            const isSelected = selectedIds.includes(line.id);

            return (
              <LinesTableRow
                key={line.id}
                line={line}
                selectionMode={selectionMode}
                isSelected={isSelected}
                onSelectOne={onSelectOne(line.id)}
                onEdit={() => onEdit(line)}
                onView={() => onView(line)}
              />
            );
          })}

          {lines.length === 0 && (
            <tr>
              <td
                colSpan={selectionMode ? 10 : 9}
                className="py-8 text-center text-slate-500 dark:text-slate-400"
              >
                No se encontraron líneas con el criterio actual.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LinesTable;
