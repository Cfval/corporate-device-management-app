import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Button,
  Divider,
  Typography,
} from "@mui/material";

import { getClientById } from "../../api/clients";
import { getUsersByClient } from "../../api/users";
import { getDevicesByClient } from "../../api/devices";
import { getLinesByClient } from "../../api/lines";

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

      try {
        const [
          cData,
          uData,
          dData,
          lData,
          r1,
          r2,
          r3,
        ] = await Promise.all([
          getClientById(clientId),
          getUsersByClient(clientId),
          getDevicesByClient(clientId),
          getLinesByClient(clientId),
          getClientReport(clientId),
          getDeviceHealthReport(clientId),
          getLineUsageReport(clientId),
        ]);

        setClient(cData.client);
        setUsers([...uData.users].sort((a, b) => a.id - b.id));
        setDevices([...dData.devices].sort((a, b) => a.id - b.id));
        setLines([...lData.lines].sort((a, b) => a.id - b.id));

        setClientReport(r1.report);
        setDeviceReport(r2.report);
        setLineReport(r3.report);
      } catch {
        setError("Error al cargar los datos del cliente");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6">
        <Typography variant="h5" color="error">
          {error || "Cliente no encontrado"}
        </Typography>
      </div>
    );
  }

  const topUsers = users.slice(0, 5);
  const topDevices = devices.slice(0, 5);
  const topLines = lines.slice(0, 5);

  return (
    <div className="space-y-8 px-4 py-6 md:px-6 lg:px-5 max-w-6xl mx-auto w-full text-slate-800 dark:text-slate-100">
      {/* INFO CLIENTE */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{client.companyName}</h1>
          <ClientStatusChip status={client.status} />
        </div>

        <Divider className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">CIF:</strong> {client.cif}</p>
            <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Email:</strong> {client.email}</p>
            <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Teléfono:</strong> {client.phoneNumber}</p>
          </div>

          <div>
            <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Dirección:</strong> {client.address}</p>
            <p className="text-slate-700 dark:text-slate-200">
              <strong className="text-slate-800 dark:text-slate-100">Fecha registro:</strong>{" "}
              {new Date(client.registrationDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* REPORTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GENERAL */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
          <h2 className="font-semibold text-lg mb-3 text-slate-900 dark:text-slate-50">Reporte General</h2>
          <Divider className="my-3" />

          {clientReport ? (
            <div className="space-y-1">
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Total usuarios:</strong> {clientReport.totalUsers}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Activos:</strong> {clientReport.activeUsers}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Total líneas:</strong> {clientReport.totalLines}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Activas:</strong> {clientReport.activeLines}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Total dispositivos:</strong> {clientReport.totalDevices}</p>
            </div>
          ) : (
            <p className="text-red-600 dark:text-red-400">Error al cargar</p>
          )}
        </div>

        {/* DISPOSITIVOS */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
          <h2 className="font-semibold text-lg mb-3 text-slate-900 dark:text-slate-50">Estado de Dispositivos</h2>
          <Divider className="my-3" />

          {deviceReport ? (
            <div className="space-y-1">
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Total:</strong> {deviceReport.totalDevices}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Asignados:</strong> {deviceReport.assignedDevices}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Almacén:</strong> {deviceReport.storageDevices}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Reparación:</strong> {deviceReport.repairDevices}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Perdidos:</strong> {deviceReport.lostDevices}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Baja:</strong> {deviceReport.decommissionedDevices}</p>
            </div>
          ) : (
            <p className="text-red-600 dark:text-red-400">Error al cargar</p>
          )}
        </div>

        {/* LÍNEAS */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
          <h2 className="font-semibold text-lg mb-3 text-slate-900 dark:text-slate-50">Uso de Líneas</h2>
          <Divider className="my-3" />

          {lineReport ? (
            <div className="space-y-1">
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Total:</strong> {lineReport.totalLines}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Activas:</strong> {lineReport.activeLines}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Suspendidas:</strong> {lineReport.suspendedLines}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Desactivadas:</strong> {lineReport.deactivatedLines}</p>
              <p className="text-slate-700 dark:text-slate-200"><strong className="text-slate-800 dark:text-slate-100">Sin asignar:</strong> {lineReport.unassignedLines}</p>

              <div className="mt-2">
                <strong className="text-slate-800 dark:text-slate-100">Operadores:</strong>
                {Object.entries(lineReport.linesByOperator).map(([op, count]) => (
                  <p key={op} className="text-slate-700 dark:text-slate-200">{op}: {count}</p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-red-600 dark:text-red-400">Error al cargar</p>
          )}
        </div>
      </div>

      {/* USUARIOS */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Usuarios</h2>
          <Button variant="outlined" size="small"
            onClick={() => navigate(`/admin/clients/${clientId}/users`)}
            disabled={users.length === 0}
          >
            Ver todos ({users.length})
          </Button>
        </div>

        <Divider className="my-3" />

        {topUsers.length > 0 ? (
          <TableContainer className="bg-white dark:bg-slate-800 rounded-lg">
            <Table size="small" className="text-slate-700 dark:text-slate-200">
              <TableHead className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableCell className="text-slate-700 dark:text-slate-300">ID</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Nombre</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Email</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Estado</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Rol</TableCell>
                </TableRow>
              </TableHead>

              <TableBody className="bg-white dark:bg-slate-800">
                {topUsers.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell className="text-slate-700 dark:text-slate-200">{u.id}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-200">{u.fullName}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-200">{u.email}</TableCell>
                    <TableCell><UserStatusChip status={u.status} /></TableCell>
                    <TableCell><UserRoleChip role={u.role} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p className="text-slate-500 dark:text-slate-300">No hay usuarios registrados</p>
        )}
      </div>

      {/* DISPOSITIVOS */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Dispositivos</h2>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/admin/clients/${clientId}/devices`)}
            disabled={devices.length === 0}
          >
            Ver todos ({devices.length})
          </Button>
        </div>

        <Divider className="my-3" />

        {topDevices.length > 0 ? (
          <TableContainer className="bg-white dark:bg-slate-800 rounded-lg">
            <Table size="small" className="text-slate-700 dark:text-slate-200">
              <TableHead className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableCell className="text-slate-700 dark:text-slate-300">ID</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Tipo</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Marca</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Estado</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Empleado</TableCell>
                </TableRow>
              </TableHead>

              <TableBody className="bg-white dark:bg-slate-800">
                {topDevices.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell className="text-slate-700 dark:text-slate-200">{d.id}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-200">{translate("type", d.type ?? "")}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-200">{d.brand}</TableCell>
                    <TableCell><DeviceStatusChip status={d.status} /></TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-200">{d.employeeId ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p className="text-slate-500 dark:text-slate-300">No hay dispositivos registrados</p>
        )}
      </div>

      {/* LÍNEAS */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Líneas</h2>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/admin/clients/${clientId}/lines`)}
            disabled={lines.length === 0}
          >
            Ver todas ({lines.length})
          </Button>
        </div>

        <Divider className="my-3" />

        {topLines.length > 0 ? (
          <TableContainer className="bg-white dark:bg-slate-800 rounded-lg">
            <Table size="small" className="text-slate-700 dark:text-slate-200">
              <TableHead className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableCell className="text-slate-700 dark:text-slate-300">ID</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Número</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Estado</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Operador</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">Empleado</TableCell>
                </TableRow>
              </TableHead>

              <TableBody className="bg-white dark:bg-slate-800">
                {topLines.map((line) => (
                  <TableRow key={line.id} hover>
                    <TableCell className="text-slate-700 dark:text-slate-200">{line.id}</TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-200">{line.phoneNumber}</TableCell>
                    <TableCell><LineStatusChip status={line.status} /></TableCell>
                    <TableCell><OperatorChip operator={line.operator} /></TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-200">{line.employeeId ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <p className="text-slate-500 dark:text-slate-300">No hay líneas registradas</p>
        )}
      </div>

    </div>
  );
};

export default AdminClientDetailPage;
