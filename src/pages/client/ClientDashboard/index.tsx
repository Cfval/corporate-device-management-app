import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../../../context/AuthContext";
import {
  getClientReport,
  getDeviceHealthReport,
  getLineUsageReport,
} from "../../../api/reports";
import { getUsersByClient } from "../../../api/users";
import { getDevicesByClient } from "../../../api/devices";
import { getLinesByClient } from "../../../api/lines";
import type {
  ClientReport,
  DeviceHealthReport,
  LineUsageReport,
} from "../../../types/Reports";
import type { User } from "../../../types/User";
import type { Device } from "../../../types/Device";
import type { Line } from "../../../types/Line";

import Header from "./Header";
import StatsCards from "./StatsCards";
import RecentUsers from "./RecentUsers";
import RecentLines from "./RecentLines";
import RecentDevices from "./RecentDevices";
import Alerts from "./Alerts";
import DevicePieChart from "./DevicePieChart";

const toTimestamp = (value?: string | null) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const clientId = user?.clientId ? Number(user.clientId) : undefined;

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

  if (!clientId) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-red-600">
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

  if (error || !clientReport || !deviceReport || !lineReport) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-red-600">
          {error ?? "No se han podido cargar los datos del panel de control."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Hero / cabecera */}
      <Header clientReport={clientReport} lineReport={lineReport} />

      {/* KPIs + últimos usuarios */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <StatsCards
          clientReport={clientReport}
          deviceReport={deviceReport}
          lineReport={lineReport}
        />
        <RecentUsers users={recentUsers} />
      </div>

      {/* Últimas líneas + últimos dispositivos */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <RecentLines lines={recentLines} />
        <RecentDevices devices={recentDevices} />
      </div>

      {/* Alertas + pie chart */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <Alerts deviceReport={deviceReport} lineReport={lineReport} />
        <DevicePieChart deviceReport={deviceReport} />
      </div>
    </div>
  );
};

export default ClientDashboard;
