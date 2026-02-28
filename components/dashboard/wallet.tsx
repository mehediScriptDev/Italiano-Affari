"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Button, Grid, Typography, useMediaQuery, IconButton,
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
  const isMobile = useMediaQuery((theme: { breakpoints: { down: (b: string) => string } }) => theme.breakpoints.down("sm"));

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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress /><Typography sx={{ ml: 2 }}>Loading data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, color: "error.main", textAlign: "center" }}>
        <Typography variant="h6">Error:</Typography>
        <Typography>{error}</Typography>
        <Button onClick={() => { setLoading(true); Promise.all([fetchCredits(), fetchCouponsData()]).finally(() => setLoading(false)); }} variant="contained" sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ backgroundColor: "transparent", p: 2 }}>
        <div className="flex justify-between items-center pr-[6px]">
          <h5 className="mb-0">Portafoglio</h5>
          <Button variant="contained" color="secondary" onClick={() => { setGenValue(0); setOpenGen(true); }}>Genera Coupon</Button>
        </div>
        <div className="flex flex-wrap justify-center">
          <Grid className={isMobile ? "px-0" : "px-1"} container spacing={isMobile ? 2 : 1} sx={{ mt: 2, p: 0 }}>
            <Grid size={{ xs: 12, md: 4 }}><ChartPreview label="Saldo attuale disponibile" icon={<Savings style={{ color: "black", fontSize: "24px" }} />} obj={chartsPreview.sales} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><ChartPreview label="Saldo utilizzato" icon={<MoneyOff style={{ color: "black", fontSize: "24px" }} />} obj={chartsPreview.earnings} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><ChartPreview label="Saldo totale" icon={<MonetizationOn style={{ color: "black", fontSize: "24px" }} />} obj={chartsPreview.affiliates} /></Grid>
          </Grid>
        </div>
        <Box mt={4}>
          <div className="mt-2"><div className="flex justify-between items-center"><h5 className="mb-1">Tabella coupon</h5></div></div>
          <DataTable columns={columns} data={tableData} showCheckbox />
        </Box>
      </Box>

      <Dialog open={openGen} onClose={() => setOpenGen(false)}>
        <DialogTitle>Genera Coupon</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Seleziona quanti crediti assegnare:</Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" sx={{ minWidth: 24 }}>0</Typography>
            <Slider color="secondary" value={genValue} onChange={(_, v) => setGenValue(v as number)} min={0} max={chartsPreview.sales.total} valueLabelDisplay="auto" sx={{ mx: 2, flexGrow: 1 }} />
            <Typography variant="body2" sx={{ minWidth: 32, textAlign: "right" }}>{chartsPreview.sales.total}</Typography>
          </Box>
          <div className="mt-3"><Typography variant="caption">{genValue} crediti selezionati</Typography></div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGen(false)}>Annulla</Button>
          <Button onClick={handleGenerateCoupon} color="secondary" variant="contained" disabled={genValue <= 0 || chartsPreview.sales.total === 0}>Genera</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
