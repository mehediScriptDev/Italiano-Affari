"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

import DataTable from "@/components/data/data-table";
import { useAppContext } from "@/lib/context/app-context";
import PaymentAssets from "@/components/user/profile/payment-assets";
import Avatar from "@mui/material/Avatar";
import {
  AttachMoney,
  ContentCopy,
  InfoOutlined,
  IosShareOutlined,
  QrCode2,
  ShoppingCart,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ChartPreview from "@/components/common/chart-preview";
import {
  fetchEarnings,
  fetchLatestOrders,
  fetchNetwork,
} from "@/lib/api/partners";
import { useAuth } from "@/lib/context/auth-context";
import { Tooltip } from "@mui/material";
import { ReactQRCode } from "@lglab/react-qr-code";
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
  const [networkInfo, setNetworkInfo] = useState({
    count: 0,
    earnings: 0,
  });

  const [orders, setOrders] = useState<OrderRow[]>([]);

  const columns = [
    { label: "Nome", field: "name" },
    {
      label: "Importo (Guadagno)",
      field: "label",
      render: (row: OrderRow) => (
        <Box display="flex" alignItems="center" gap={1}>
          <span>{`${row.total}€ (${row.earnings}€)`}</span>
          <Tooltip
            title={
              <Box>
                {row.commissions
                  ?.filter((c) => c.amount !== 0)
                  .map((c, i) => {
                    let tipo;
                    switch (c.type) {
                      case "direct":
                        tipo = "Vendita Diretta";
                        break;
                      case "affiliate":
                        tipo = "Affiliazione";
                        break;
                      case "level2":
                        tipo = "Livello 2";
                        break;
                      default:
                        tipo = "Livello 3+";
                    }
                    return (
                      <div key={i}>
                        {tipo}: {c.amount.toFixed(2)}€
                      </div>
                    );
                  })}
              </Box>
            }
            arrow
          >
            <IconButton size="small">
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    { label: "Agente", field: "agent" },
    { label: "Data di creazione", field: "date" },
  ];

  useEffect(() => {
    const fetch = async () => {
      fetchEarnings().then((res) => {
        setEarningsPreview(res.data);
      });

      fetchNetwork().then((res) => {
        setNetworkInfo({
          count: res.orders_count,
          earnings: res.network_earnings,
        });
      });

      const response = await fetchLatestOrders();
      console.log(response.data);
      const mappedOrders = response.data.map(
        (order: Record<string, unknown>) => {
          const comms = (order.commissions as Commission[]) ?? [];
          const earnings = comms.reduce(
            (acc, curr) => acc + (curr.amount || 0),
            0,
          );
          const agent = order.agent as Record<string, string>;
          const customer = order.customer as Record<string, string>;

          return {
            id: order.id as number,
            name: customer?.name,
            total: order.amount,
            earnings: earnings,
            commissions: comms,
            agent: `${agent.first_name} ${agent.last_name}`,
            date: new Date(order.created_at as string).toLocaleDateString(
              "it-IT",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            ),
          };
        },
      );

      setOrders(mappedOrders);
    };

    if (token) fetch();
  }, [token]);

  function handleOpenShare() {
    const couponCode = profile?.coupon_code || "";
    setCouponToShare(`https://www.psicopatici.com?c=${couponCode}`);
    setOpenShareDialog(true);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(couponToShare).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }

  function handleAssetButtonClick() {
    if (isMobile) {
      router.push("/assets");
    } else {
      setOpenAssetsDialog(true);
    }
  }

  return (
    <>
      <div
        className="w-100 paddingContainer"
        style={{ backgroundColor: "#f6f8fb" }}
      >
        <div className="mt-3 w-100 d-flex flex-column">
          <div className="d-flex justify-between align-center mb-2">
            <h1 className="page-title">Dashboard</h1>
          </div>

          <Grid
            container
            justifyContent="center"
            spacing={2}
            alignItems="stretch"
          >
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: "flex" }}>
              <Box
                className=""
                sx={{
                  backgroundColor: "#13131f",
                  borderRadius: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  p: 3,
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {/* Top: avatar + name */}
                <div className="d-flex align-center gap-3 mb-3">
                  <Avatar
                    src={profile?.avatar}
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: "#12715b",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {profile?.name?.charAt(0)}
                  </Avatar>
                  <div>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, lineHeight: 1.2 }}
                    >
                      Welcome, {profile?.name}
                    </Typography>
                    <Typography sx={{ color: "#b2b2b2", fontSize: "14px" }}>
                      {profile?.activity}
                    </Typography>
                  </div>
                </div>

                {/* Buttons row */}
                <div className="d-flex gap-2 flex-wrap">
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "12px",
                      borderRadius: "8px",
                    }}
                    onClick={() => handleAssetButtonClick()}
                  >
                    Mostra Assets
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<QrCode2 sx={{ fontSize: "16px!" }} />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "12px",
                      borderRadius: "8px",
                      color: "white",
                      borderColor: "rgba(255,255,255,0.35)",
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: "rgba(255,255,255,0.08)",
                      },
                    }}
                    onClick={handleOpenShare}
                  >
                    Condividi codice QR
                  </Button>
                </div>

                {/* Dialogs */}
                <Dialog
                  className="p-0"
                  open={openAssetsDialog}
                  maxWidth="lg"
                  onClose={() => setOpenAssetsDialog(false)}
                >
                  <DialogContent className="p-0">
                    <PaymentAssets />
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={openShareDialog}
                  onClose={() => setOpenShareDialog(false)}
                >
                  <DialogContent sx={{ textAlign: "center", p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Condividi il tuo codice
                    </Typography>
                    <ReactQRCode
                      value={couponToShare}
                      size={150}
                      marginSize={0}
                      dataModulesSettings={{
                        color: "#000000",
                        style: "rounded",
                        randomSize: false,
                      }}
                      finderPatternOuterSettings={{ style: "rounded" }}
                      finderPatternInnerSettings={{ style: "rounded-sm" }}
                      imageSettings={{
                        src: "/assets/images/qr-code-logo.png",
                        width: 30,
                        height: 30,
                        excavate: true,
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, gap: 1 }}>
                      <TextField
                        variant="outlined"
                        value={couponToShare}
                        fullWidth
                        slotProps={{ input: { readOnly: true } }}
                      />
                      <Tooltip title={copySuccess ? "Copiato!" : "Copia"}>
                        <IconButton onClick={handleCopyLink}>
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </DialogContent>
                </Dialog>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: "flex" }}>
              <ChartPreview
                label={"Guadagno Netto"}
                icon={
                  <AttachMoney style={{ color: "white", fontSize: "24px" }} />
                }
                obj={earningsPreview}
                iconBg="#12715b"
                suffix=" €"
                sx={{ width: "100%", height: "100%" }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: "flex" }}>
              <Box
                className="min-h-27.5 lg:min-h-50"
                sx={{
                  backgroundColor: "white",
                  borderRadius: '6px',
                  border: '1px solid #eef0f4',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 10px rgba(0,0,0,0.06)' },
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{
                    backgroundColor: '#1976d21a',
                    borderRadius: '6px',
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ShoppingCart style={{ color: "#1976d2", fontSize: "22px" }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ color: '#64748b', fontSize: '16px', fontWeight: 500, lineHeight: 1.3 }}>
                      Ordini Totali
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '22px', color: '#13131f', lineHeight: 1.3, mt: 0.25 }}>
                      {networkInfo.count}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 2, color: "#64748b" }}>
                  Valore della rete: <strong>{networkInfo.earnings}€</strong>
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <div className=" mt-2">
            <div className="d-flex justify-between align-center">
              <h5 className="mb-1 text-lg font-medium">Ultimi Ordini</h5>
            </div>
          </div>

          <DataTable columns={columns} data={orders} showCheckbox={true} />
        </div>
      </div>
    </>
  );
}
