import type { FC, ChangeEvent } from "react";
import type { User } from "../../../../types/User";
import { Checkbox } from "../../../../components/ui/Checkbox";
import { UserStatusChip } from "../../../../components/ui/UserStatusChip";
import { UserRoleChip } from "../../../../components/ui/UserRoleChip";
import { IconButton } from "../../../../components/ui/IconButton";
import { Edit3 } from "lucide-react";

interface UsersTableRowProps {
  user: User;
  selectionMode: boolean;
  selected: boolean;
  onSelectChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onEdit: () => void;
}

const UsersTableRow: FC<UsersTableRowProps> = ({
  user,
  selectionMode,
  selected,
  onSelectChange,
  onEdit,
}) => {
  const registrationDate = new Date(user.registrationDate).toLocaleDateString();

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

      <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{user.id}</td>
      <td className="px-3 py-3 text-slate-900 dark:text-slate-50">{user.fullName}</td>
      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
        <span className="block truncate" title={user.email}>
          {user.email}
        </span>
      </td>
      <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
        {user.department || "Sin departamento"}
      </td>
      <td className="px-3 py-3">
        <UserStatusChip status={user.status} />
      </td>
      <td className="px-3 py-3">
        <UserRoleChip role={user.role} />
      </td>
      <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{registrationDate}</td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-center">
          <IconButton onClick={onEdit} aria-label="Editar usuario">
            <Edit3 className="h-4 w-4" />
          </IconButton>
        </div>
      </td>
    </tr>
  );
};

export default UsersTableRow;
