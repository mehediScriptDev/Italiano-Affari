"use client";

import { Button, IconButton } from "@mui/material";
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
    <div key={`card-${index}`} className="relative rounded-2xl text-white min-w-[320px] p-5" style={{ background: "linear-gradient(135deg, #1e1e30 0%, #13131f 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="absolute top-2 right-2">
        <IconButton size="small" color="error" onClick={() => handleDeleteDiscount(index)}><Delete sx={{ fontSize: 18 }} /></IconButton>
      </div>

      <p className="text-[11px] text-gray-400 uppercase tracking-wide m-0">Codice</p>
      <p className="text-base tracking-wide mt-1 mb-3">{discount.code}</p>

      <p className="text-[11px] text-gray-400 uppercase tracking-wide m-0">Percentuale</p>
      <p className="text-sm mt-1 mb-0">{discount.value}%</p>
    </div>
  );

  return (
    <div className="dash-card p-7 min-h-[500px] relative">
      <h2 className="text-xl font-bold tracking-tight text-center text-[#13131f] mb-1">Promozioni</h2>
      <p className="text-sm text-slate-500 text-center mb-5">
        In questa sezione puoi visualizzare o creare le promozioni per i tuoi clienti
      </p>

      <hr className="border-0 border-t border-[#eef0f4] my-5" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-[#13131f] m-0">Codici Promozionali</h3>
        <Button variant="contained" color="secondary" onClick={handleOpenDialog} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}>Aggiungi</Button>
        <DiscountDialog open={openDialog} onAdd={handleSubmit} onClose={() => setOpenDialog(false)} freePercentage={freePercentage} />
      </div>

      {discounts.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-slate-400 text-sm">Non hai registrato ancora nessuna promozione</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">{discounts.map(renderDiscount)}</div>
      )}
    </div>
  );
}
