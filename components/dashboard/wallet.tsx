"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box, Button, Typography, useMediaQuery, IconButton, Grid,
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
      <Box sx={{ backgroundColor: "#f6f8fb", p: 2 }}>
        <div className="d-flex justify-between align-center" style={{ paddingRight: "6px" }}>
          <div>
            <h5 className="mb-0" style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px" }}>Portafoglio</h5>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>Gestisci i tuoi crediti e coupon</p>
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
        <div className="row d-flex justify-center">
          <Grid
            className={isMobile ? "px-0" : "px-1"}
            container
            spacing={isMobile ? 2 : 1}
            sx={{ mt: 2, p: 0 }}
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <ChartPreview label="Saldo attuale disponibile" icon={<Savings style={{ color: "black", fontSize: "22px" }} />} obj={chartsPreview.sales} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ChartPreview label="Saldo utilizzato" icon={<MoneyOff style={{ color: "black", fontSize: "22px" }} />} obj={chartsPreview.earnings} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ChartPreview label="Saldo totale" icon={<MonetizationOn style={{ color: "black", fontSize: "22px" }} />} obj={chartsPreview.affiliates} />
            </Grid>
          </Grid>
        </div>
        <Box mt={4}>
          <div style={{ marginBottom: "12px" }}>
            <div className="d-flex justify-between align-center">
              <div>
                <h5 className="mb-0" style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.3px" }}>Tabella Coupon</h5>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>I tuoi coupon generati</p>
              </div>
            </div>
          </div>
          <DataTable columns={columns} data={tableData} showCheckbox />
        </Box>
      </Box>

      <Dialog open={openGen} onClose={() => setOpenGen(false)} PaperProps={{ sx: { borderRadius: "12px", minWidth: 360 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "18px", pt: 3 }}>Genera Coupon</DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ fontSize: "14px", color: "#64748b" }}>Seleziona quanti crediti assegnare:</Typography>
          <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ minWidth: 24, fontSize: "13px", color: "#64748b" }}>0</Typography>
            <Slider color="secondary" value={genValue} onChange={(_, v) => setGenValue(v as number)} min={0} max={chartsPreview.sales.total} valueLabelDisplay="auto" sx={{ mx: 2, flexGrow: 1 }} />
            <Typography variant="body2" sx={{ minWidth: 32, textAlign: "right", fontSize: "13px", color: "#64748b" }}>{chartsPreview.sales.total}</Typography>
          </Box>
          <Box sx={{ mt: 2, p: "10px 14px", backgroundColor: "#f6f8fb", borderRadius: "8px" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>{genValue} crediti selezionati</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 2.5, px: 3, gap: 1 }}>
          <Button onClick={() => setOpenGen(false)} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 500, px: 2.5 }}>Annulla</Button>
          <Button onClick={handleGenerateCoupon} color="secondary" variant="contained" disabled={genValue <= 0 || chartsPreview.sales.total === 0} sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, px: 2.5 }}>Genera</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
