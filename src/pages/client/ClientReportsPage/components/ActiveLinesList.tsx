import type { FC } from "react";
import type { EnrichedActiveLine } from "../useReportsLogic";

interface ActiveLinesListProps {
  lines: EnrichedActiveLine[];
}

export const ActiveLinesList: FC<ActiveLinesListProps> = ({ lines }) => {
  if (!lines.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No hay líneas activas registradas.
      </p>
    );
  }

  return (
    <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
      {lines.map(({ phoneNumber, userName, department }) => {
        const label = userName
          ? `${phoneNumber} · ${userName}${
              department ? ` (${department})` : ""
            }`
          : `${phoneNumber} · Sin asignación`;

        return (
          <div
            key={phoneNumber}
            className="inline-flex items-center justify-between gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs text-sky-900 shadow-sm dark:bg-sky-500/10 dark:text-sky-100"
          >
            <span className="truncate">{label}</span>
          </div>
        );
      })}
    </div>
  );
};
