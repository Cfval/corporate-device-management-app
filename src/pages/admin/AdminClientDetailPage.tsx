import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Divider,
  Button,
} from "@mui/material";
import {
  getClientById,
} from "../../api/clients";
import {
  getUsersByClient,
} from "../../api/users";
import {
  getDevicesByClient,
} from "../../api/devices";
import {
  getLinesByClient,
} from "../../api/lines";
import {
  getClientReport,
  getDeviceHealthReport,
  getLineUsageReport,
} from "../../api/reports";
import type { Client } from "../../types/Client";
import type { User } from "../../types/User";
import type { Device } from "../../types/Device";
import type { Line } from "../../types/Line";
import type {
  ClientReport,
  DeviceHealthReport,
  LineUsageReport,
} from "../../types/Reports";
import { ClientStatusChip } from "../../components/ui/ClientStatusChip";
import { UserStatusChip } from "../../components/ui/UserStatusChip";
import { UserRoleChip } from "../../components/ui/UserRoleChip";
import { DeviceStatusChip } from "../../components/ui/DeviceStatusChip";
import { LineStatusChip } from "../../components/ui/LineStatusChip";
import { OperatorChip } from "../../components/ui/OperatorChip";
import { translate } from "../../utils/translate";

const AdminClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clientId = id ? Number(id) : undefined;

  const [client, setClient] = useState<Client | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [clientReport, setClientReport] = useState<ClientReport | null>(null);
  const [deviceReport, setDeviceReport] = useState<DeviceHealthReport | null>(null);
  const [lineReport, setLineReport] = useState<LineUsageReport | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setError("ID de cliente no válido");
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          clientData,
          usersData,
          devicesData,
          linesData,
          clientReportData,
          deviceReportData,
          lineReportData,
        ] = await Promise.all([
          getClientById(clientId),
          getUsersByClient(clientId),
          getDevicesByClient(clientId),
          getLinesByClient(clientId),
          getClientReport(clientId),
          getDeviceHealthReport(clientId),
          getLineUsageReport(clientId),
        ]);

        setClient(clientData.client);
        setUsers([...usersData.users].sort((a, b) => a.id - b.id));
        setDevices([...devicesData.devices].sort((a, b) => a.id - b.id));
        setLines([...linesData.lines].sort((a, b) => a.id - b.id));
        setClientReport(clientReportData.report);
        setDeviceReport(deviceReportData.report);
        setLineReport(lineReportData.report);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos del cliente");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [clientId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !client) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" color="error">
          {error || "Cliente no encontrado"}
        </Typography>
      </Container>
    );
  }

  // Datos resumidos (máximo 5 elementos)
  const topUsers = users.slice(0, 5);
  const topDevices = devices.slice(0, 5);
  const topLines = lines.slice(0, 5);

  return (
    <Container sx={{ py: 4 }}>
      {/* Datos del Cliente */}
      <Card elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">
            {client.companyName}
          </Typography>
          <ClientStatusChip status={client.status} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
          <Box flex={1}>
            <Typography><strong>CIF:</strong> {client.cif}</Typography>
            <Typography><strong>Email:</strong> {client.email}</Typography>
            <Typography><strong>Teléfono:</strong> {client.phoneNumber}</Typography>
          </Box>
          <Box flex={1}>
            <Typography><strong>Dirección:</strong> {client.address}</Typography>
            <Typography>
              <strong>Fecha de registro:</strong>{" "}
              {new Date(client.registrationDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Reportes */}
      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3} sx={{ mb: 10 }}>
        {/* Reporte General */}
        <Box flex={1}>
          <Card elevation={3} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Reporte General
            </Typography>
            <Divider sx={{ my: 2 }} />
            {clientReport ? (
              <Box>
                <Typography><strong>Total usuarios:</strong> {clientReport.totalUsers}</Typography>
                <Typography><strong>Activos:</strong> {clientReport.activeUsers}</Typography>
                <Typography><strong>Total líneas:</strong> {clientReport.totalLines}</Typography>
                <Typography><strong>Activas:</strong> {clientReport.activeLines}</Typography>
                <Typography><strong>Total dispositivos:</strong> {clientReport.totalDevices}</Typography>
              </Box>
            ) : (
              <Typography color="error">Error al cargar el reporte</Typography>
            )}
          </Card>
        </Box>

        {/* Estado del Parque de Dispositivos */}
        <Box flex={1}>
          <Card elevation={3} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Estado de Dispositivos
            </Typography>
            <Divider sx={{ my: 2 }} />
            {deviceReport ? (
              <Box>
                <Typography><strong>Total:</strong> {deviceReport.totalDevices}</Typography>
                <Typography><strong>Asignados:</strong> {deviceReport.assignedDevices}</Typography>
                <Typography><strong>En almacén:</strong> {deviceReport.storageDevices}</Typography>
                <Typography><strong>En reparación:</strong> {deviceReport.repairDevices}</Typography>
                <Typography><strong>Perdidos:</strong> {deviceReport.lostDevices}</Typography>
                <Typography><strong>Dados de baja:</strong> {deviceReport.decommissionedDevices}</Typography>
              </Box>
            ) : (
              <Typography color="error">Error al cargar el reporte</Typography>
            )}
          </Card>
        </Box>

        {/* Uso de Líneas */}
        <Box flex={1}>
          <Card elevation={3} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Uso de Líneas
            </Typography>
            <Divider sx={{ my: 2 }} />
            {lineReport ? (
              <Box>
                <Typography><strong>Total:</strong> {lineReport.totalLines}</Typography>
                <Typography><strong>Activas:</strong> {lineReport.activeLines}</Typography>
                <Typography><strong>Suspendidas:</strong> {lineReport.suspendedLines}</Typography>
                <Typography><strong>Desactivadas:</strong> {lineReport.deactivatedLines}</Typography>
                <Typography><strong>Sin asignar:</strong> {lineReport.unassignedLines}</Typography>
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    <strong>Operadores:</strong>
                  </Typography>
                  {Object.entries(lineReport.linesByOperator).map(([operator, count]) => (
                    <Typography key={operator}>
                      {operator}: {count}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography color="error">Error al cargar el reporte</Typography>
            )}
          </Card>
        </Box>
      </Box>

      {/* Listas Resumidas */}
      <Box display="flex" flexDirection="column" gap={3} sx={{ mt: 2 }}>
        {/* Tabla de Usuarios */}
        <Box>
          <Card elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Usuarios</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/admin/clients/${clientId}/users`)}
                disabled={users.length === 0}
              >
                Ver todos ({users.length})
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {topUsers.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Rol</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 120,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={user.email}
                        >
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <UserStatusChip status={user.status} />
                        </TableCell>
                        <TableCell>
                          <UserRoleChip role={user.role} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay usuarios registrados
              </Typography>
            )}
          </Card>
        </Box>

        {/* Tabla de Dispositivos */}
        <Box>
          <Card elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Dispositivos</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/admin/clients/${clientId}/devices`)}
                disabled={devices.length === 0}
              >
                Ver todos ({devices.length})
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {topDevices.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Tipo</strong></TableCell>
                      <TableCell><strong>Marca</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Empleado</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topDevices.map((device) => (
                      <TableRow key={device.id} hover>
                        <TableCell>{device.id}</TableCell>
                        <TableCell>{translate("type", device.type ?? "")}</TableCell>
                        <TableCell>{device.brand}</TableCell>
                        <TableCell>
                          <DeviceStatusChip status={device.status} />
                        </TableCell>
                        <TableCell>{device.employeeId ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay dispositivos registrados
              </Typography>
            )}
          </Card>
        </Box>

        {/* Tabla de Líneas */}
        <Box>
          <Card elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Líneas</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/admin/clients/${clientId}/lines`)}
                disabled={lines.length === 0}
              >
                Ver todas ({lines.length})
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {topLines.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>ID</strong></TableCell>
                      <TableCell><strong>Número</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Operador</strong></TableCell>
                      <TableCell><strong>Empleado</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topLines.map((line) => (
                      <TableRow key={line.id} hover>
                        <TableCell>{line.id}</TableCell>
                        <TableCell>{line.phoneNumber}</TableCell>
                        <TableCell>
                          <LineStatusChip status={line.status} />
                        </TableCell>
                        <TableCell>
                          <OperatorChip operator={line.operator} />
                        </TableCell>
                        <TableCell>{line.employeeId ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No hay líneas registradas
              </Typography>
            )}
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminClientDetailPage;
