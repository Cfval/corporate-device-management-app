import type { FC } from "react";
import type { Client } from "../../../types/Client";

export const ProfileInfo: FC<{ client: Client }> = ({ client }) => {
  const rows = [
    { label: "CIF", value: client.cif },
    { label: "Email", value: client.email },
    { label: "Teléfono", value: client.phoneNumber },
    { label: "Dirección", value: client.address },
    {
      label: "Fecha de registro",
      value: new Date(client.registrationDate).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-3 text-sm">
      {rows.map(({ label, value }) => (
        <div key={label} className="flex flex-col">
          <span className="text-slate-500 dark:text-slate-400">{label}</span>
          <span className="font-medium text-slate-900 dark:text-slate-50">
            {value || "—"}
          </span>
        </div>
      ))}
    </div>
  );
};
