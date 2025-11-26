import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from "@mui/material";
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
} from "recharts";
import { LineChart } from "@mui/x-charts/LineChart";
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
const PIE_COLORS = ["#1976d2", "#26a69a", "#ffb74d", "#ef5350", "#7e57c2", "#26c6da"];

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
  return Math.max(
    Y_AXIS_STEP,
    Math.ceil(lastValue / Y_AXIS_STEP) * Y_AXIS_STEP,
  );
};

type GrowthChartOptions = {
  minYAxisMax?: number;
};

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
          buildGrowthSeries(usersResponse.users, (user) => user.registrationDate),
        );
        setDeviceGrowth(
          buildGrowthSeries(devicesResponse.devices, (device) => device.activationDate),
        );
        setLineGrowth(
          buildGrowthSeries(linesResponse.lines, (line) => line.activationDate),
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
        line && line.employeeId != null ? userById.get(line.employeeId) : undefined;
      return {
        phoneNumber,
        userName: user?.fullName ?? null,
        department: user?.department ?? null,
      };
    });
  }, [clientReport, lineByPhone, userById]);

  if (!clientId) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          No se ha encontrado el cliente actual.
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!clientReport || !deviceReport || !lineReport) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h6" color="error">
          No se pudieron cargar los reportes. Inténtalo de nuevo más tarde.
        </Typography>
      </Container>
    );
  }

  const renderGrowthChart = (
    title: string,
    points: GrowthPoint[],
    color: string,
    options?: GrowthChartOptions,
  ) => (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        {points.length ? (
          (() => {
            const firstX = points[0]?.x;
            if (!firstX) {
              return (
                <Typography variant="body2" color="text.secondary">
                  No hay datos suficientes para mostrar esta tendencia.
                </Typography>
              );
            }

            // Insert point at (firstDate, 0) to force axis intersection
            const dataset = [{ x: firstX, y: 0 }, ...points];
            const requestedMinMax = options?.minYAxisMax
              ? Math.max(
                  Y_AXIS_STEP,
                  Math.ceil(options.minYAxisMax / Y_AXIS_STEP) * Y_AXIS_STEP,
                )
              : Y_AXIS_STEP;
            const yMax = Math.max(requestedMinMax, computeYAxisMax(points));
            const tickNumber = yMax / Y_AXIS_STEP + 1;
            const lastX = dataset[dataset.length - 1]?.x ?? firstX;
            const monthsBetween = diffInMonths(firstX, lastX);
            const yearTickNumber = monthsBetween > 0
              ? Math.max(2, Math.floor(monthsBetween / MONTHS_PER_YEAR) + 1)
              : 2;

            return (
              <LineChart
                height={260}
                dataset={dataset}
                xAxis={[
                  {
                    scaleType: "time",
                    dataKey: "x",
                    valueFormatter: (value) =>
                      dateFormatter.format(
                        value instanceof Date ? value : new Date(value as number),
                      ),
                    min: firstX,
                    tickNumber: yearTickNumber,
                  },
                ]}
                yAxis={[
                  {
                    min: 0,
                    max: yMax,
                    tickMinStep: Y_AXIS_STEP,
                    tickNumber,
                  },
                ]}
                series={[
                  {
                    dataKey: "y",
                    color,
                    showMark: false,
                    area: false,
                    label: title,
                    curve: "linear",
                  },
                ]}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
              />
            );
          })()
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay datos suficientes para mostrar esta tendencia.
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        {`Reportes - ${clientReport.clientName}`}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          mb: 6,
        }}
      >
        {/* Reporte General */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Reporte general
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexDirection="column" gap={2}>
              <KpiRow label="Usuarios totales" value={clientReport.totalUsers} />
              <KpiRow label="Usuarios activos" value={clientReport.activeUsers} />
              <KpiRow label="Líneas totales" value={clientReport.totalLines} />
              <KpiRow label="Líneas activas" value={clientReport.activeLines} />
              <KpiRow label="Dispositivos totales" value={clientReport.totalDevices} />
            </Box>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Líneas activas
            </Typography>
            {enrichedActiveLines.length > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  maxHeight: 220,
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                {enrichedActiveLines.map(({ phoneNumber, userName, department }) => {
                  const label = userName
                    ? `${phoneNumber} · ${userName}${department ? ` (${department})` : ""}`
                    : `${phoneNumber} · Sin asignación`;
                  return <Chip key={phoneNumber} label={label} color="primary" />;
                })}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay líneas activas registradas.
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Salud de dispositivos */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Salud de dispositivos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexWrap="wrap" gap={2}>
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
            </Box>

            <Box sx={{ height: 260, mt: 2 }}>
              {deviceChartData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deviceChartData}
                    margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                    barCategoryGap="25%"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No hay datos suficientes para mostrar el gráfico.
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Uso de líneas */}
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Uso de líneas
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box display="flex" flexWrap="wrap" gap={2}>
              <KpiBadge label="Total" value={lineReport.totalLines} />
              <KpiBadge label="Activas" value={lineReport.activeLines} color="success" />
              <KpiBadge label="Suspendidas" value={lineReport.suspendedLines} color="warning" />
              <KpiBadge label="Desactivadas" value={lineReport.deactivatedLines} color="default" />
              <KpiBadge label="Sin asignar" value={lineReport.unassignedLines} color="info" />
            </Box>

            <Box sx={{ height: 260, mt: 2 }}>
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
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      formatter={(value: string) =>
                        `${value}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No hay datos de operadores disponibles.
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tendencias */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Tendencias de crecimiento
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {renderGrowthChart(
            "Crecimiento de usuarios",
            userGrowth,
            "#1976d2",
          )}
          {renderGrowthChart(
            "Crecimiento de líneas",
            lineGrowth,
            "#ff9800",
          )}
          {renderGrowthChart(
            "Crecimiento de dispositivos",
            deviceGrowth,
            "#2e7d32",
            { minYAxisMax: 15 },
          )}
        </Box>
      </Box>
    </Container>
  );
};

interface KpiRowProps {
  label: string;
  value: number;
}

const KpiRow = ({ label, value }: KpiRowProps) => (
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </Box>
);

type BadgeColor = "primary" | "success" | "warning" | "default" | "info" | "error";

interface KpiBadgeProps {
  label: string;
  value: number;
  color?: BadgeColor;
}

const KpiBadge = ({ label, value, color = "primary" }: KpiBadgeProps) => (
  <Box
    sx={{
      minWidth: 110,
      px: 2,
      py: 1.2,
      borderRadius: 2,
      backgroundColor: color === "default" ? "grey.100" : `${color}.light`,
      border: "1px solid",
      borderColor: color === "default" ? "grey.300" : `${color}.main`,
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </Box>
);

export default ClientReportsPage;

