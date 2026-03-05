"use client";

import { Button, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { ContentCopy, CheckCircleOutline, DeleteOutline } from "@mui/icons-material";
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
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
    <div
      key={`card-${index}`}
      className="flex flex-row"
      style={{
        width: '100%',
        maxWidth: 340,
        minHeight: 80,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #12121c 0%, #0d1a16 100%)',
        boxShadow: '0 4px 18px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {/* Left accent strip */}
      <div style={{ width: 5, background: 'linear-gradient(180deg, #1aaa87, #12715b)', flexShrink: 0 }} />

      {/* Left: discount percentage */}
      <div
        className="flex flex-col items-center justify-center px-3"
        style={{ width: '30%', minWidth: 72, flexShrink: 0, background: 'rgba(26,170,135,0.07)' }}
      >
        <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
          Sconto
        </p>
        <p style={{ margin: '1px 0 0', fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
          {discount.value}<span style={{ fontSize: 15, fontWeight: 700, color: '#1aaa87', marginLeft: 1 }}>%</span>
        </p>
      </div>

      {/* Vertical notched divider */}
      <div style={{ position: 'relative', width: 18, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#060610', marginTop: -8, flexShrink: 0 }} />
        <div style={{ flex: 1, borderLeft: '1.5px dashed rgba(255,255,255,0.12)' }} />
        <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#060610', marginBottom: -8, flexShrink: 0 }} />
      </div>

      {/* Right: code + actions */}
      <div className="flex flex-1 items-center justify-between px-3 py-2 gap-2">
        <div className="min-w-0">
          <p style={{ margin: 0, fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Codice promo
          </p>
          <p className="truncate" style={{ margin: '3px 0 0', fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>
            {discount.code}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          {/* Copy */}
          <Tooltip title={copiedIndex === index ? "Copiato!" : "Copia codice"} placement="top">
            <IconButton
              size="small"
              onClick={() => handleCopyCode(discount.code, index)}
              style={{
                backgroundColor: copiedIndex === index ? 'rgba(18,113,91,0.3)' : 'rgba(255,255,255,0.07)',
                borderRadius: 6,
                padding: 5,
                transition: 'all 0.2s',
              }}
              sx={{ '&:hover': { backgroundColor: 'rgba(26,170,135,0.22)' } }}
            >
              {copiedIndex === index
                ? <CheckCircleOutline sx={{ fontSize: 15, color: '#1aaa87' }} />
                : <ContentCopy sx={{ fontSize: 15, color: 'rgba(255,255,255,0.5)' }} />
              }
            </IconButton>
          </Tooltip>

          {/* Delete */}
          <Tooltip title="Elimina" placement="top">
            <IconButton
              size="small"
              onClick={() => handleDeleteDiscount(index)}
              style={{
                backgroundColor: 'rgba(239,68,68,0.13)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 6,
                padding: 5,
                color: '#ef4444',
                transition: 'all 0.2s',
              }}
              sx={{ '&:hover': { backgroundColor: '#ef4444', color: '#fff', borderColor: '#ef4444' } }}
            >
              <DeleteOutline sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dash-card p-7 min-h-120 relative">
      <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-center text-[#13131f] mb-1">Promozioni</h2>
      <p className="text-sm lg:text-base text-slate-500 text-center mb-3">
        In questa sezione puoi visualizzare o creare le promozioni per i tuoi clienti
      </p>

      <hr className="border-0 border-t border-[#eef0f4] my-5" />

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base lg:text-xl font-bold text-[#13131f] m-0">Codici Promozionali</h3>
        <Button variant="contained" color="secondary" onClick={handleOpenDialog} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}>Aggiungi</Button>
        <DiscountDialog open={openDialog} onAdd={handleSubmit} onClose={() => setOpenDialog(false)} freePercentage={freePercentage} />
      </div>

      {discounts.length === 0 ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-slate-400 text-sm lg:text-base">Non hai registrato ancora nessuna promozione</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">{discounts.map(renderDiscount)}</div>
      )}
    </div>
  );
}
