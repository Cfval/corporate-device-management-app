import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getClients } from "../../api/clients";
import {
  getClientReport,
  getDeviceHealthReport,
  getLineUsageReport,
  getSystemReport,
} from "../../api/reports";
import { getLinesByClient } from "../../api/lines";
import { getUsersByClient } from "../../api/users";
import type { Client } from "../../types/Client";
import type {
  ClientReport,
  DeviceHealthReport,
  LineUsageReport,
  SystemReport,
} from "../../types/Reports";
import type { Line } from "../../types/Line";
import type { User } from "../../types/User";

const PIE_COLORS = ["#1976d2", "#26a69a", "#ffb74d", "#ef5350", "#7e57c2", "#26c6da"];

const AdminReportsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | "">("");

  const [clientReport, setClientReport] = useState<ClientReport | null>(null);
  const [deviceReport, setDeviceReport] = useState<DeviceHealthReport | null>(null);
  const [lineReport, setLineReport] = useState<LineUsageReport | null>(null);
  const [systemReport, setSystemReport] = useState<SystemReport | null>(null);
  const [clientLines, setClientLines] = useState<Line[]>([]);
  const [clientUsers, setClientUsers] = useState<User[]>([]);

  const [loadingClients, setLoadingClients] = useState<boolean>(true);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSystem = async () => {
      try {
        const data = await getSystemReport();
        setSystemReport(data.report);
      } catch (err) {
        console.error(err);
      }
    };

    loadSystem();
  }, []);

  useEffect(() => {
    const loadClients = async () => {
      setLoadingClients(true);
      setError(null);
      try {
        const data = await getClients();
        const sorted = [...data.clientsList].sort((a, b) =>
          a.companyName.localeCompare(b.companyName)
        );
        setClients(sorted);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la lista de clientes.");
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  useEffect(() => {
    if (!selectedClientId) {
      setClientReport(null);
      setDeviceReport(null);
      setLineReport(null);
      setClientLines([]);
      setClientUsers([]);
      return;
    }

    let isMounted = true;
    const loadReports = async () => {
      setLoadingReports(true);
      setError(null);

      try {
        const [clientRes, deviceRes, lineRes, linesData, usersData] = await Promise.all([
          getClientReport(selectedClientId),
          getDeviceHealthReport(selectedClientId),
          getLineUsageReport(selectedClientId),
          getLinesByClient(selectedClientId),
          getUsersByClient(selectedClientId),
        ]);

        if (!isMounted) return;
        setClientReport(clientRes.report);
        setDeviceReport(deviceRes.report);
        setLineReport(lineRes.report);
        setClientLines(linesData.lines);
        setClientUsers(usersData.users);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Error al cargar los reportes del cliente.");
          setClientReport(null);
          setDeviceReport(null);
          setLineReport(null);
          setClientLines([]);
          setClientUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoadingReports(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, [selectedClientId]);

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
    return Object.entries(lineReport.linesByOperator).map(([operator, value], index) => ({
      name: operator,
      value,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }));
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
    return clientReport.activeLineNumbers.map((phoneNumber) => {
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

  if (loadingClients) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Reportes</h1>
        <p className="text-sm text-slate-500">
          {systemReport
            ? `Última generación del reporte global: ${formatReportDate(systemReport.generatedAt)}`
            : "Cargando información del sistema..."}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Reporte global del sistema
            </h2>
            <p className="text-sm text-slate-500">
              Resumen consolidado de clientes, usuarios, dispositivos y líneas.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard title="Total Clientes" value={systemReport?.totalClients ?? "-"} />
          <SummaryCard title="Total Usuarios" value={systemReport?.totalUsers ?? "-"} />
          <SummaryCard title="Total Dispositivos" value={systemReport?.totalDevices ?? "-"} />
          <SummaryCard title="Total Líneas" value={systemReport?.totalLines ?? "-"} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Reportes por cliente
          </h3>
          <p className="text-sm text-slate-500">
            Selecciona un cliente para ver métricas detalladas de dispositivos, líneas y usuarios.
          </p>
        </div>

        <div className="max-w-sm">
          <TextField
            select
            label="Selecciona un cliente"
            fullWidth
            size="small"
            value={selectedClientId}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedClientId(value === "" ? "" : Number(value));
            }}
            disabled={loadingClients}
          >
            <MenuItem value="">
              <em>Selecciona un cliente</em>
            </MenuItem>
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.companyName}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!selectedClientId && (
          <p className="text-sm text-slate-500">
            Selecciona un cliente para visualizar sus reportes.
          </p>
        )}
      </div>

      {selectedClientId && loadingReports && (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200">
          <CircularProgress />
        </div>
      )}

      {selectedClientId && !loadingReports && clientReport && deviceReport && lineReport && (
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard
            title="Reporte general"
            description="Usuarios, líneas y dispositivos asociados al cliente."
          >
            <div className="space-y-2">
              <KpiRow label="Usuarios totales" value={clientReport.totalUsers} />
              <KpiRow label="Usuarios activos" value={clientReport.activeUsers} />
              <KpiRow label="Líneas totales" value={clientReport.totalLines} />
              <KpiRow label="Líneas activas" value={clientReport.activeLines} />
              <KpiRow label="Dispositivos totales" value={clientReport.totalDevices} />
            </div>

            <Divider className="my-3" />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Líneas activas</p>
              {enrichedActiveLines.length > 0 ? (
                <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
                  {enrichedActiveLines.map(({ phoneNumber, userName, department }) => {
                    const label = userName
                      ? `${phoneNumber} · ${userName}${department ? ` (${department})` : ""}`
                      : `${phoneNumber} · Sin asignación`;

                    return <Chip key={phoneNumber} label={label} color="primary" />;
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No hay líneas activas registradas.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Salud de dispositivos"
            description="Estado actual del parque tecnológico."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <KpiBadge label="Total" value={deviceReport.totalDevices} color="success" />
              <KpiBadge label="Asignados" value={deviceReport.assignedDevices} color="success" />
              <KpiBadge label="Almacén" value={deviceReport.storageDevices} color="warning" />
              <KpiBadge label="Reparación" value={deviceReport.repairDevices} color="warning" />
              <KpiBadge label="Perdidos" value={deviceReport.lostDevices} color="error" />
              <KpiBadge label="Baja" value={deviceReport.decommissionedDevices} color="error" />
            </div>

            <div className="h-64">
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
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Uso de líneas"
            description="Estados operativos y distribución por operador."
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <KpiBadge label="Total" value={lineReport.totalLines} color="success" />
              <KpiBadge label="Activas" value={lineReport.activeLines} color="success" />
              <KpiBadge label="Suspendidas" value={lineReport.suspendedLines} color="warning" />
              <KpiBadge label="Desactivadas" value={lineReport.deactivatedLines} color="default" />
              <KpiBadge label="Sin asignar" value={lineReport.unassignedLines} color="info" />
            </div>

            <div className="h-64">
              {linePieData.length > 0 ? (
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
                      formatter={(value: string) => `${value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500">No hay datos de operadores disponibles.</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
};

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const SectionCard = ({ title, description, children }: SectionCardProps) => (
  <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
    <Divider className="my-2" />
    <div className="space-y-4">{children}</div>
  </div>
);

interface KpiRowProps {
  label: string;
  value: number;
}

const KpiRow = ({ label, value }: KpiRowProps) => (
  <div className="flex items-baseline gap-2 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-slate-900 dark:text-white">
      {value.toLocaleString("es-ES")}
    </span>
  </div>
);

type BadgeColor = "primary" | "success" | "warning" | "default" | "info" | "error";

interface KpiBadgeProps {
  label: string;
  value: number;
  color?: BadgeColor;
}

const BADGE_STYLES: Record<BadgeColor, string> = {
  primary: "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200",
  default: "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100",
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-200",
  error: "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200",
};

const KpiBadge = ({ label, value, color = "primary" }: KpiBadgeProps) => (
  <div className={`rounded-lg border px-3 py-2 text-sm ${BADGE_STYLES[color]}`}>
    <span className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </span>
    <p className="text-xl font-semibold text-slate-900 dark:text-white">{value}</p>
  </div>
);

interface SummaryCardProps {
  title: string;
  value: number | string;
}

const SummaryCard = ({ title, value }: SummaryCardProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
    <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
  </div>
);

const formatReportDate = (dateString?: string) => {
  if (!dateString) return "-";
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);

  if (isDateOnly) {
    const date = new Date(`${dateString}T00:00:00Z`);
    return date.toLocaleDateString("es-ES", {
      dateStyle: "long",
      timeZone: "Europe/Madrid",
    });
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("es-ES", {
    dateStyle: "full",
    timeStyle: "short",
    hour12: false,
    timeZone: "Europe/Madrid",
  });
};

export default AdminReportsPage;