import { useEffect, useMemo, useState } from "react";
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
import type { Line } from "../../../types/Line";
import type { User } from "../../../types/User";

export type GrowthPoint = { x: Date; y: number };

export interface EnrichedActiveLine {
  phoneNumber: string;
  userName: string | null;
  department: string | null;
}

const MONTHS_PER_YEAR = 12;

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

export const diffInMonths = (start: Date, end: Date): number => {
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  return years * MONTHS_PER_YEAR + months;
};

export const useReportsLogic = () => {
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

  const [userGrowth, setUserGrowth] = useState<GrowthPoint[]>([]);
  const [deviceGrowth, setDeviceGrowth] = useState<GrowthPoint[]>([]);
  const [lineGrowth, setLineGrowth] = useState<GrowthPoint[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      setError("No se ha encontrado el cliente actual.");
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

  const enrichedActiveLines: EnrichedActiveLine[] = useMemo(() => {
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

  const lineOperatorsData = useMemo(() => {
    if (!lineReport) return [];
    return Object.entries(lineReport.linesByOperator ?? {}).map(
      ([operator, value]) => ({
        name: operator,
        value,
      }),
    );
  }, [lineReport]);

  return {
    clientId,
    loading,
    error,
    clientReport,
    deviceReport,
    lineReport,
    enrichedActiveLines,
    deviceChartData,
    lineOperatorsData,
    userGrowth,
    deviceGrowth,
    lineGrowth,
    dateFormatter,
  };
};
