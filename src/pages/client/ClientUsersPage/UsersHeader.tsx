import type React from "react";
import { Button } from "../../../components/ui/Button";
import { Search, Trash2, Plus, X } from "lucide-react";
import usersIcon from "../../../assets/icons/users.svg";
interface UsersHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectionMode: boolean;
  selectedCount: number;
  onDeleteSelected: () => void;
  onCancelSelection: () => void;
  onCreateUser: () => void;
}

const UsersHeader: React.FC<UsersHeaderProps> = ({
  search,
  onSearchChange,
  selectionMode,
  selectedCount,
  onDeleteSelected,
  onCancelSelection,
  onCreateUser,
}) => {
  return (
    <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-end gap-3">
            <div>
              <img
                src={usersIcon}
                alt="Usuarios"
                className="h-24 w-24"
                aria-hidden="true"
              />
            </div>
            <div className="-translate-y-1">
              <h1 className="text-[1.375rem] font-semibold text-slate-900 dark:text-slate-50">
                Mis usuarios
              </h1>
            </div>
          </div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar usuarios"
            className="w-72 max-w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/40"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={selectionMode ? "danger" : "outline"}
          size="sm"
          onClick={onDeleteSelected}
          className="inline-flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {selectionMode ? "Confirmar borrado" : "Borrar selección"}
          {selectionMode && selectedCount > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-2 text-xs">
              {selectedCount}
            </span>
          )}
        </Button>

        {selectionMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelSelection}
            className="inline-flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar selección
          </Button>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={onCreateUser}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Crear usuario
        </Button>
      </div>
    </div>
  );
};

export default UsersHeader;
