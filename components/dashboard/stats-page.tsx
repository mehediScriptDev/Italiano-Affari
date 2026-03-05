"use client";

import {useEffect, useState} from 'react';
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
import {EuroSymbol, Handshake, ShoppingBag} from "@mui/icons-material";
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
        <div className="w-100 paddingContainer mt-3">
            <div className="flex items-center justify-between mb-3">
                <h1 className="page-title">Statistiche</h1>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5 lg:gap-[10.3px] mb-3">
                <ChartPreview
                    label="Vendite Dirette"
                    icon={<ShoppingBag style={{ fontSize: '20px' }} />}
                    obj={chartsPreview.sales}
                    iconBg="#6366f1"
                />
                <ChartPreview
                    label="Guadagni Maturati"
                    icon={<EuroSymbol style={{ fontSize: '20px' }} />}
                    obj={chartsPreview.earnings}
                    iconBg="#10b981"
                />
                <ChartPreview
                    label="Co-Partner"
                    icon={<Handshake style={{ fontSize: '20px' }} />}
                    obj={chartsPreview.affiliates}
                    iconBg="#f59e0b"
                />
            </div>

            {/* Main chart */}
            <div className="mb-3 bg-white rounded-sm border border-[#eef0f4] p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4.5 rounded-full bg-[#6366f1] shrink-0" />
                    <h2 className="text-[18px] font-bold text-[#13131f] m-0">Totale Commissioni Generate</h2>
                </div>
                <StatsChart label="commissioni" chartType="line" fetchData={fetchBigChart} />
            </div>

            {/* Bottom two charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-3">
                <div className="bg-white rounded-sm border border-[#eef0f4] p-4 h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4.5 rounded-full bg-[#10b981] shrink-0" />
                        <h2 className="text-[18px] font-bold text-[#13131f] m-0">Totale Vendite Dirette</h2>
                    </div>
                    <StatsChart label="vendite" chartType="line" fetchData={fetchBigChart} />
                </div>
                <div className="bg-white rounded-sm border border-[#eef0f4] p-4 h-full">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4.5 rounded-full bg-[#f59e0b] shrink-0" />
                        <h2 className="text-[18px] font-bold text-[#13131f] m-0">Nuovi Affiliati Registrati</h2>
                    </div>
                    <StatsChart label="affiliati" chartType="bar" fetchData={fetchBigChart} />
                </div>
            </div>
        </div>
    );
}
