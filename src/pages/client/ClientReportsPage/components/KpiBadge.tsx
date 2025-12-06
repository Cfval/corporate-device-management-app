import type { FC } from "react";

export type BadgeColor =
  | "primary"
  | "success"
  | "warning"
  | "default"
  | "info"
  | "error";

const colorClasses: Record<BadgeColor, string> = {
  primary:
    "border-sky-500 bg-sky-50 text-sky-900 dark:border-sky-400/80 dark:bg-sky-500/10 dark:text-sky-100",
  success:
    "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-400/80 dark:bg-emerald-500/10 dark:text-emerald-100",
  warning:
    "border-amber-500 bg-amber-50 text-amber-900 dark:border-amber-400/80 dark:bg-amber-500/10 dark:text-amber-100",
  error:
    "border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-400/80 dark:bg-rose-500/10 dark:text-rose-100",
  info:
    "border-cyan-500 bg-cyan-50 text-cyan-900 dark:border-cyan-400/80 dark:bg-cyan-500/10 dark:text-cyan-100",
  default:
    "border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
};

interface KpiBadgeProps {
  label: string;
  value: number;
  color?: BadgeColor;
}

export const KpiBadge: FC<KpiBadgeProps> = ({
  label,
  value,
  color = "primary",
}) => (
  <div
    className={`rounded-xl border px-3 py-2 text-sm ${colorClasses[color]}`}
  >
    <div className="text-xs font-medium uppercase tracking-wide text-slate-500/80 dark:text-slate-400/80">
      {label}
    </div>
    <div className="text-lg font-semibold">
      {value.toLocaleString("es-ES")}
    </div>
  </div>
);
