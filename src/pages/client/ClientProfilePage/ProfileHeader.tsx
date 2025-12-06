import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import { translate } from "../../../utils/translate";

interface Props {
  companyName: string;
  status: string;
}

export const ProfileHeader: FC<Props> = ({ companyName, status }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {companyName}
        </h1>

        <div
          className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
          }`}
        >
          {translate("client", status)}
        </div>
      </div>

      <button
        onClick={() => navigate("/client/profile/edit")}
        className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
      >
        Editar cliente
      </button>
    </div>
  );
};
