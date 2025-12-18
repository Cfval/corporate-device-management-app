// src/pages/client/ClientDashboard/RecentLines.tsx
import { Card, CardContent, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Line } from "../../../types/Line";
import { LineStatusChip } from "../../../components/ui/LineStatusChip";
import { OperatorChip } from "../../../components/ui/OperatorChip";
import { motion } from "framer-motion";

interface RecentLinesProps {
  lines: Line[];
}

const RecentLines = ({ lines }: RecentLinesProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
    >
      <Card className="h-full rounded-3xl border border-slate-200/70 bg-white shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900">
        <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Últimas líneas
            </h2>
            <Button
              size="small"
              onClick={() => navigate("/client/lines")}
              className="normal-case"
            >
              Ver todo
            </Button>
          </div>

          {lines.length ? (
            <div className="flex flex-col gap-2.5">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-sm shadow-sm dark:border-slate-700/80 dark:bg-slate-800/70"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                        {line.phoneNumber}
                      </p>
                      <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                        Empleado:{" "}
                        {line.employeeId ? `#${line.employeeId}` : "Sin asignar"}
                      </p>
                    </div>
                    <LineStatusChip status={line.status} />
                  </div>

                  <div className="flex items-center justify-between text-[0.7rem] text-slate-500 dark:text-slate-400">
                    <span>Tarifa: {line.tariffType}</span>
                    <OperatorChip operator={line.operator} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No hay líneas recientes para mostrar.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentLines;
