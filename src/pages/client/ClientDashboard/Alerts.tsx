import { Card, CardContent, Chip } from "@mui/material";
import type { DeviceHealthReport, LineUsageReport } from "../../../types/Reports";
import { motion } from "framer-motion";

interface AlertsProps {
  deviceReport: DeviceHealthReport;
  lineReport: LineUsageReport;
}

const Alerts = ({ deviceReport, lineReport }: AlertsProps) => {
  const alertChips = [
    deviceReport.repairDevices > 0 && {
      label: `Dispositivos en reparación: ${deviceReport.repairDevices}`,
      color: "warning" as const,
    },
    deviceReport.lostDevices > 0 && {
      label: `Dispositivos perdidos: ${deviceReport.lostDevices}`,
      color: "error" as const,
    },
    lineReport.suspendedLines > 0 && {
      label: `Líneas suspendidas: ${lineReport.suspendedLines}`,
      color: "warning" as const,
    },
  ].filter(Boolean) as Array<{ label: string; color: "warning" | "error" }>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className="h-full rounded-3xl border border-slate-200/70 !bg-white shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:!bg-slate-900">
        <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              ⚠ Atención requerida
            </h2>
            <Chip
              label={alertChips.length ? "Incidencias activas" : "Sin incidencias"}
              color={alertChips.length ? "warning" : "default"}
              variant={alertChips.length ? "filled" : "outlined"}
              className="text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {alertChips.length ? (
              alertChips.map((chip) => (
                <Chip
                  key={chip.label}
                  label={chip.label}
                  color={chip.color}
                  variant="outlined"
                  className="text-xs"
                />
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Todo está en orden. No se registran incidencias.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Alerts;
