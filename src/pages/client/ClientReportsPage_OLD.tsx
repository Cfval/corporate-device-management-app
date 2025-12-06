import { useEffect, useMemo, useState } from "react";
import { CircularProgress } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  LineChart,
  Line as RechartsLine,
} from "recharts";
import { motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import {
  getClientReport,
  getDeviceHealthReport,
  getLineUsageReport,
} from "../../api/reports";
import { getUsersByClient } from "../../api/users";
import { getDevicesByClient } from "../../api/devices";
import { getLinesByClient } from "../../api/lines";

import type {
  ClientReport,
  DeviceHealthReport,
  LineUsageReport,
} from "../../types/Reports";
import type { Line } from "../../types/Line";
import type { User } from "../../types/User";

type GrowthPoint = { x: Date; y: number };

const Y_AXIS_STEP = 5;
const MONTHS_PER_YEAR = 12;
const PIE_COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#ef4444", "#8b5cf6", "#14b8a6"];

type GrowthChartOptions = {
  minYAxisMax?: number;
};

/* ---------- Utilidades de fechas / crecimiento ---------- */

const parseLocalDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map((part) => Number(part));
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const diffInMonths = (start: Date, end: Date): number => {
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  return years * MONTHS_PER_YEAR + months;
};

const computeYAxisMax = (points: GrowthPoint[]): number => {
  const lastValue = points.length ? points[points.length - 1].y : 0;
  return Math.max(Y_AXIS_STEP, Math.ceil(lastValue / Y_AXIS_STEP) * Y_AXIS_STEP);
};

const buildGrowthSeries = <T,>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
): GrowthPoint[] => {
  const sortedDates = items
    .map((item) => parseLocalDate(getDate(item)))
    .filter((date): date is Date => date !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (!sortedDates.length) {
    return [];
  }

  let count = 0;
  return sortedDates.map((date) => {
    count += 1;
    return { x: date, y: count };
  });
};

/* ---------- Componentes pequeños reutilizables ---------- */

const AnimatedCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay }}
    className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
  >
    {children}
  </motion.section>
);

interface KpiRowProps {
  label: string;
  value: number;
}

const KpiRow = ({ label, value }: KpiRowProps) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
      {value.toLocaleString("es-ES")}
    </span>
  </div>
);

type BadgeColor =
  | "primary"
  | "success"
  | "warning"
  | "default"
  | "info"
  | "error";

interface KpiBadgeProps {
  label: string;
  value: number;
  color?: BadgeColor;
}

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

const KpiBadge = ({ label, value, color = "primary" }: KpiBadgeProps) => (
  <div
    className={`min-w-[110px] rounded-xl border px-3 py-2 text-sm ${colorClasses[color]}`}
  >
    <div className="text-xs font-medium uppercase tracking-wide text-slate-500/80 dark:text-slate-400/80">
      {label}
    </div>
    <div className="text-lg font-semibold">
      {value.toLocaleString("es-ES")}
    </div>
  </div>
);

interface GrowthChartCardProps {
  title: string;
  color: string;
  points: GrowthPoint[];
  dateFormatter: Intl.DateTimeFormat;
  options?: GrowthChartOptions;
}

