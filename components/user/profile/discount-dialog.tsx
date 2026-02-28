"use client";

import { useState } from "react";
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControlLabel, Slider, TextField, Typography,
} from "@mui/material";

interface DiscountDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { code: string; value: number; applyToTotem: boolean }) => void;
  freePercentage: number;
}

export default function DiscountDialog({ open, onClose, onAdd, freePercentage }: DiscountDialogProps) {
  const [sliderValue, setSliderValue] = useState(100);
  const [applyToTotem, setApplyToTotem] = useState(false);

  const handleClose = () => { onClose(); setSliderValue(100); setApplyToTotem(false); };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const json = Object.fromEntries(formData.entries());
    onAdd({
      code: json.code as string,
      value: Math.floor((sliderValue * freePercentage) / 100),
      applyToTotem,
    });
    handleClose();
  };

  const formatValue = (value: number) => `${Math.floor((value * freePercentage) / 100)}%`;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm"
      slotProps={{ paper: { component: "form" as const, onSubmit: handleSubmit } as Record<string, unknown> }}>
      <DialogTitle align="center" className="fw-bold">Crea Codice Promozionale</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField required fullWidth name="code" label="Codice Promozione" variant="outlined" slotProps={{ htmlInput: { maxLength: 15 } }} />
        </Box>
        <Box sx={{ mt: 4, px: 1 }}>
          <Typography gutterBottom align="center">Percentuale di Sconto</Typography>
          <Slider color="secondary" value={sliderValue} onChange={(_, v) => setSliderValue(v as number)} valueLabelFormat={formatValue} step={100 / freePercentage} valueLabelDisplay="auto" marks={[{ value: 0, label: "0%" }, { value: 100, label: `${freePercentage}%` }]} sx={{ width: "90%", margin: "0 auto" }} />
        </Box>
        <Box sx={{ mt: 3 }}>
          <FormControlLabel control={<Checkbox checked={applyToTotem} onChange={(e) => setApplyToTotem(e.target.checked)} color="secondary" />} label="Applica automaticamente ai prodotti in totem" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={handleClose}>Annulla</Button>
        <Button type="submit" variant="contained" color="secondary">Crea</Button>
      </DialogActions>
    </Dialog>
  );
}
