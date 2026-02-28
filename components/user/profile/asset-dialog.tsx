"use client";

import { useState } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, Slider, TextField, Typography,
} from "@mui/material";
import { Business, Person } from "@mui/icons-material";
import { showToast } from "@/lib/utils/notifications";

interface AssetDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: Record<string, unknown>) => void;
  freePercentage: number;
  entity?: string | null;
}

export default function AssetDialog({ open, onClose, onAdd, freePercentage, entity = null }: AssetDialogProps) {
  const [step, setStep] = useState(1);
  const [entityType, setEntityType] = useState<string | null>(entity);
  const [sliderValue, setSliderValue] = useState(100);

  const handleReset = () => { setStep(1); setEntityType(null); };
  const handleClose = () => { onClose(); setSliderValue(100); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const json: Record<string, unknown> = Object.fromEntries(formData.entries());
    json.entityType = entityType;
    json.percentage = Math.floor((sliderValue * freePercentage) / 100);
    if (entityType === "individual") json.step = "initial";
    else json.fullAddress = `${json.address}, ${json.city}, ${json.zipCode}`;
    onAdd(json);
    showToast("Dati aggiunti con successo!", "success");
    handleClose();
  };

  const formatValue = (value: number) => `${Math.floor((value * freePercentage) / 100)}%`;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm"
      slotProps={{ transition: { onExited: handleReset }, paper: { component: "form" as const, onSubmit: handleSubmit } as Record<string, unknown> }}>
      <DialogTitle className="font-bold" align="center">
        {step === 1 ? "Seleziona Tipologia" : entityType === "company" ? "Dati Aziendali" : "Dati Personali"}
      </DialogTitle>
      <DialogContent>
        {step === 1 ? (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4, my: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <IconButton onClick={() => { setEntityType("company"); setStep(2); }} sx={{ p: 3, bgcolor: "rgba(0,0,0,0.04)", "&:hover": { bgcolor: "rgba(0,0,0,0.08)" } }}><Business fontSize="large" /></IconButton>
              <Typography variant="body1" sx={{ mt: 1 }}>Azienda</Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <IconButton onClick={() => { setEntityType("individual"); setStep(2); }} sx={{ p: 3, bgcolor: "rgba(0,0,0,0.04)", "&:hover": { bgcolor: "rgba(0,0,0,0.08)" } }}><Person fontSize="large" /></IconButton>
              <Typography variant="body1" sx={{ mt: 1 }}>Persona Fisica</Typography>
            </Box>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }} className="flex justify-center">
            {entityType === "company" ? (
              <>
                <Grid size={12}><TextField required fullWidth name="companyName" label="Nome" variant="outlined" /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField required fullWidth name="vatNumber" label="Partita IVA" variant="outlined" /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField required fullWidth name="fiscalCode" label="Codice Fiscale" variant="outlined" /></Grid>
                <Grid size={12}><TextField required fullWidth name="address" label="Indirizzo Sede Legale" variant="outlined" /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField required fullWidth name="city" label="Città" variant="outlined" /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField required fullWidth name="zipCode" label="CAP" variant="outlined" /></Grid>
                <Grid size={12}><TextField required fullWidth name="iban" label="IBAN" variant="outlined" /></Grid>
              </>
            ) : (
              <>
                <Grid size={12}><TextField required fullWidth name="email" label="Email" variant="outlined" /></Grid>
                  <div className="flex justify-center w-full">
                  <Slider color="secondary" sx={{ width: "85%", mt: 3 }} defaultValue={sliderValue} onChange={(_, v) => setSliderValue(v as number)} valueLabelFormat={formatValue} step={100 / freePercentage} valueLabelDisplay="auto" marks={[{ value: 0, label: "0%" }, { value: 100, label: `${freePercentage}%` }]} />
                </div>
              </>
            )}
          </Grid>
        )}
      </DialogContent>
      {step === 2 && (
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={handleClose}>Cancella</Button>
          <Button variant="contained" color="secondary" type="submit">Aggiungi</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
