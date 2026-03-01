"use client";

import {useState, useEffect} from "react";
import {
    Box, Button, Dialog, DialogContent,
    Grid, IconButton, TextField,
    Typography,
} from "@mui/material";

import "@/styles/dashboard-partner.css";
import DataTable from "@/components/data/data-table";
import { useAppContext } from "@/lib/context/app-context";
import PaymentAssets from "@/components/user/profile/payment-assets";
import {
    AttachMoney,
    ContentCopy, InfoOutlined,
    IosShareOutlined
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ChartPreview from "@/components/common/chart-preview";
import {fetchEarnings, fetchLatestOrders, fetchNetwork} from "@/lib/api/partners";
import { useAuth } from "@/lib/context/auth-context";
import {Tooltip} from "@mui/material";
import {ReactQRCode} from "@lglab/react-qr-code";
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
    const {token} = useAuth();
    const {profile, isMobile} = useAppContext();
    const [earningsPreview, setEarningsPreview] = useState(null);
    const [networkInfo, setNetworkInfo] = useState({
        count:0,
        earnings:0
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
                                    ?.filter(c => c.amount !== 0).map((c, i) => {
                                        let tipo;
                                        switch (c.type) {
                                            case 'direct':
                                                tipo = "Vendita Diretta";
                                                break;
                                            case 'affiliate':
                                                tipo = "Affiliazione";
                                                break;
                                            case 'level2':
                                                tipo = "Livello 2";
                                                break
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
            )
        },
        { label: "Agente", field: "agent" },
        { label: "Data di creazione", field: "date" }
    ];

    useEffect(() => {
        const fetch = async () => {
            fetchEarnings().then((res) => {
                setEarningsPreview(res.data);
            });

            fetchNetwork().then((res) => {
                setNetworkInfo({
                    count: res.orders_count,
                    earnings: res.network_earnings
                });
            })

            const response = await fetchLatestOrders();
            console.log(response.data);
            const mappedOrders = response.data.map((order: Record<string, unknown>) => {
                const comms = (order.commissions as Commission[]) ?? [];
                const earnings = comms.reduce((acc, curr) => acc + (curr.amount || 0), 0);
                const agent = order.agent as Record<string, string>;
                const customer = order.customer as Record<string, string>;

                return {
                    id: order.id as number,
                    name: customer?.name,
                    total: order.amount,
                    earnings: earnings,
                    commissions: comms,
                    agent: `${agent.first_name} ${agent.last_name}`,
                    date: new Date(order.created_at as string).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
            });

            setOrders(mappedOrders);


        }

        if (token)
            fetch();

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
            <div className="d-flex justify-center px-2" style={{backgroundColor: "#f6f8fb"}}>
                <div style={{maxWidth: "1200px"}}
                     className="mt-5 w-100 d-flex flex-column justify-center paddingContainer p-0">
                    <div className="d-flex justify-between align-center mb-2">
                        <h5 className=" mb-0">Dashboard</h5>
                    </div>

                    <Grid
                        container
                        className=""
                        justifyContent="center"
                        spacing={2}
                    >
                        <Grid size={{ xs: 12, lg: 4 }}>
                            <Box
                                className="card"
                                sx={{
                                    backgroundColor: "black",
                                    borderRadius: "10px",
                                    p: 3,
                                    color: "white",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between"
                                }}
                            >
                                <div>
                                    <Typography variant="h5">{profile?.name}</Typography>
                                    <Typography sx={{color: "#b2b2b2"}}>{profile?.activity}</Typography>

                                    <Button size={"small"} variant={"contained"} color={"secondary"} sx={{mt: 2}}
                                            onClick={(e) => handleAssetButtonClick()}>Mostra Assets</Button>

                                    <Dialog className="p-0" open={openAssetsDialog} maxWidth={"lg"}
                                            onClose={() => setOpenAssetsDialog(false)}>
                                        <DialogContent className="p-0">
                                            <PaymentAssets/>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)}>
                                        <DialogContent sx={{textAlign: 'center', p: 4}}>
                                            <Typography variant="h6" sx={{mb: 2}}>
                                                Condividi il tuo codice
                                            </Typography>

                                            <ReactQRCode value={couponToShare}
                                                         size={150}
                                                         marginSize={0}
                                                         dataModulesSettings={{
                                                             color: "#000000",
                                                             style: "rounded",
                                                             randomSize: false
                                                         }}
                                                         finderPatternOuterSettings={{style: "rounded"}}
                                                         finderPatternInnerSettings={{style: "rounded-sm"}}
                                                         imageSettings={{
                                                             src: "/assets/images/qr-code-logo.png",
                                                             width: 30,
                                                             height: 30,
                                                             excavate: true
                                                         }}/>

                                            <Box sx={{display: 'flex', alignItems: 'center', mt: 3, gap: 1}}>
                                                <TextField
                                                    variant="outlined"
                                                    value={couponToShare}
                                                    fullWidth
                                                    slotProps={{
                                                        input: {
                                                            readOnly: true,
                                                        }
                                                    }}
                                                />
                                                <Tooltip title={copySuccess ? "Copiato!" : "Copia"}>
                                                    <IconButton onClick={handleCopyLink}>
                                                        <ContentCopy/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </DialogContent>
                                    </Dialog>

                                </div>
                                <div className={"d-flex align-center"}>
                                    <Typography>Condividi il tuo codice QR</Typography>
                                    <IconButton style={{bottom: "4px"}} className={"position-relative"}
                                                onClick={handleOpenShare}>
                                        <IosShareOutlined color={"secondary"}/>
                                    </IconButton>
                                </div>
                            </Box>
                        </Grid>


                        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                            <ChartPreview label={"Guadagno Netto"}
                                          icon={<AttachMoney style={{color: "black", fontSize: "24px"}}/>}
                                          obj={earningsPreview}
                                          sx={{paddingBottom: "10px"}}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                            <Box
                                className="card1"
                                sx={{
                                    backgroundColor: "white",
                                    border: "4px solid white",
                                    borderRadius: "10px",
                                    p: 3,
                                    color: "black",
                                }}
                            >
                                <Typography>{networkInfo.count} Ordini </Typography>
                                <Typography>Valore della rete: <span className="price">{networkInfo.earnings}€</span></Typography>
                            </Box>
                        </Grid>
                    </Grid>


                    <div className=" mt-2">
                        <div className="d-flex justify-between align-center">
                            <h5 className="mb-1">Ultimi Ordini</h5>
                        </div>
                    </div>


                    <DataTable columns={columns} data={orders} showCheckbox={true}/>

                </div>
            </div>
        </>
    );
}