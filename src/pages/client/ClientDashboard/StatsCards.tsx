// src/pages/client/ClientDashboard/StatsCards.tsx
import { Card, CardContent } from "@mui/material";
import type {
  ClientReport,
  DeviceHealthReport,
  LineUsageReport,
} from "../../../types/Reports";
import { motion } from "framer-motion";

interface StatsCardsProps {
  clientReport: ClientReport;
  deviceReport: DeviceHealthReport;
  lineReport: LineUsageReport;
}

const StatsCards = ({
  clientReport,
  deviceReport,
  lineReport,
}: StatsCardsProps) => {
  const kpiStats = [
    {
      label: "Usuarios totales",
      total: clientReport.totalUsers,
      detail: `Activos: ${clientReport.activeUsers}`,
    },
    {
      label: "Dispositivos totales",
      total: deviceReport.totalDevices,
      detail: `Asignados: ${deviceReport.assignedDevices}`,
    },
    {
      label: "Líneas totales",
      total: lineReport.totalLines,
      detail: `Activas: ${lineReport.activeLines}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
    >
      <Card className="h-full rounded-3xl border border-slate-200/70 bg-white shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Indicadores principales
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/80">
            {kpiStats.map((stat, index) => (
              <div key={stat.label} className={index === 0 ? "pt-1 pb-4" : "py-4"}>
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-50">
                  {stat.total.toLocaleString("es-ES")}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCards;
