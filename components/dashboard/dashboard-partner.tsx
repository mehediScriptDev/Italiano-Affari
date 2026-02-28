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
    <div className="flex justify-center px-2 bg-[#f6f8fb]">
      <div className="mt-5 w-full max-w-[1200px] flex flex-col justify-center px-4 p-0">
        <div className="flex justify-between items-center mb-2"><h5 className="mb-0">Dashboard</h5></div>

        <Grid container justifyContent="center" spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box className="card" sx={{ backgroundColor: "black", borderRadius: "10px", p: 3, color: "white", justifyContent: "space-between" }}>
              <div>
                <Typography variant="h5">{profile?.name}</Typography>
                <Typography sx={{ color: "#b2b2b2" }}>{profile?.activity}</Typography>
                <Button size="small" variant="contained" color="secondary" sx={{ mt: 2 }} onClick={handleAssetButtonClick}>Mostra Assets</Button>
                <Dialog open={openAssetsDialog} maxWidth="lg" onClose={() => setOpenAssetsDialog(false)}>
                  <DialogContent className="p-0"><PaymentAssets /></DialogContent>
                </Dialog>
                <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)}>
                  <DialogContent sx={{ textAlign: "center", p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Condividi il tuo codice</Typography>
                    <ReactQRCode value={couponToShare} size={150} marginSize={0} dataModulesSettings={{ color: "#000000", style: "rounded", randomSize: false }} finderPatternOuterSettings={{ style: "rounded" }} finderPatternInnerSettings={{ style: "rounded-sm" }} />
                    <Box sx={{ display: "flex", alignItems: "center", mt: 3, gap: 1 }}>
                      <TextField variant="outlined" value={couponToShare} fullWidth slotProps={{ input: { readOnly: true } }} />
                      <Tooltip title={copySuccess ? "Copiato!" : "Copia"}><IconButton onClick={handleCopyLink}><ContentCopy /></IconButton></Tooltip>
                    </Box>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center">
                <Typography>Condividi il tuo codice QR</Typography>
                <IconButton className="relative bottom-[4px]" onClick={handleOpenShare}>
                  <IosShareOutlined color="secondary" />
                </IconButton>
              </div>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <ChartPreview label="Guadagno Netto" icon={<AttachMoney style={{ color: "black", fontSize: "24px" }} />} obj={earningsPreview} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <Box className="card1" sx={{ backgroundColor: "white", border: "4px solid white", borderRadius: "10px", p: 3, color: "black" }}>
              <Typography>{networkInfo.count} Ordini</Typography>
              <Typography>Valore della rete: <span className="price">{networkInfo.earnings}€</span></Typography>
            </Box>
          </Grid>
        </Grid>

        <div className="mt-2">
          <div className="flex justify-between items-center"><h5 className="mb-1">Ultimi Ordini</h5></div>
        </div>
        <DataTable columns={columns} data={orders} showCheckbox />
      </div>
    </div>
  );
}
