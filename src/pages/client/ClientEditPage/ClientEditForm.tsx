import type { FC } from "react";
import type { UpdateClientPayload } from "../../../api/model/UpdateClientPayload";
import { TextField, MenuItem, Button } from "@mui/material";
import { translate } from "../../../utils/translate";

interface Props {
  form: UpdateClientPayload;
  setForm: (fn: (prev: UpdateClientPayload) => UpdateClientPayload) => void;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  registrationDate: string;
}

export const ClientEditForm: FC<Props> = ({
  form,
  setForm,
  saving,
  onSubmit,
  onCancel,
  registrationDate,
}) => {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      
      <TextField
        label="Nombre de la empresa"
        name="companyName"
        value={form.companyName}
        onChange={handleInput}
        fullWidth
      />

      <TextField label="CIF" name="cif" value={form.cif} fullWidth disabled />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleInput}
        fullWidth
      />

      <TextField
        label="Teléfono"
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={handleInput}
        fullWidth
      />

      <TextField
        label="Dirección"
        name="address"
        value={form.address}
        onChange={handleInput}
        fullWidth
        multiline
        minRows={2}
      />

      <TextField
        select
        label="Estado"
        name="status"
        value={form.status}
        onChange={handleInput}
        fullWidth
      >
        <MenuItem value="ACTIVE">{translate("client", "ACTIVE")}</MenuItem>
        <MenuItem value="INACTIVE">{translate("client", "INACTIVE")}</MenuItem>
      </TextField>

      <TextField
        label="Fecha de registro"
        value={registrationDate}
        fullWidth
        disabled
      />

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outlined" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
};
