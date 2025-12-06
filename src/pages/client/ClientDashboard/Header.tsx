// src/pages/client/ClientDashboard/Header.tsx
import { Card, CardContent, Chip } from "@mui/material";
import type { ClientReport, LineUsageReport } from "../../../types/Reports";
import { motion } from "framer-motion";

interface HeaderProps {
  clientReport: ClientReport;
  lineReport: LineUsageReport;
}

const Header = ({ clientReport, lineReport }: HeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-r from-sky-100/80 via-sky-50/90 to-transparent shadow-sm dark:border-sky-800/60 dark:from-sky-950/60 dark:via-slate-900/80">
        <CardContent className="relative z-10 space-y-3 p-6 md:p-8">
          <p className="text-[0.65rem] font-semibold tracking-[0.4em] text-sky-700/80 dark:text-sky-300/80 uppercase">
            Panel del cliente
          </p>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 md:text-3xl">
            Panel de Control — {clientReport.clientName}
          </h1>

          <p className="text-sm text-slate-700 dark:text-slate-300">
            Resumen general de tu empresa
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <Chip
              label={`Usuarios activos: ${clientReport.activeUsers}`}
              variant="outlined"
              className="border-sky-300/60 text-xs font-medium text-sky-700 dark:border-sky-700/80 dark:text-sky-200"
            />
            <Chip
              label={`Líneas activas: ${lineReport.activeLines}`}
              variant="outlined"
              className="border-sky-300/60 text-xs font-medium text-sky-700 dark:border-sky-700/80 dark:text-sky-200"
            />
          </div>
        </CardContent>

        {/* glow decorativo */}
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-[140%] rounded-[999px] bg-[radial-gradient(circle_at_10%_60%,rgba(59,130,246,0.35),transparent_65%)] dark:bg-[radial-gradient(circle_at_10%_60%,rgba(59,130,246,0.5),transparent_65%)]" />
      </Card>
    </motion.div>
  );
};

export default Header;
