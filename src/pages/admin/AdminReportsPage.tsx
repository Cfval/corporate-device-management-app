import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Card,
  CardContent,
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Reportes
      </Typography>

      <Card elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Reporte Global del Sistema
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {systemReport
            ? `Fecha del reporte: ${formatReportDate(systemReport.generatedAt)}`
            : "Cargando información del sistema..."}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={3}>
          <SummaryCard title="Total Clientes" value={systemReport?.totalClients ?? "-"} />
          <SummaryCard title="Total Usuarios" value={systemReport?.totalUsers ?? "-"} />
          <SummaryCard title="Total Dispositivos" value={systemReport?.totalDevices ?? "-"} />
          <SummaryCard title="Total Líneas" value={systemReport?.totalLines ?? "-"} />
        </Box>
      </Card>

      <Box sx={{ maxWidth: 360, mb: 4 }}>
        <TextField
          select
          label="Selecciona un cliente"
          fullWidth
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
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {!selectedClientId && (
        <Typography color="text.secondary">
          Selecciona un cliente para visualizar sus reportes.
        </Typography>
      )}

      {selectedClientId && loadingReports && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      )}

      {selectedClientId && !loadingReports && clientReport && deviceReport && lineReport && (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }}
          gap={3}
        >
          {/* Reporte General */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reporte General
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
                        ? `${phoneNumber} · ${userName}${
                            department ? ` (${department})` : ""
                          }`
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

          {/* Reporte de Dispositivos */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Salud de Dispositivos
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
              </Box>
            </CardContent>
          </Card>

          {/* Reporte de Líneas */}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Uso de Líneas
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
                          formatter={(value: string) =>
                            `${value}`
                          }
                        />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" color="text.secondary">
                      No hay datos de operadores disponibles.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
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

interface SummaryCardProps {
  title: string;
  value: number | string;
}

const SummaryCard = ({ title, value }: SummaryCardProps) => (
  <Card
    elevation={1}
    sx={{
      flex: "1 1 220px",
      p: 2,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "grey.200",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
      {value}
    </Typography>
  </Card>
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