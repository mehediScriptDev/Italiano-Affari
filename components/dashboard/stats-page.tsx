"use client";

import {useEffect, useState} from 'react';
import {Box, Grid, Typography} from "@mui/material";
import useFetch from "@/components/common/useFetch";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import StatsChart from "@/components/common/stats-chart";
import {AttachMoney, Handshake, ShoppingBag} from "@mui/icons-material";
import ChartPreview from "@/components/common/chart-preview";
import {fetchAffiliates, fetchEarnings, fetchSales} from "@/lib/api/partners";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Filler,
    Tooltip,
    Legend
);

export default function StatsPage() {
    const [chartsPreview,setChartsPreview] = useState({
        sales:null,
        earnings:null,
        affiliates:null
    });

    const earningsFetch = useFetch('charts/earnings', () => fetchEarnings().then(r => r.data), { dedupingInterval: 60_000 });
    const salesFetch = useFetch('charts/sales', () => fetchSales().then(r => r.data), { dedupingInterval: 60_000 });
    const affiliatesFetch = useFetch('charts/affiliates', () => fetchAffiliates().then(r => r.data), { dedupingInterval: 60_000 });

    useEffect(() => {
        setChartsPreview({ sales: salesFetch.data ?? null, earnings: earningsFetch.data ?? null, affiliates: affiliatesFetch.data ?? null });
    }, [salesFetch.data, earningsFetch.data, affiliatesFetch.data]);

    const fetchBigChart = (chartType: string, periodType: string, dateRange: { start: Date; end: Date }) => {
        let startDate: Date, endDate: Date;
        switch (periodType) {
            case 'today':
                startDate = new Date();
                endDate = new Date();
                break;

            case 'weekly':
                endDate = new Date();
                startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);
                break;

            case 'monthly':
                endDate = new Date();
                startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
                break;

            case 'trimester':
                endDate = new Date();
                startDate = new Date();
                startDate.setMonth(endDate.getMonth() - 2, 1);
                break;
            case 'custom':
                startDate = dateRange.start;
                endDate = dateRange.end;
                break;
            default:
                startDate = new Date();
                endDate = new Date();
                break;
        }

        const chartTypeToFetchFunction: Record<string, typeof fetchEarnings> = {
            commissioni: fetchEarnings,
            vendite: fetchSales,
            affiliati: fetchAffiliates,
        };

        const fetchFunction = chartTypeToFetchFunction[chartType];

        if (!fetchFunction) {
            throw new Error(`Invalid chartType: ${chartType}`);
        }



        return fetchFunction(startDate, endDate).then((res) => {
            let labels = Object.keys(res.data.data);

            if(periodType !== "today") {
                labels = labels.map((label) => {
                    const date = new Date(label);

                    return date.toLocaleDateString('it-IT', {
                        month: '2-digit',
                        day: '2-digit'
                    });
                });
            }

            return [{ labels, label: chartType, data: Object.values(res.data.data) as number[] }];
        });
    }

    return (
        <Box className="w-100 paddingContainer mt-3" sx={{ backgroundColor: 'transparent' }}>
            <div className="flex items-center justify-between mb-3">
                <h1 className="page-title">Statistiche</h1>
            </div>

            {/* KPI Cards */}
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <ChartPreview
                        label="Vendite Dirette"
                        icon={<ShoppingBag style={{ fontSize: '20px' }} />}
                        obj={chartsPreview.sales}
                        iconBg="#6366f1"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <ChartPreview
                        label="Guadagni Maturati"
                        icon={<AttachMoney style={{ fontSize: '20px' }} />}
                        obj={chartsPreview.earnings}
                        iconBg="#10b981"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <ChartPreview
                        label="Co-Partner"
                        icon={<Handshake style={{ fontSize: '20px' }} />}
                        obj={chartsPreview.affiliates}
                        iconBg="#f59e0b"
                    />
                </Grid>
            </Grid>

            {/* Main chart */}
            <Box sx={{ mb: 3, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eef0f4', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ width: 4, height: 18, borderRadius: 2, backgroundColor: '#6366f1', flexShrink: 0 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#13131f' }}>
                        Totale Commissioni Generate
                    </Typography>
                </Box>
                <StatsChart label="commissioni" chartType="line" fetchData={fetchBigChart} />
            </Box>

            {/* Bottom two charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eef0f4', p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box sx={{ width: 4, height: 18, borderRadius: 2, backgroundColor: '#10b981', flexShrink: 0 }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#13131f' }}>
                                Totale Vendite Dirette
                            </Typography>
                        </Box>
                        <StatsChart label="vendite" chartType="line" fetchData={fetchBigChart} />
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eef0f4', p: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Box sx={{ width: 4, height: 18, borderRadius: 2, backgroundColor: '#f59e0b', flexShrink: 0 }} />
                            <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#13131f' }}>
                                Nuovi Affiliati Registrati
                            </Typography>
                        </Box>
                        <StatsChart label="affiliati" chartType="bar" fetchData={fetchBigChart} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}