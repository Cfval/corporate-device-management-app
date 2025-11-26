import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Button,
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
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
import type { User } from "../../types/User";
import type { Device } from "../../types/Device";
import type { Line } from "../../types/Line";
import { UserStatusChip } from "../../components/ui/UserStatusChip";
import { LineStatusChip } from "../../components/ui/LineStatusChip";
import { OperatorChip } from "../../components/ui/OperatorChip";
import { DeviceStatusChip } from "../../components/ui/DeviceStatusChip";
import { translate } from "../../utils/translate";

ChartJS.register(ArcElement, Tooltip, Legend);

const toTimestamp = (value?: string | null) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const clientId = user?.clientId ? Number(user.clientId) : undefined;
  const navigate = useNavigate();

  const [clientReport, setClientReport] = useState<ClientReport | null>(null);
  const [deviceReport, setDeviceReport] = useState<DeviceHealthReport | null>(
    null,
  );
  const [lineReport, setLineReport] = useState<LineUsageReport | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentLines, setRecentLines] = useState<Line[]>([]);
  const [recentDevices, setRecentDevices] = useState<Device[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      setError("No se ha encontrado el cliente actual.");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          clientRes,
          deviceRes,
          lineRes,
          usersRes,
          devicesRes,
          linesRes,
        ] = await Promise.all([
          getClientReport(clientId),
          getDeviceHealthReport(clientId),
          getLineUsageReport(clientId),
          getUsersByClient(clientId),
          getDevicesByClient(clientId),
          getLinesByClient(clientId),
        ]);

        setClientReport(clientRes.report);
        setDeviceReport(deviceRes.report);
        setLineReport(lineRes.report);

        setRecentUsers(
          [...usersRes.users]
            .sort(
              (a, b) =>
                toTimestamp(b.registrationDate) -
                toTimestamp(a.registrationDate),
            )
            .slice(0, 5),
        );

        setRecentLines(
          [...linesRes.lines]
            .sort(
              (a, b) =>
                toTimestamp(b.activationDate) - toTimestamp(a.activationDate),
            )
            .slice(0, 5),
        );

        setRecentDevices(
          [...devicesRes.devices]
            .sort(
              (a, b) =>
                toTimestamp(b.activationDate) - toTimestamp(a.activationDate),
            )
            .slice(0, 5),
        );
      } catch (err) {
        console.error(err);
        setError("Error cargando datos del panel de control.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId]);

  const devicePieData = useMemo(() => {
    if (!deviceReport) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: [
        "Asignados",
        "En almacén",
        "En reparación",
        "Perdidos",
        "De baja",
      ],
      datasets: [
        {
          data: [
            deviceReport.assignedDevices,
            deviceReport.storageDevices,
            deviceReport.repairDevices,
            deviceReport.lostDevices,
            deviceReport.decommissionedDevices,
          ],
          backgroundColor: [
            "#22c55e",
            "#3b82f6",
            "#eab308",
            "#f97316",
            "#9ca3af",
          ],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    };
  }, [deviceReport]);

  const pieOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { boxWidth: 16, color: "#0f172a" },
      },
    },
    maintainAspectRatio: false,
  };

  if (!clientId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          No se ha encontrado el cliente actual.
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !clientReport || !deviceReport || !lineReport) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          {error ?? "No se han podido cargar los datos del panel de control."}
        </Typography>
      </Box>
    );
  }

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

  const renderListWrapper = (
    title: string,
    route: string,
    content: React.ReactNode,
  ) => (
    <Card sx={{ borderRadius: 4, height: "100%" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Button size="small" onClick={() => navigate(route)}>
            Ver todo
          </Button>
        </Box>
        {content}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Card
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          bgcolor: "rgba(191, 219, 254, 0.6)",
          border: "1px solid",
          borderColor: "primary.light",
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -40,
            left: -20,
            width: "130%",
            height: 160,
            background:
              "radial-gradient(circle at 10% 60%, rgba(96,165,250,0.4), transparent 65%)",
          },
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: ".4em", color: "primary.dark" }}
          >
            Panel del cliente
          </Typography>
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary.dark"
            sx={{ mb: 1 }}
          >
            Panel de Control — {clientReport.clientName}
          </Typography>
          <Typography variant="body2" color="primary.dark" sx={{ mb: 3 }}>
            Resumen general de tu empresa
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <Chip
              label={`Usuarios activos: ${clientReport.activeUsers}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Líneas activas: ${lineReport.activeLines}`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 3,
        }}
      >
        <Box>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Indicadores principales
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {kpiStats.map((stat, index) => (
                  <Box
                    key={stat.label}
                    sx={{
                      py: 2.5,
                      borderTop: index === 0 ? "none" : "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ letterSpacing: ".3em", color: "text.secondary" }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography variant="h3" fontWeight={700}>
                      {stat.total.toLocaleString("es-ES")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.detail}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          {renderListWrapper(
            "Últimos usuarios",
            "/client/users",
            recentUsers.length ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentUsers.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "grey.100",
                      p: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {user.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                      <UserStatusChip status={user.status} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Departamento: {user.department || "Sin especificar"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay usuarios recientes para mostrar.
              </Typography>
            ),
          )}
        </Box>

        <Box>
          {renderListWrapper(
            "Últimas líneas",
            "/client/lines",
            recentLines.length ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentLines.map((line) => (
                  <Box
                    key={line.id}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "grey.100",
                      p: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {line.phoneNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Empleado:{" "}
                          {line.employeeId ? `#${line.employeeId}` : "Sin asignar"}
                        </Typography>
                      </Box>
                      <LineStatusChip status={line.status} />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.75rem",
                        color: "text.secondary",
                      }}
                    >
                      <span>Tarifa: {line.tariffType}</span>
                      <OperatorChip operator={line.operator} />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay líneas recientes para mostrar.
              </Typography>
            ),
          )}
        </Box>

        <Box>
          {renderListWrapper(
            "Últimos dispositivos",
            "/client/devices",
            recentDevices.length ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentDevices.map((device) => (
                  <Box
                    key={device.id}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "grey.100",
                      p: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {device.brand} {device.model}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tipo: {translate("type", device.type ?? "")}
                        </Typography>
                      </Box>
                      <DeviceStatusChip status={device.status} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Empleado:{" "}
                      {device.employeeId ? `#${device.employeeId}` : "Sin asignar"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay dispositivos recientes para mostrar.
              </Typography>
            ),
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 3,
        }}
      >
        <Box>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  ⚠ Atención requerida
                </Typography>
                <Chip
                  label={
                    alertChips.length ? "Incidencias activas" : "Sin incidencias"
                  }
                  color={alertChips.length ? "warning" : "default"}
                  variant={alertChips.length ? "filled" : "outlined"}
                />
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {alertChips.length ? (
                  alertChips.map((chip) => (
                    <Chip
                      key={chip.label}
                      label={chip.label}
                      color={chip.color}
                      variant="outlined"
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Todo está en orden. No se registran incidencias.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                align="center"
                sx={{ mb: 2 }}
              >
                Distribución de dispositivos
              </Typography>
              <Box sx={{ height: 220 }}>
                <Pie data={devicePieData} options={pieOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default ClientDashboard;
