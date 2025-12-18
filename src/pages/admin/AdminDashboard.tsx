import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
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
import { motion } from "framer-motion";

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

const cardPaperSx = {
  bgcolor: "background.paper",
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: 1,
  p: 3,
} as const;

const ClientLineTooltip = ({ active, payload }: ClientTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload as ClientLinePoint;

  return (
    <Paper elevation={0} sx={{ ...cardPaperSx, color: "text.primary" }}>
      <Typography variant="subtitle2" fontWeight={600}>
        {data.name}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.85 }}>
        {data.lines} líneas
      </Typography>
    </Paper>
  );
};

const buildIndexTicks = (count: number): number[] => {
  if (count <= 0) return [];

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

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [systemReport, setSystemReport] = useState<SystemReport | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineActivityData, setLineActivityData] = useState<ClientLinePoint[]>([]);

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
        setError("Error al cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className="py-6">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  const indexTicks = buildIndexTicks(lineActivityData.length);

  const totalClients = systemReport?.totalClients ?? 0;
  const totalUsers = systemReport?.totalUsers ?? 0;
  const totalDevices = systemReport?.totalDevices ?? 0;
  const totalLines = systemReport?.totalLines ?? 0;

  return (
    <Container maxWidth="xl" className="py-6 md:py-8 space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-2"
      >
        <Typography
          variant="h4"
          className="font-bold tracking-tight text-slate-900 dark:text-slate-50"
        >
          Panel administrativo — Vista general
        </Typography>
        <Typography
          variant="body2"
          className="text-slate-500 dark:text-slate-400 max-w-2xl"
        >
          Resumen global del sistema: clientes, usuarios, dispositivos y líneas
          gestionadas en la plataforma.
        </Typography>
      </motion.div>

      {/* KPIs */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.2, delay: 0.03 }}
        className="grid gap-4 md:gap-5 md:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard label="Clientes totales" value={totalClients} accent="from-sky-400/70 to-sky-500/80" />
        <KpiCard label="Usuarios totales" value={totalUsers} accent="from-indigo-400/70 to-indigo-500/80" />
        <KpiCard label="Dispositivos totales" value={totalDevices} accent="from-emerald-400/70 to-emerald-500/80" />
        <KpiCard label="Líneas totales" value={totalLines} accent="from-amber-400/70 to-amber-500/80" />
      </motion.div>

      {/* Tabla + Gráfico */}
      <div className="flex flex-col gap-6">
        {/* Últimos clientes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <Typography variant="subtitle1" className="font-semibold text-slate-900 dark:text-slate-50">
                Últimos clientes registrados
              </Typography>
              <Typography variant="body2" className="text-slate-500 dark:text-slate-400">
                Los 5 clientes más recientes del sistema.
              </Typography>
            </div>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate("/admin/clients")}
            >
              Ver todos
            </Button>
          </div>

          {clients.length > 0 ? (
            <TableContainer component="div" className="bg-white dark:bg-slate-900 rounded-lg">
              <Table size="small" className="text-slate-700 dark:text-slate-200">
                <TableHead className="bg-slate-50 dark:bg-slate-900">
                  <TableRow>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      <strong>ID</strong>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      <strong>Nombre</strong>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      <strong>Email</strong>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      <strong>Teléfono</strong>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      <strong>Estado</strong>
                    </TableCell>
                    <TableCell align="right" className="text-slate-700 dark:text-slate-300">
                      <strong>Acciones</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="bg-white dark:bg-slate-900">
                  {clients.map((client) => (
                    <TableRow
                      key={client.id}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "rgba(148, 163, 184, 0.08)",
                        },
                      }}
                      onClick={() => navigate(`/admin/clients/${client.id}`)}
                    >
                      <TableCell className="text-slate-700 dark:text-slate-200">{client.id}</TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-200">{client.companyName}</TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 220,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={client.email}
                      >
                        <span className="text-slate-700 dark:text-slate-200">{client.email}</span>
                      </TableCell>
                      <TableCell className="text-slate-700 dark:text-slate-200">{client.phoneNumber}</TableCell>
                      <TableCell>
                        <ClientStatusChip status={client.status} />
                      </TableCell>
                      <TableCell
                        align="right"
                        onClick={(e) => e.stopPropagation()}
                      >
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
            <div className="py-6 text-center text-sm text-slate-500">
              No hay clientes registrados.
            </div>
          )}
        </div>

        {/* Gráfico líneas por cliente */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-4">
          <div className="mb-3">
            <Typography variant="subtitle1" className="font-semibold text-slate-900 dark:text-slate-50">
              Líneas por cliente
            </Typography>
            <Typography variant="body2" className="text-slate-500 dark:text-slate-400">
              Distribución del número total de líneas por cliente.
            </Typography>
          </div>

          {lineActivityData.length > 0 ? (
            <div className="h-[260px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 24, bottom: 12, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="index"
                    name="Cliente"
                    tickFormatter={(value) => `#${value}`}
                    ticks={indexTicks}
                    domain={["dataMin", "dataMax"]}
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5f5" }}
                  />
                  <YAxis
                    type="number"
                    dataKey="lines"
                    name="Líneas"
                    allowDecimals={false}
                    domain={[0, "auto"]}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={{ stroke: "#cbd5f5" }}
                  />
                  <RechartsTooltip content={<ClientLineTooltip />} />
                  <Scatter
                    data={lineActivityData}
                    fill="#fb923c"
                    line={{ stroke: "rgba(249,115,22,0.5)", strokeWidth: 2 }}
                    lineJointType="linear"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-slate-500">
              No hay datos de líneas para mostrar.
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

interface KpiCardProps {
  label: string;
  value: number;
  accent: string; // tailwind gradient utilities
}

const KpiCard = ({ label, value, accent }: KpiCardProps) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-lg shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30"
  >
    <div
      className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-60`}
    />
    <div className="relative flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-50">
        {value.toLocaleString("es-ES")}
      </span>
    </div>
  </motion.div>
);

export default AdminDashboard;