const GrowthChartCard = ({
  title,
  color,
  points,
  dateFormatter,
  options,
}: GrowthChartCardProps) => {
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

  const requestedMinMax = options?.minYAxisMax
    ? Math.max(
        Y_AXIS_STEP,
        Math.ceil(options.minYAxisMax / Y_AXIS_STEP) * Y_AXIS_STEP,
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
            <RechartsLine
              type="monotone"
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

/* ---------- Página principal ---------- */

const ClientReportsPage = () => {
  const { user } = useAuth();
  const parsedClientId =
    user?.clientId !== undefined ? Number(user.clientId) : undefined;
  const clientId = Number.isFinite(parsedClientId) ? parsedClientId : undefined;

  const [clientReport, setClientReport] = useState<ClientReport | null>(null);
  const [deviceReport, setDeviceReport] = useState<DeviceHealthReport | null>(
    null,
  );
  const [lineReport, setLineReport] = useState<LineUsageReport | null>(null);
  const [clientLines, setClientLines] = useState<Line[]>([]);
  const [clientUsers, setClientUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userGrowth, setUserGrowth] = useState<GrowthPoint[]>([]);
  const [deviceGrowth, setDeviceGrowth] = useState<GrowthPoint[]>([]);
  const [lineGrowth, setLineGrowth] = useState<GrowthPoint[]>([]);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const loadReports = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          clientResponse,
          deviceResponse,
          lineResponse,
          usersResponse,
          devicesResponse,
          linesResponse,
        ] = await Promise.all([
          getClientReport(clientId),
          getDeviceHealthReport(clientId),
          getLineUsageReport(clientId),
          getUsersByClient(clientId),
          getDevicesByClient(clientId),
          getLinesByClient(clientId),
        ]);

        setClientReport(clientResponse.report);
        setDeviceReport(deviceResponse.report);
        setLineReport(lineResponse.report);

        setUserGrowth(
          buildGrowthSeries(usersResponse.users, (u) => u.registrationDate),
        );
        setDeviceGrowth(
          buildGrowthSeries(
            devicesResponse.devices,
            (d) => d.activationDate,
          ),
        );
        setLineGrowth(
          buildGrowthSeries(linesResponse.lines, (l) => l.activationDate),
        );

        setClientLines(linesResponse.lines);
        setClientUsers(usersResponse.users);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los reportes del cliente.");
        setClientLines([]);
        setClientUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [clientId]);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [],
  );

  const deviceChartData = useMemo(() => {
    if (!deviceReport) return [];
    return [
      { name: "Asignados", value: deviceReport.assignedDevices },
      { name: "Almacén", value: deviceReport.storageDevices },
      { name: "Reparación", value: deviceReport.repairDevices },
      { name: "Perdidos", value: deviceReport.lostDevices },
      { name: "Baja", value: deviceReport.decommissionedDevices },
    ];
  }, [deviceReport]);

  const linePieData = useMemo(() => {
    if (!lineReport) return [];
    return Object.entries(lineReport.linesByOperator ?? {}).map(
      ([operator, value], index) => ({
        name: operator,
        value,
        color: PIE_COLORS[index % PIE_COLORS.length],
      }),
    );
  }, [lineReport]);

  const lineByPhone = useMemo(() => {
    const map = new Map<string, Line>();
    clientLines.forEach((line) => {
      map.set(line.phoneNumber, line);
    });
    return map;
  }, [clientLines]);

  const userById = useMemo(() => {
    const map = new Map<number, User>();
    clientUsers.forEach((user) => {
      map.set(user.id, user);
    });
    return map;
  }, [clientUsers]);

  const enrichedActiveLines = useMemo(() => {
    if (!clientReport) return [];
    const activeNumbers = clientReport.activeLineNumbers ?? [];
    return activeNumbers.map((phoneNumber) => {
      const line = lineByPhone.get(phoneNumber);
      const user =
        line && line.employeeId != null
          ? userById.get(line.employeeId)
          : undefined;
      return {
        phoneNumber,
        userName: user?.fullName ?? null,
        department: user?.department ?? null,
      };
    });
  }, [clientReport, lineByPhone, userById]);

  /* ---------- Estados base ---------- */

  if (!clientId) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          No se ha encontrado el cliente actual.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      </div>
    );
  }

  if (!clientReport || !deviceReport || !lineReport) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          No se pudieron cargar los reportes. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }

  /* ---------- Render principal ---------- */

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Reportes — {clientReport.clientName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visión general del estado de usuarios, dispositivos y líneas del
          cliente.
        </p>
      </header>

      {/* GRID PRINCIPAL: KPIs + GRÁFICOS */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Reporte general */}
        <AnimatedCard delay={0.02}>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Reporte general
          </h2>

          <div className="space-y-2">
            <KpiRow label="Usuarios totales" value={clientReport.totalUsers} />
            <KpiRow label="Usuarios activos" value={clientReport.activeUsers} />
            <KpiRow label="Líneas totales" value={clientReport.totalLines} />
            <KpiRow label="Líneas activas" value={clientReport.activeLines} />
            <KpiRow
              label="Dispositivos totales"
              value={clientReport.totalDevices}
            />
          </div>

          <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Líneas activas
          </h3>

          {enrichedActiveLines.length > 0 ? (
            <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
              {enrichedActiveLines.map(
                ({ phoneNumber, userName, department }) => {
                  const label = userName
                    ? `${phoneNumber} · ${userName}${
                        department ? ` (${department})` : ""
                      }`
                    : `${phoneNumber} · Sin asignación`;

                  return (
                    <div
                      key={phoneNumber}
                      className="inline-flex items-center justify-between gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs text-sky-900 shadow-sm dark:bg-sky-500/10 dark:text-sky-100"
                    >
                      <span className="truncate">{label}</span>
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No hay líneas activas registradas.
            </p>
          )}
        </AnimatedCard>

        {/* Salud de dispositivos */}
        <AnimatedCard delay={0.04}>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Salud de dispositivos
          </h2>

          <div className="mb-3 flex flex-wrap gap-2">
            <KpiBadge label="Total" value={deviceReport.totalDevices} />
            <KpiBadge
              label="Asignados"
              value={deviceReport.assignedDevices}
              color="success"
            />
            <KpiBadge
              label="Almacén"
              value={deviceReport.storageDevices}
              color="warning"
            />
            <KpiBadge
              label="Reparación"
              value={deviceReport.repairDevices}
              color="warning"
            />
            <KpiBadge
              label="Perdidos"
              value={deviceReport.lostDevices}
              color="error"
            />
            <KpiBadge
              label="Baja"
              value={deviceReport.decommissionedDevices}
              color="error"
            />
          </div>

          <div className="h-64">
            {deviceChartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deviceChartData}
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
                  <Bar
                    dataKey="value"
                    fill="#0ea5e9"
                    radius={[6, 6, 0, 0]}
                  />
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

        {/* Uso de líneas */}
        <AnimatedCard delay={0.06}>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Uso de líneas
          </h2>

          <div className="mb-3 flex flex-wrap gap-2">
            <KpiBadge label="Total" value={lineReport.totalLines} />
            <KpiBadge
              label="Activas"
              value={lineReport.activeLines}
              color="success"
            />
            <KpiBadge
              label="Suspendidas"
              value={lineReport.suspendedLines}
              color="warning"
            />
            <KpiBadge
              label="Desactivadas"
              value={lineReport.deactivatedLines}
              color="default"
            />
            <KpiBadge
              label="Sin asignar"
              value={lineReport.unassignedLines}
              color="info"
            />
          </div>

          <div className="h-64">
            {linePieData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={linePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ value }) => value}
                    labelLine={false}
                  >
                    {linePieData.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.color}
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
      </div>

      {/* TENDENCIAS DE CRECIMIENTO */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Tendencias de crecimiento
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <GrowthChartCard
            title="Crecimiento de usuarios"
            color="#0ea5e9"
            points={userGrowth}
            dateFormatter={dateFormatter}
          />
          <GrowthChartCard
            title="Crecimiento de líneas"
            color="#f97316"
            points={lineGrowth}
            dateFormatter={dateFormatter}
          />
          <GrowthChartCard
            title="Crecimiento de dispositivos"
            color="#22c55e"
            points={deviceGrowth}
            dateFormatter={dateFormatter}
            options={{ minYAxisMax: 15 }}
          />
        </div>
      </section>
    </div>
  );
};

export default ClientReportsPage;
