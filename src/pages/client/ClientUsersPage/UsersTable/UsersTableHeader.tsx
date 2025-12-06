import type { FC, ChangeEvent } from "react";
import { Checkbox } from "../../../../components/ui/Checkbox";

interface UsersTableHeaderProps {
  selectionMode: boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
}

const UsersTableHeader: FC<UsersTableHeaderProps> = ({
  selectionMode,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
}) => {
  return (
    <thead className="bg-slate-50 dark:bg-slate-800/50">
      <tr className="text-left text-sm text-slate-600 dark:text-slate-300">
        {selectionMode && (
          <th className="w-10 px-3 py-3">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={onSelectAll}
            />
          </th>
        )}
        <th className="px-3 py-3 font-semibold">ID</th>
        <th className="px-3 py-3 font-semibold">Nombre</th>
        <th className="px-3 py-3 font-semibold">Email</th>
        <th className="px-3 py-3 font-semibold">Departamento</th>
        <th className="px-3 py-3 font-semibold">Estado</th>
        <th className="px-3 py-3 font-semibold">Rol</th>
        <th className="px-3 py-3 font-semibold">Registro</th>
        <th className="px-3 py-3 font-semibold text-center">Acciones</th>
      </tr>
    </thead>
  );
};

export default UsersTableHeader;
