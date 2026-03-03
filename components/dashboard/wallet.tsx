"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Slider, CircularProgress,
} from "@mui/material";
import { Delete, MonetizationOn, Savings, MoneyOff } from "@mui/icons-material";
import ChartPreview from "@/components/common/chart-preview";
import DataTable from "@/components/data/data-table";
import { getAllCredits, generateCoupon, getCoupons, deleteCoupon } from "@/lib/api/partners";

import type { ChartPreviewData } from "@/lib/types";

interface Coupon {
  id: number;
  code: string;
  value: number;
  used: boolean;
}

export default function Wallet() {
  const [genValue, setGenValue] = useState(0);
  const [openGen, setOpenGen] = useState(false);
  const [chartsPreview, setChartsPreview] = useState<Record<string, ChartPreviewData>>({
    sales: { total: 0, data: [], difference: "0%", trend: "neutral" },
    earnings: { total: 0, data: [], difference: "0%", trend: "neutral" },
    affiliates: { total: 0, data: [], difference: "0%", trend: "neutral" },
  });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllCredits();
      setChartsPreview((prev) => ({
        ...prev,
        sales: { ...prev.sales, total: data.available_credits, label: "Saldo attuale disponibile" },
        earnings: { ...prev.earnings, total: data.used_credits, label: "Saldo utilizzato" },
        affiliates: { ...prev.affiliates, total: data.total_credits, label: "Saldo totale" },
      }));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to load credits.";
      setError(msg);
    }
  }, []);

  const fetchCouponsData = useCallback(async () => {
    try {
      setError(null);
      const data = await getCoupons();
      setCoupons(data.map((c: { id: number; code: string; value: number; quantity: number }) => ({
        id: c.id, code: c.code, value: c.value, used: c.quantity === 0,
      })));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to load coupons.";
      setError(msg);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCredits(), fetchCouponsData()]).finally(() => setLoading(false));
  }, [fetchCredits, fetchCouponsData]);

  const handleGenerateCoupon = async () => {
    try {
      setError(null);
      await generateCoupon(genValue);
      await Promise.all([fetchCredits(), fetchCouponsData()]);
      setOpenGen(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to generate coupon.";
      setError(msg);
    }
  };

  const handleDeleteCoupon = async (couponId: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCoupon(couponId);
      await Promise.all([fetchCouponsData(), fetchCredits()]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to delete coupon.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { label: "Codice Coupon", field: "code" },
    { label: "Valore (crediti)", field: "value" },
    { label: "Utilizzato", field: "used" },
    { label: "Azioni", field: "actions" },
  ];

  const tableData = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    value: c.value,
    used: c.used ? "Sì" : "No",
    actions: !c.used ? (
      <IconButton size="small" onClick={() => handleDeleteCoupon(c.id)} aria-label="delete coupon"><Delete /></IconButton>
    ) : null,
  }));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <p className="text-red-600 font-semibold">Error:</p>
        <p className="text-sm text-slate-500">{error}</p>
        <Button onClick={() => { setLoading(true); Promise.all([fetchCredits(), fetchCouponsData()]).finally(() => setLoading(false)); }} variant="contained" sx={{ borderRadius: "8px", textTransform: "none" }}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-100 paddingContainer mt-3">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="page-title">Portafoglio</h1>
            <p className="page-subtitle">Gestisci i tuoi crediti e coupon</p>
          </div>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => { setGenValue(0); setOpenGen(true); }}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "13px", px: 2.5 }}
          >
            Genera Coupon
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1 mb-3 lg:mb-6">
          <ChartPreview label="Saldo attuale disponibile" icon={<Savings style={{ color: "#13131f", fontSize: "22px" }} />} obj={chartsPreview.sales} />
          <ChartPreview label="Saldo utilizzato" icon={<MoneyOff style={{ color: "#13131f", fontSize: "22px" }} />} obj={chartsPreview.earnings} />
          <ChartPreview label="Saldo totale" icon={<MonetizationOn style={{ color: "#13131f", fontSize: "22px" }} />} obj={chartsPreview.affiliates} />
        </div>

        {/* Coupon table */}
        <div className="mb-2">
          <h2 className="text-lg font-bold tracking-tight text-[#13131f] mb-0.5">Tabella Coupon</h2>
          <p className="page-subtitle mb-2">I tuoi coupon generati</p>
        </div>
        <DataTable columns={columns} data={tableData} showCheckbox />
      </div>

      {/* Generate dialog */}
      <Dialog open={openGen} onClose={() => setOpenGen(false)} PaperProps={{ className: "!rounded-2xl !min-w-[360px]" }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "18px", pt: 3 }}>Genera Coupon</DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-500 mb-3">Seleziona quanti crediti assegnare:</p>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-slate-500 min-w-6">0</span>
            <Slider color="secondary" value={genValue} onChange={(_, v) => setGenValue(v as number)} min={0} max={chartsPreview.sales.total} valueLabelDisplay="auto" className="flex-1" />
            <span className="text-[13px] text-slate-500 min-w-8 text-right">{chartsPreview.sales.total}</span>
          </div>
          <div className="mt-4 px-3.5 py-2.5 bg-[#f6f8fb] rounded-xl">
            <p className="text-sm font-semibold m-0">{genValue} crediti selezionati</p>
          </div>
        </DialogContent>
        <DialogActions sx={{ pb: 2.5, px: 3, gap: 1 }}>
          <Button onClick={() => setOpenGen(false)} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 500, px: 2.5 }}>Annulla</Button>
          <Button onClick={handleGenerateCoupon} color="secondary" variant="contained" disabled={genValue <= 0 || chartsPreview.sales.total === 0} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}>Genera</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
