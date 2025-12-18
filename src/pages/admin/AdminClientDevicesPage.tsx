import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "react-router-dom";

import { getDevicesByClient } from "../../api/devices";
import type { Device } from "../../types/Device";

import { DeviceStatusChip } from "../../components/ui/DeviceStatusChip";
import { DeviceDetailsModal } from "../../components/devices/DeviceDetailsModal";
import { translate } from "../../utils/translate";

import { Eye, Search } from "lucide-react";

import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const AdminClientDevicesPage = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = id ? Number(id) : undefined;

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openDetails = (device: Device) => {
    setSelectedDevice(device);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setSelectedDevice(null);
    setModalOpen(false);
  };

  useEffect(() => {
    if (!clientId) return;

    const load = async () => {
      setLoading(true);

      try {
        const res = await getDevicesByClient(clientId);
        setDevices([...res.devices].sort((a, b) => a.id - b.id));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [clientId]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredDevices = devices.filter((d) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;

    return (
      d.id.toString().includes(term) ||
      d.type.toLowerCase().includes(term) ||
      (d.brand ?? "").toLowerCase().includes(term) ||
      (d.model ?? "").toLowerCase().includes(term) ||
      d.status.toLowerCase().includes(term) ||
      (d.employeeId?.toString() ?? "").includes(term) ||
      (d.lineId?.toString() ?? "").includes(term)
    );
  });

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </Box>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="px-6 py-6 max-w-screen-xl mx-auto">
        <Typography variant="h6" className="text-center mt-8">
          No hay dispositivos registrados.
        </Typography>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-screen-xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <Typography variant="h4" className="font-bold text-slate-900 dark:text-slate-50">
          Dispositivos del Cliente
        </Typography>

        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar dispositivos"
            aria-label="Buscar dispositivos"
            className="w-72 max-w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-900/40"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full border-collapse text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr className="text-left text-sm text-slate-600 dark:text-slate-300">
              <th className="px-3 py-3 font-semibold">ID</th>
              <th className="px-3 py-3 font-semibold">Tipo</th>
              <th className="px-3 py-3 font-semibold">Marca</th>
              <th className="px-3 py-3 font-semibold">Modelo</th>
              <th className="px-3 py-3 font-semibold">Estado</th>
              <th className="px-3 py-3 font-semibold">Empleado</th>
              <th className="px-3 py-3 font-semibold">Línea</th>
              <th className="px-3 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredDevices.map((d) => (
              <tr
                key={d.id}
                className="text-sm transition hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700"
              >
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{d.id}</td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">
                  {translate("type", d.type ?? "")}
                </td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{d.brand}</td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{d.model}</td>
                <td className="px-3 py-3">
                  <DeviceStatusChip status={d.status} />
                </td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{d.employeeId ?? "—"}</td>
                <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{d.lineId ?? "—"}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => openDetails(d)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/50 transition"
                      aria-label="Ver detalles del dispositivo"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredDevices.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No se han encontrado dispositivos con ese criterio de búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <DeviceDetailsModal
        open={modalOpen}
        device={selectedDevice}
        onClose={closeDetails}
      />
    </div>
  );
};

export default AdminClientDevicesPage;

