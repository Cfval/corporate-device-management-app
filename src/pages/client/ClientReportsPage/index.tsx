import { useReportsLogic } from "./useReportsLogic";
import { AnimatedCard } from "./layout/AnimatedCard";
import { KpiRow } from "./components/KpiRow";
import { ActiveLinesList } from "./components/ActiveLinesList";
import { DeviceHealthBar } from "./charts/DeviceHealthBar";
import { LineOperatorsPie } from "./charts/LineOperatorsPie";
import { GrowthLineChart } from "./charts/GrowthLineChart";

const ClientReportsPage = () => {
  const {
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
  } = useReportsLogic();

  if (!clientId) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          No se ha encontrado el cliente actual.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      </div>
    );
  }

  if (!clientReport || !deviceReport || !lineReport) {
    return (
      <div className="p-6">
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          No se pudieron cargar los reportes. Inténtalo de nuevo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Reportes — {clientReport.clientName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Visión general del estado de usuarios, dispositivos y líneas del
          cliente.
        </p>
      </header>

      {/* GRID PRINCIPAL: KPIs + GRÁFICOS */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Reporte general */}
        <AnimatedCard delay={0.02}>
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
            Reporte general
          </h2>

          <div className="space-y-2">
            <KpiRow label="Usuarios totales" value={clientReport.totalUsers} />
            <KpiRow label="Usuarios activos" value={clientReport.activeUsers} />
            <KpiRow label="Líneas totales" value={clientReport.totalLines} />
            <KpiRow label="Líneas activas" value={clientReport.activeLines} />
            <KpiRow
              label="Dispositivos totales"
              value={clientReport.totalDevices}
            />
          </div>

          <div className="my-4 h-px bg-slate-200 dark:bg-slate-700" />

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Líneas activas
          </h3>

          <ActiveLinesList lines={enrichedActiveLines} />
        </AnimatedCard>

        {/* Salud de dispositivos */}
        <DeviceHealthBar report={deviceReport} data={deviceChartData} />

        {/* Uso de líneas */}
        <LineOperatorsPie report={lineReport} data={lineOperatorsData} />
      </div>

      {/* TENDENCIAS DE CRECIMIENTO */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Tendencias de crecimiento
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <GrowthLineChart
            title="Crecimiento de usuarios"
            color="#0ea5e9"
            points={userGrowth}
            dateFormatter={dateFormatter}
          />
          <GrowthLineChart
            title="Crecimiento de líneas"
            color="#f97316"
            points={lineGrowth}
            dateFormatter={dateFormatter}
          />
          <GrowthLineChart
            title="Crecimiento de dispositivos"
            color="#22c55e"
            points={deviceGrowth}
            dateFormatter={dateFormatter}
            minYAxisMax={15}
          />
        </div>
      </section>
    </div>
  );
};

export default ClientReportsPage;
