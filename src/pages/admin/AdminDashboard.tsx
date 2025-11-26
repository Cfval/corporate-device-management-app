import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Card,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
} from "@mui/material";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { getSystemReport, getLineUsageReport } from "../../api/reports";
import { getClients } from "../../api/clients";
import type { SystemReport } from "../../types/Reports";
import type { Client } from "../../types/Client";
import { ClientStatusChip } from "../../components/ui/ClientStatusChip";

interface ClientLinePoint {
  id: number;
  name: string;
  lines: number;
  index: number;
}

interface ClientTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ClientLinePoint }>;
}

const ClientLineTooltip = ({ active, payload }: ClientTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload as ClientLinePoint;

  return (
    <Paper elevation={3} sx={{ p: 1 }}>
      <Typography variant="subtitle2" fontWeight={600}>
        {data.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {data.lines} líneas
      </Typography>
    </Paper>
  );
};

const buildIndexTicks = (count: number): number[] => {
  if (count <= 0) {
    return [];
  }

  if (count <= 5) {
    return Array.from({ length: count }, (_, idx) => idx + 1);
  }

  const ticks: number[] = [1];

  for (let index = 5; index <= count; index += 5) {
    ticks.push(index);
  }

  if (ticks[ticks.length - 1] !== count) {
    ticks.push(count);
  }

  return ticks;
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [systemReport, setSystemReport] = useState<SystemReport | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineActivityData, setLineActivityData] = useState<ClientLinePoint[]>(
    [],
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [reportData, clientsData] = await Promise.all([
          getSystemReport(),
          getClients(),
        ]);

        setSystemReport(reportData.report);
        // Ordenar por ID descendente y coger los primeros 5
        const sortedClients = [...clientsData.clientsList]
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);
        setClients(sortedClients);

        if (clientsData.clientsList.length > 0) {
          const lineStats = await Promise.all(
            clientsData.clientsList.map(async (client) => {
              try {
                const response = await getLineUsageReport(client.id);
                return {
                  id: client.id,
                  name: client.companyName,
                  lines: response.report.totalLines,
                };
              } catch (clientError) {
                console.error(
                  `Error al cargar líneas del cliente ${client.id}`,
                  clientError,
                );
                return {
                  id: client.id,
                  name: client.companyName,
                  lines: 0,
                };
              }
            }),
          );

          const sortedLineStats = lineStats
            .sort((a, b) => a.lines - b.lines)
            .map((item, index) => ({
              ...item,
              index: index + 1,
            }));

          setLineActivityData(sortedLineStats);
        } else {
          setLineActivityData([]);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  const indexTicks = buildIndexTicks(lineActivityData.length);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Título */}
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Panel Administrativo – Vista General
      </Typography>

      {/* KPIs Globales */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={3}
        sx={{ mb: 4 }}
      >
        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" }}>
          <Card elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Clientes
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {systemReport?.totalClients ?? 0}
            </Typography>
          </Card>
        </Box>

        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" }}>
          <Card elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Usuarios
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {systemReport?.totalUsers ?? 0}
            </Typography>
          </Card>
        </Box>

        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" }}>
          <Card elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Dispositivos
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {systemReport?.totalDevices ?? 0}
            </Typography>
          </Card>
        </Box>

        <Box flex={{ xs: "1 1 100%", sm: "1 1 calc(50% - 12px)", md: "1 1 calc(25% - 18px)" }}>
          <Card elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total Líneas
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {systemReport?.totalLines ?? 0}
            </Typography>
          </Card>
        </Box>
      </Box>

      {/* Últimos clientes registrados */}
      <Box sx={{ mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Últimos clientes registrados
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate("/admin/clients")}
              >
                Ver todos
              </Button>
            </Box>
            {clients.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Teléfono</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell align="right"><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id} hover>
                        <TableCell>{client.id}</TableCell>
                        <TableCell>{client.companyName}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={client.email}
                        >
                          {client.email}
                        </TableCell>
                        <TableCell>{client.phoneNumber}</TableCell>
                        <TableCell>
                          <ClientStatusChip status={client.status} />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => navigate(`/admin/clients/${client.id}`)}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                No hay clientes registrados
              </Typography>
            )}
          </Paper>
      </Box>

      {/* Total de líneas por cliente */}
      <Box>
        <Card elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Líneas por cliente
          </Typography>
          {lineActivityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  type="number"
                  dataKey="index"
                  name="Cliente"
                  tickFormatter={(value) => `#${value}`}
                  ticks={indexTicks}
                  domain={["dataMin", "dataMax"]}
                  allowDecimals={false}
                  minTickGap={8}
                />
                <YAxis
                  type="number"
                  dataKey="lines"
                  name="Líneas"
                  allowDecimals={false}
                  domain={[0, "auto"]}
                />
                <RechartsTooltip content={<ClientLineTooltip />} />
                <Scatter
                  data={lineActivityData}
                  fill="#ff7043"
                  line={{ stroke: "rgba(255, 112, 67, 0.5)", strokeWidth: 2 }}
                  lineJointType="linear"
                />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay datos de líneas para mostrar.
            </Typography>
          )}
        </Card>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
