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
  const textFieldSx = {
    "& .MuiOutlinedInput-root": {
      color: "inherit",
      backgroundColor: "transparent",
    },
    "& .MuiOutlinedInput-input": { color: "inherit" },
    "& .MuiSelect-select": { color: "inherit" },
    "& .MuiInputLabel-root": { color: "rgba(100,116,139,1)" }, // slate-500
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(148,163,184,0.55)", // slate-400/55
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(148,163,184,0.85)", // slate-400/85
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(56,189,248,0.9)", // sky-400
    },
    "& .MuiSvgIcon-root": { color: "currentColor" },

    // Dark mode (Tailwind class on <html>)
    "html.dark & .MuiOutlinedInput-root": {
      color: "rgba(241,245,249,1)", // slate-100
    },
    "html.dark & .MuiInputLabel-root": { color: "rgba(203,213,225,1)" }, // slate-300
    "html.dark & .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(51,65,85,1)", // slate-700
    },
    "html.dark &:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(71,85,105,1)", // slate-600
    },
    "html.dark & .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(56,189,248,0.9)", // sky-400
    },
    // Disabled fields: keep readable in dark mode (MUI uses WebkitTextFillColor)
    "html.dark & .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "rgba(241,245,249,0.75)", // slate-100/75
    },
  } as const;

  const disabledMutedTextFieldSx = {
    ...textFieldSx,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(148,163,184,0.35)", // slate-400/35
    },
    "& .MuiInputLabel-root": { color: "rgba(100,116,139,0.75)" }, // slate-500/75
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "rgba(100,116,139,0.70)", // slate-500/70
    },
    "html.dark & .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(51,65,85,0.65)", // slate-700/65
    },
    "html.dark & .MuiInputLabel-root": { color: "rgba(148,163,184,0.8)" }, // slate-400/80
    "html.dark & .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "rgba(203,213,225,0.65)", // slate-300/65
    },
  } as const;

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
        sx={textFieldSx}
      />

      <TextField
        label="CIF"
        name="cif"
        value={form.cif}
        fullWidth
        disabled
        sx={disabledMutedTextFieldSx}
      />

      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleInput}
        fullWidth
        sx={textFieldSx}
      />

      <TextField
        label="Teléfono"
        name="phoneNumber"
        value={form.phoneNumber}
        onChange={handleInput}
        fullWidth
        sx={textFieldSx}
      />

      <TextField
        label="Dirección"
        name="address"
        value={form.address}
        onChange={handleInput}
        fullWidth
        multiline
        minRows={2}
        sx={textFieldSx}
      />

      <TextField
        select
        label="Estado"
        name="status"
        value={form.status}
        onChange={handleInput}
        fullWidth
        sx={textFieldSx}
      >
        <MenuItem value="ACTIVE">{translate("client", "ACTIVE")}</MenuItem>
        <MenuItem value="INACTIVE">{translate("client", "INACTIVE")}</MenuItem>
      </TextField>

      <TextField
        label="Fecha de registro"
        value={registrationDate}
        fullWidth
        disabled
        sx={disabledMutedTextFieldSx}
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
