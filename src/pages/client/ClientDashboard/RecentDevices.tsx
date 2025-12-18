import { Card, CardContent, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Device } from "../../../types/Device";
import { DeviceStatusChip } from "../../../components/ui/DeviceStatusChip";
import { translate } from "../../../utils/translate";
import { motion } from "framer-motion";

interface RecentDevicesProps {
  devices: Device[];
}

const RecentDevices = ({ devices }: RecentDevicesProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      <Card className="h-full rounded-3xl border border-slate-200/70 !bg-white shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:!bg-slate-900">
        <CardContent className="flex h-full flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Últimos dispositivos
            </h2>
            <Button
              size="small"
              onClick={() => navigate("/client/devices")}
              className="normal-case"
            >
              Ver todo
            </Button>
          </div>

          {devices.length ? (
            <div className="flex flex-col gap-2.5">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-sm shadow-sm dark:border-slate-700/80 dark:bg-slate-800/70"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                        {device.brand} {device.model}
                      </p>
                      <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                        Tipo: {translate("type", device.type ?? "")}
                      </p>
                    </div>
                    <DeviceStatusChip status={device.status} />
                  </div>
                  <p className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                    Empleado:{" "}
                    {device.employeeId ? `#${device.employeeId}` : "Sin asignar"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No hay dispositivos recientes para mostrar.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentDevices;
