"use client";

import { useState, useEffect } from "react";
import {
  Button, Dialog, DialogContent, IconButton, TextField, Tooltip,
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
        <div className="flex items-center gap-2">
          <span>{`${row.total}€ (${row.earnings}€)`}</span>
          <Tooltip
            title={
              <div>
                {row.commissions?.filter((c) => c.amount !== 0).map((c, i) => {
                  const tipo = { direct: "Vendita Diretta", affiliate: "Affiliazione", level2: "Livello 2" }[c.type] ?? "Livello 3+";
                  return <div key={i}>{tipo}: {c.amount.toFixed(2)}€</div>;
                })}
              </div>
            }
            arrow
          >
            <IconButton size="small"><InfoOutlined fontSize="small" /></IconButton>
          </Tooltip>
        </div>
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
      <div className="container py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Panoramica delle tue attività</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

          {/* Profile card */}
          <div className="rounded-2xl p-6 text-white flex flex-col justify-between gradient-card">
            <div>
              <p className="text-lg font-bold tracking-tight m-0" style={{ letterSpacing: '-0.025em' }}>{profile?.name}</p>
              <p className="text-[13px] text-gray-400 mt-0.5 mb-0">{profile?.activity}</p>
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
              <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} PaperProps={{ className: "!rounded-2xl" }}>
                <DialogContent sx={{ textAlign: "center", p: 4 }}>
                  <p className="text-lg font-bold mb-4 m-0">Condividi il tuo codice</p>
                  <ReactQRCode value={couponToShare} size={150} marginSize={0}
                    dataModulesSettings={{ color: "#000000", style: "rounded", randomSize: false }}
                    finderPatternOuterSettings={{ style: "rounded" }}
                    finderPatternInnerSettings={{ style: "rounded-sm" }}
                    imageSettings={{ src: "/assets/images/qr-code-logo.png", width: 30, height: 30, excavate: true }}
                  />
                  <div className="flex items-center mt-4 gap-2">
                    <TextField variant="outlined" value={couponToShare} fullWidth slotProps={{ input: { readOnly: true } }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                    <Tooltip title={copySuccess ? "Copiato!" : "Copia"}>
                      <IconButton onClick={handleCopyLink} sx={{ border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px" }}>
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center mt-4 pt-3 border-t border-white/8">
              <p className="text-[13px] text-gray-400 flex-1 m-0">Condividi il tuo codice QR</p>
              <IconButton onClick={handleOpenShare}>
                <IosShareOutlined color="secondary" sx={{ fontSize: 20 }} />
              </IconButton>
            </div>
          </div>

          {/* Earnings KPI */}
          <ChartPreview label="Guadagno Netto" icon={<AttachMoney style={{ color: "#13131f", fontSize: "22px" }} />} obj={earningsPreview} />

          {/* Network card */}
          <div className="dash-card dash-card-hover p-6 transition-all duration-200">
            <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#f6f8fb] flex items-center justify-center shrink-0" style={{ boxShadow: '0 1px 3px rgba(19, 19, 31, 0.06)' }}>
                <span className="text-lg">🛒</span>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide m-0">Ordini nella rete</p>
                <p className="text-[22px] font-bold tracking-tight leading-tight m-0 text-[#13131f]" style={{ letterSpacing: '-0.03em' }}>{networkInfo.count}</p>
              </div>
            </div>
            <div className="border-t border-[#eef0f4] pt-3">
              <p className="text-[13px] text-slate-500 m-0">
                Valore della rete: <span className="font-bold text-[#13131f]">{networkInfo.earnings}€</span>
              </p>
            </div>
          </div>
        </div>

        {/* Orders table */}
        <div className="mb-2">
          <h2 className="text-lg font-bold tracking-tight text-[#13131f] mb-0.5">Ultimi Ordini</h2>
          <p className="page-subtitle mb-4">Le tue transazioni più recenti</p>
        </div>
        <DataTable columns={columns} data={orders} showCheckbox={true} />
      </div>
    </>
  );
}
