import type { ClientReport, LineUsageReport } from "../../../types/Reports";
import { motion } from "framer-motion";

interface HeaderProps {
  clientReport: ClientReport;
  lineReport: LineUsageReport;
}

const Header = ({ clientReport, lineReport }: HeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        className="
          relative overflow-hidden rounded-2xl
          border border-slate-200 dark:border-slate-700
          bg-white/70 dark:bg-slate-900/60
          backdrop-blur-sm
          px-6 py-6 md:px-8 md:py-7
        "
      >
        {/* Header content */}
        <div className="relative z-10 space-y-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            Panel del cliente
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
            {clientReport.clientName}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Resumen general de actividad y estado del sistema
          </p>

          {/* KPIs rápidos */}
          <div className="flex flex-wrap gap-3 pt-2">
            <span
              className="
                inline-flex items-center rounded-full
                border border-slate-300 dark:border-slate-600
                bg-slate-50 dark:bg-slate-800
                px-3 py-1 text-xs font-medium
                text-slate-700 dark:text-slate-200
              "
            >
              Usuarios activos: {clientReport.activeUsers}
            </span>

            <span
              className="
                inline-flex items-center rounded-full
                border border-slate-300 dark:border-slate-600
                bg-slate-50 dark:bg-slate-800
                px-3 py-1 text-xs font-medium
                text-slate-700 dark:text-slate-200
              "
            >
              Líneas activas: {lineReport.activeLines}
            </span>
          </div>
        </div>

        {/* Decoración sutil */}
        <div
          className="
            pointer-events-none absolute inset-x-0 bottom-0 h-24
            bg-gradient-to-t from-slate-100/60 to-transparent
            dark:from-slate-800/40
          "
        />
      </div>
    </motion.div>
  );
};

export default Header;

