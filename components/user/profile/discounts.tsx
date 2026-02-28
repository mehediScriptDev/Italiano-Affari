"use client";

import { Box, Button, Card, CardContent, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Delete } from "@mui/icons-material";
import { showToast } from "@/lib/utils/notifications";
import { useAppContext } from "@/lib/context/app-context";
import { createDiscount, deleteDiscount, fetchDiscounts } from "@/lib/api/partners";
import DiscountDialog from "./discount-dialog";

interface Discount {
  code: string;
  value: number;
  percentage?: number;
}

export default function Discounts() {
  const { profile } = useAppContext();
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [freePercentage, setFreePercentage] = useState(profile?.percentage ?? 0);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchDiscounts().then((res) => {
      const mapped = res.map((d: { code: string; value: number }) => ({ code: d.code, value: d.value }));
      setDiscounts(mapped);
      const used = mapped.reduce((acc: number, c: Discount) => acc + Number(c.value), 0);
      setFreePercentage((profile?.percentage ?? 0) - used);
    });
  }, [profile?.percentage]);

  const handleOpenDialog = () => {
    if (freePercentage > 0) setOpenDialog(true);
    else showToast("Non c'è piu percentuale disponibile!", "error");
  };

  const handleDeleteDiscount = (index: number) => {
    const discount = discounts[index];
    const newDiscounts = discounts.filter((_, i) => i !== index);
    deleteDiscount(discount.code)
      .then(() => {
        setDiscounts(newDiscounts);
        const used = newDiscounts.reduce((acc, c) => acc + Number(c.percentage ?? c.value ?? 0), 0);
        setFreePercentage((profile?.percentage ?? 0) - used);
        showToast("Codice promozionale eliminato con successo!", "success");
      })
      .catch(() => showToast("Errore nella cancellazione del codice promozionale", "error"));
  };

  const handleSubmit = (formData: { code: string; value: number; applyToTotem: boolean }) => {
    createDiscount({ code: formData.code, value: formData.value, type: formData.applyToTotem ? "promotion" : "coupon" })
      .then(() => {
        showToast("Codice promozionale creato con successo!", "success");
        setDiscounts((p) => [...p, formData]);
        setFreePercentage((p) => p - Number(formData.value));
      })
      .catch(() => showToast("Errore nella creazione del codice promozionale, prova a cambiare codice", "error"));
  };

  const renderDiscount = (discount: Discount, index: number) => (
    <div className="mt-1" key={`card-${index}`}>
      <Card style={{ background: "linear-gradient(to right, #2e2e2e 30%, #040404)", minWidth: "320px" }} className="text-white" elevation={10} sx={{ borderRadius: 2 }}>
        <CardContent style={{ padding: "10px 15px" }} className="position-relative">
          <p style={{ fontSize: "12px" }} className="mb-0">Codice</p>
          <p style={{ fontSize: "17px" }} className="mt-0">{discount.code}</p>
          <p style={{ fontSize: "12px" }} className="mb-0 mt-1">Percentuale</p>
          <p className="mt-0">{discount.value}%</p>
          <div className="d-flex justify-end position-absolute top-0 inset-e-0">
            <IconButton style={{ padding: "5px" }} color="error" onClick={() => handleDeleteDiscount(index)}><Delete /></IconButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className="card-shadow" sx={{ borderRadius: 2, minHeight: "650px", position: "relative" }}>
      <CardContent>
        <h3 className="text-center">Promozioni</h3>
        <Typography align="center" variant="body1">In questa sezione puoi visualizzare o creare le promozioni per i tuoi clienti</Typography>
        <hr style={{ width: "100%" }} />
        <Box sx={{ mt: 2 }}>
          <div className="d-flex justify-end me-3">
            <Button variant="contained" color="secondary" onClick={handleOpenDialog}>Aggiungi</Button>
            <DiscountDialog open={openDialog} onAdd={handleSubmit} onClose={() => setOpenDialog(false)} freePercentage={freePercentage} />
          </div>
          {discounts.length === 0 && (
            <Box sx={{ position: "absolute", width: "97%", textAlign: "center", top: "50%" }}>
              <Typography variant="body1">Non hai registrato ancora nessuna promozione</Typography>
            </Box>
          )}
          <div className="d-flex gap-2">{discounts.map(renderDiscount)}</div>
        </Box>
      </CardContent>
    </Card>
  );
}
