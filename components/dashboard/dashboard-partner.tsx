"use client";

import { useState, useEffect } from "react";
import {
  Box, Button, Dialog, DialogContent, Grid, IconButton, TextField, Typography, Tooltip,
} from "@mui/material";
import { AttachMoney, ContentCopy, InfoOutlined, IosShareOutlined } from "@mui/icons-material";
import { ReactQRCode } from "@lglab/react-qr-code";
import { useRouter } from "next/navigation";
import "@/styles/dashboard-partner.css";
import DataTable from "@/components/data/data-table";
import ChartPreview from "@/components/common/chart-preview";
import PaymentAssets from "@/components/user/profile/payment-assets";
import { useAppContext } from "@/lib/context/app-context";
import { useAuth } from "@/lib/context/auth-context";
import { fetchEarnings, fetchLatestOrders, fetchNetwork } from "@/lib/api/partners";
import type { Commission } from "@/lib/types";

interface OrderRow {
  id: number;
  name: string;
  total: number;
  earnings: number;
  commissions: Commission[];
  agent: string;
  date: string;
}

export default function DashboardPartner() {
  const [openAssetsDialog, setOpenAssetsDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [couponToShare, setCouponToShare] = useState("");
  const router = useRouter();
  const { token } = useAuth();
  const { profile, isMobile } = useAppContext();
  const [earningsPreview, setEarningsPreview] = useState(null);
  const [networkInfo, setNetworkInfo] = useState({ count: 0, earnings: 0 });
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const columns = [
    { label: "Nome", field: "name" },
    {
      label: "Importo (Guadagno)", field: "label",
      render: (row: OrderRow) => (
        <Box display="flex" alignItems="center" gap={1}>
          <span>{`${row.total}€ (${row.earnings}€)`}</span>
          <Tooltip
            title={
              <Box>
                {row.commissions?.filter((c) => c.amount !== 0).map((c, i) => {
                  const tipo = { direct: "Vendita Diretta", affiliate: "Affiliazione", level2: "Livello 2" }[c.type] ?? "Livello 3+";
                  return <div key={i}>{tipo}: {c.amount.toFixed(2)}€</div>;
                })}
              </Box>
            }
            arrow
          >
            <IconButton size="small"><InfoOutlined fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      ),
    },
    { label: "Agente", field: "agent" },
    { label: "Data di creazione", field: "date" },
  ];

  useEffect(() => {
    if (!token) return;
    fetchEarnings().then((res) => setEarningsPreview(res.data));
    fetchNetwork().then((res) => setNetworkInfo({ count: res.orders_count, earnings: res.network_earnings }));

    fetchLatestOrders().then((response) => {
      setOrders(
        response.data.map((order: Record<string, unknown>) => {
          const comms = (order.commissions as Commission[]) ?? [];
          const earnings = comms.reduce((acc, c) => acc + (c.amount || 0), 0);
          const agent = order.agent as Record<string, string>;
          const customer = order.customer as Record<string, string>;
          return {
            id: order.id as number, name: customer?.name, total: order.amount,
            earnings, commissions: comms, agent: `${agent.first_name} ${agent.last_name}`,
            date: new Date(order.created_at as string).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          };
        })
      );
    });
  }, [token]);

  const handleOpenShare = () => {
    setCouponToShare(`https://www.psicopatici.com?c=${profile?.coupon_code || ""}`);
    setOpenShareDialog(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(couponToShare).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleAssetButtonClick = () => {
    if (isMobile) router.push("/assets");
    else setOpenAssetsDialog(true);
  };

  return (
    <>
      <div className="d-flex justify-center px-2" style={{ backgroundColor: "#f6f8fb" }}>
        <div style={{ maxWidth: "1200px" }} className="mt-5 w-100 d-flex flex-column justify-center paddingContainer p-0">
          <div className="d-flex justify-between align-center mb-2">
            <div>
              <h5 className="mb-0" style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px" }}>Dashboard</h5>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>Panoramica delle tue attività</p>
            </div>
          </div>

          <Grid container justifyContent="center" spacing={2}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box
                className="card"
                sx={{
                  background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
                  borderRadius: "12px",
                  p: 3,
                  color: "white",
                  justifyContent: "space-between",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <Typography sx={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px" }}>
                    {profile?.name}
                  </Typography>
                  <Typography sx={{ color: "#9ca3af", fontSize: "13px", mt: "2px" }}>
                    {profile?.activity}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    sx={{ mt: 2.5, borderRadius: "8px", textTransform: "none", fontWeight: 600, fontSize: "13px", px: 2.5 }}
                    onClick={handleAssetButtonClick}
                  >
                    Mostra Assets
                  </Button>
                  <Dialog className="p-0" open={openAssetsDialog} maxWidth="lg" onClose={() => setOpenAssetsDialog(false)}>
                    <DialogContent className="p-0"><PaymentAssets /></DialogContent>
                  </Dialog>
                  <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)}>
                    <DialogContent sx={{ textAlign: "center", p: 4 }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Condividi il tuo codice</Typography>
                      <ReactQRCode value={couponToShare} size={150} marginSize={0}
                        dataModulesSettings={{ color: "#000000", style: "rounded", randomSize: false }}
                        finderPatternOuterSettings={{ style: "rounded" }}
                        finderPatternInnerSettings={{ style: "rounded-sm" }}
                        imageSettings={{ src: "/assets/images/qr-code-logo.png", width: 30, height: 30, excavate: true }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", mt: 3, gap: 1 }}>
                        <TextField variant="outlined" value={couponToShare} fullWidth slotProps={{ input: { readOnly: true } }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                        />
                        <Tooltip title={copySuccess ? "Copiato!" : "Copia"}>
                          <IconButton onClick={handleCopyLink} sx={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px" }}>
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="d-flex align-center" style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <Typography sx={{ fontSize: "13px", color: "#9ca3af" }}>Condividi il tuo codice QR</Typography>
                  <IconButton style={{ bottom: "2px" }} className="position-relative" onClick={handleOpenShare}>
                    <IosShareOutlined color="secondary" sx={{ fontSize: 20 }} />
                  </IconButton>
                </div>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <ChartPreview label="Guadagno Netto" icon={<AttachMoney style={{ color: "black", fontSize: "22px" }} />} obj={earningsPreview} sx={{ paddingBottom: "10px" }} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <Box
                className="card1"
                sx={{
                  backgroundColor: "white",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "12px",
                  p: 3,
                  color: "black",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.25s ease, transform 0.25s ease",
                  "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)", transform: "translateY(-1px)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "14px", mb: 2 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f6f8fb" }}>
                    <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>🛒</Typography>
                  </Box>
                  <div>
                    <Typography sx={{ fontSize: "12px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      Ordini nella rete
                    </Typography>
                    <Typography sx={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                      {networkInfo.count}
                    </Typography>
                  </div>
                </Box>
                <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.06)", pt: 1.5 }}>
                  <Typography sx={{ fontSize: "13px", color: "#64748b" }}>
                    Valore della rete: <span style={{ fontWeight: 700, color: "#000" }}>{networkInfo.earnings}€</span>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <div style={{ marginTop: "32px" }}>
            <div className="d-flex justify-between align-center" style={{ marginBottom: "12px" }}>
              <div>
                <h5 className="mb-0" style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.3px" }}>Ultimi Ordini</h5>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>Le tue transazioni più recenti</p>
              </div>
            </div>
          </div>
          <DataTable columns={columns} data={orders} showCheckbox={true} />
        </div>
      </div>
    </>
  );
}
