import type { FC, ChangeEvent } from "react";
import type { Device } from "../../../../types/Device";
import DevicesTableHeader from "./DevicesTableHeader";
import DevicesTableRow from "./DevicesTableRow";

interface DevicesTableProps {
  devices: Device[];
  filteredDevices: Device[];
  selectionMode: boolean;
  selectedIds: number[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (deviceId: number) => (event: ChangeEvent<HTMLInputElement>) => void;
  onEditDevice: (device: Device) => void;
  onViewDevice: (device: Device) => void;
  tableColumnCount: number;
}

const DevicesTable: FC<DevicesTableProps> = ({
  devices,
  filteredDevices,
  selectionMode,
  selectedIds,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectOne,
  onEditDevice,
  onViewDevice,
  tableColumnCount,
}) => {
  const hasDevices = devices.length > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <table className="w-full border-collapse text-slate-700 dark:text-slate-200">
        <DevicesTableHeader
          selectionMode={selectionMode}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onSelectAll={onSelectAll}
        />

        <tbody>
          {filteredDevices.map((device) => {
            const isSelected = selectedIds.includes(device.id);

            return (
              <DevicesTableRow
                key={device.id}
                device={device}
                selectionMode={selectionMode}
                selected={isSelected}
                onSelectChange={onSelectOne(device.id)}
                onEdit={() => onEditDevice(device)}
                onViewDetails={() => onViewDevice(device)}
              />
            );
          })}

          {filteredDevices.length === 0 && (
            <tr>
              <td
                colSpan={tableColumnCount}
                className="py-8 text-center text-sm text-slate-500 dark:text-slate-400"
              >
                {hasDevices
                  ? "No se encontraron dispositivos con el criterio actual."
                  : "No hay dispositivos registrados."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DevicesTable;
