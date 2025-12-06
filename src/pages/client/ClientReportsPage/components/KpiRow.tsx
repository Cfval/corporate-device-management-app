import type { FC } from "react";

interface KpiRowProps {
  label: string;
  value: number;
}

export const KpiRow: FC<KpiRowProps> = ({ label, value }) => (
  <div className="flex items-baseline gap-2 text-sm">
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className="font-semibold text-slate-900 dark:text-slate-50">
      {value.toLocaleString("es-ES")}
    </span>
  </div>
);
