import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useClientEdit } from "./useClientEdit";
import { ClientEditForm } from "./ClientEditForm";
import { Notification } from "../../../components/ui/Notification";
import { updateClient } from "../../../api/clients";

const ClientEditPage = () => {
  const navigate = useNavigate();

  const {
    clientId,
    client,
    form,
    setForm,
    loading,
    saving,
    setSaving,
    extractDbErrorMessage,
  } = useClientEdit();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const showMessage = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    if (!clientId) return;

    setSaving(true);
    try {
      await updateClient(clientId, form);
      showMessage("Cliente actualizado correctamente", "success");

      setTimeout(() => {
        navigate("/client/profile");
      }, 1200);
    } catch (err: any) {
      console.error(err);
      const raw =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al actualizar el cliente";
      showMessage(extractDbErrorMessage(raw), "error");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
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
    <div className="p-6 text-slate-800 dark:text-slate-100">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-50">
        Editar datos de la empresa
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <ClientEditForm
          form={form}
          setForm={setForm}
          saving={saving}
          registrationDate={new Date(
            client.registrationDate,
          ).toLocaleDateString()}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/client/profile")}
        />
      </motion.div>

      <Notification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default ClientEditPage;
