import { Card, CardContent } from "@mui/material";
import type { DeviceHealthReport } from "../../../types/Reports";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DevicePieChartProps {
  deviceReport: DeviceHealthReport;
}

const DevicePieChart = ({ deviceReport }: DevicePieChartProps) => {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));

    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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

  const pieOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            boxWidth: 16,
            color: isDark ? "#e2e8f0" : "#0f172a", // slate-200 : slate-900
          },
        },
      },
      maintainAspectRatio: false,
    }),
    [isDark],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
    >
      <Card className="h-full rounded-3xl border border-slate-200/70 !bg-white shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:!bg-slate-900">
        <CardContent className="p-5 sm:p-6">
          <h2 className="mb-3 text-center text-sm font-semibold text-slate-900 dark:text-slate-50">
            Distribución de dispositivos
          </h2>
          <div className="h-56">
            <Pie data={devicePieData} options={pieOptions} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DevicePieChart;
