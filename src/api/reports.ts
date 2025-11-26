import { api } from "./http";
import type {
  SystemReportResponse,
  ClientReportResponse,
  DeviceHealthReportResponse,
  LineUsageReportResponse,
} from "./model/ReportsResponses";

export const getSystemReport = async () => {
  const res = await api.get<SystemReportResponse>("/reports/system");
  return res.data;
};

export const getClientReport = async (clientId: number) => {
  const res = await api.get<ClientReportResponse>(`/reports/client/${clientId}`);
  return res.data;
};

export const getDeviceHealthReport = async (clientId: number) => {
  const res = await api.get<DeviceHealthReportResponse>(
    `/reports/client/${clientId}/devices`
  );
  return res.data;
};

export const getLineUsageReport = async (clientId: number) => {
  const res = await api.get<LineUsageReportResponse>(
    `/reports/client/${clientId}/lines`
  );
  return res.data;
};
