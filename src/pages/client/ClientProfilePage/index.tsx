import { useClientProfile } from "./useClientProfile";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileInfo } from "./ProfileInfo";
import { motion } from "framer-motion";

const ClientProfilePage = () => {
  const { client, loading } = useClientProfile();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center text-sm text-rose-600 dark:text-rose-400">
        No se encontró información del cliente.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <ProfileHeader companyName={client.companyName} status={client.status} />

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-50">
          Información detallada
        </h2>

        <ProfileInfo client={client} />
      </motion.div>
    </div>
  );
};

export default ClientProfilePage;
