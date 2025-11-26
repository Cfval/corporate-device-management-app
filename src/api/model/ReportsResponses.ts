import type {
  ClientReport,
  DeviceHealthReport,
  LineUsageReport,
  SystemReport,
} from "../../types/Reports";

export interface SystemReportResponse {
  report: SystemReport;
}

export interface ClientReportResponse {
  report: ClientReport;
}

export interface DeviceHealthReportResponse {
  report: DeviceHealthReport;
}

export interface LineUsageReportResponse {
  report: LineUsageReport;
}

