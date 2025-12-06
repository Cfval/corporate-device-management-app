import type { FC } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

import { AnimatedCard } from "../layout/AnimatedCard";
import type { GrowthPoint } from "../useReportsLogic";
import { diffInMonths } from "../useReportsLogic";

const Y_AXIS_STEP = 5;
const MONTHS_PER_YEAR = 12;

const computeYAxisMax = (points: GrowthPoint[]): number => {
  const lastValue = points.length ? points[points.length - 1].y : 0;
  return Math.max(Y_AXIS_STEP, Math.ceil(lastValue / Y_AXIS_STEP) * Y_AXIS_STEP);
};

interface GrowthLineChartProps {
  title: string;
  color: string;
  points: GrowthPoint[];
  dateFormatter: Intl.DateTimeFormat;
  minYAxisMax?: number;
}

export const GrowthLineChart: FC<GrowthLineChartProps> = ({
  title,
  color,
  points,
  dateFormatter,
  minYAxisMax,
}) => {
  const hasData = points.length > 0;

  if (!hasData) {
    return (
      <AnimatedCard>
        <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay datos suficientes para mostrar esta tendencia.
        </p>
      </AnimatedCard>
    );
  }

  const firstX = points[0]?.x;
  if (!firstX) {
    return (
      <AnimatedCard>
        <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No hay datos suficientes para mostrar esta tendencia.
        </p>
      </AnimatedCard>
    );
  }

  const dataset = [
    { x: firstX.getTime(), y: 0 },
    ...points.map((p) => ({ x: p.x.getTime(), y: p.y })),
  ];

  const requestedMinMax = minYAxisMax
    ? Math.max(
        Y_AXIS_STEP,
        Math.ceil(minYAxisMax / Y_AXIS_STEP) * Y_AXIS_STEP,
      )
    : Y_AXIS_STEP;

  const yMax = Math.max(requestedMinMax, computeYAxisMax(points));
  const lastX = dataset[dataset.length - 1]?.x ?? firstX.getTime();
  const monthsBetween = diffInMonths(firstX, new Date(lastX));

  const yearTickNumber =
    monthsBetween > 0
      ? Math.max(2, Math.floor(monthsBetween / MONTHS_PER_YEAR) + 1)
      : 2;

  return (
    <AnimatedCard>
      <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dataset}
            margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="dark:stroke-slate-700"
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickCount={yearTickNumber}
              tickFormatter={(value) =>
                dateFormatter.format(new Date(value as number))
              }
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              domain={[0, yMax]}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: "#e5e7eb" }}
            />
            <RechartsTooltip
              labelFormatter={(value) =>
                dateFormatter.format(new Date(value as number))
              }
              formatter={(val: number) => [val, "Total acumulado"]}
              contentStyle={{
                fontSize: 12,
              }}
            />
            <Line
              type="linear"
              dataKey="y"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnimatedCard>
  );
};
