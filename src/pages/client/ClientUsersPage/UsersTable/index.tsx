import type { FC, ChangeEvent } from "react";
import type { User } from "../../../../types/User";
import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";

interface UsersTableProps {
  users: User[];
  filteredUsers: User[];
  selectionMode: boolean;
  selectedIds: number[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (userId: number) => (event: ChangeEvent<HTMLInputElement>) => void;
  onEditUser: (user: User) => void;
  tableColumnCount: number;
}

const UsersTable: FC<UsersTableProps> = ({
  users,
  filteredUsers,
  selectionMode,
  selectedIds,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectOne,
  onEditUser,
  tableColumnCount,
}) => {
  const hasUsers = users.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full border-collapse text-slate-700 dark:text-slate-200">
        <UsersTableHeader
          selectionMode={selectionMode}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onSelectAll={onSelectAll}
        />

        <tbody>
          {filteredUsers.map((user) => {
            const isSelected = selectedIds.includes(user.id);

            return (
              <UsersTableRow
                key={user.id}
                user={user}
                selectionMode={selectionMode}
                selected={isSelected}
                onSelectChange={onSelectOne(user.id)}
                onEdit={() => onEditUser(user)}
              />
            );
          })}

          {filteredUsers.length === 0 && (
            <tr>
              <td
                colSpan={tableColumnCount}
                className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {hasUsers
                  ? "No se encontraron usuarios con el criterio actual."
                  : "No hay usuarios registrados en este cliente."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
