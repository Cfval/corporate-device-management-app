import type { FC } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

import type { DeviceHealthReport } from "../../../../types/Reports";
import { AnimatedCard } from "../layout/AnimatedCard";
import { KpiBadge } from "../components/KpiBadge";

interface DeviceHealthBarProps {
  report: DeviceHealthReport;
  data: { name: string; value: number }[];
}

export const DeviceHealthBar: FC<DeviceHealthBarProps> = ({
  report,
  data,
}) => {
  return (
    <AnimatedCard delay={0.04}>
      <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
        Salud de dispositivos
      </h2>

      {/* KPIs en grid 2 columnas */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        <KpiBadge label="Total" value={report.totalDevices} />
        <KpiBadge
          label="Asignados"
          value={report.assignedDevices}
          color="success"
        />
        <KpiBadge
          label="Almacén"
          value={report.storageDevices}
          color="warning"
        />
        <KpiBadge
          label="Reparación"
          value={report.repairDevices}
          color="warning"
        />
        <KpiBadge
          label="Perdidos"
          value={report.lostDevices}
          color="error"
        />
        <KpiBadge
          label="Baja"
          value={report.decommissionedDevices}
          color="error"
        />
      </div>

      <div className="h-64">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={{ stroke: "#e5e7eb" }}
              />
              <RechartsTooltip
                formatter={(value: number) => [value, "Dispositivos"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No hay datos suficientes para mostrar el gráfico.
            </p>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};
