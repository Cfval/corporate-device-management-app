import type { FC } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";

import type { LineUsageReport } from "../../../../types/Reports";
import { AnimatedCard } from "../layout/AnimatedCard";
import { KpiBadge } from "../components/KpiBadge";

const PIE_COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

interface LineOperatorsPieProps {
  report: LineUsageReport;
  data: { name: string; value: number }[];
}

export const LineOperatorsPie: FC<LineOperatorsPieProps> = ({
  report,
  data,
}) => {
  return (
    <AnimatedCard delay={0.06}>
      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Uso de líneas
      </h2>

      {/* KPIs en grid 2 columnas */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <KpiBadge label="Total" value={report.totalLines} />
        <KpiBadge
          label="Activas"
          value={report.activeLines}
          color="success"
        />
        <KpiBadge
          label="Suspendidas"
          value={report.suspendedLines}
          color="warning"
        />
        <KpiBadge
          label="Desactivadas"
          value={report.deactivatedLines}
          color="default"
        />
        <KpiBadge
          label="Sin asignar"
          value={report.unassignedLines}
          color="info"
        />
      </div>

      <div className="h-64">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ value }) => value}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number, name: string) => [
                  value,
                  `Líneas (${name})`,
                ]}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No hay datos de operadores disponibles.
            </p>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};
