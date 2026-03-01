"use client";

import { useEffect, useState } from "react";
// removed: Box, Card, CardContent, Grid, useMediaQuery (replaced by Tailwind)
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler,
  Legend, LinearScale, LineElement, PointElement, Title, Tooltip,
} from "chart.js";
import StatsChart from "@/components/common/stats-chart";
import ChartPreview from "@/components/common/chart-preview";
import { AttachMoney, Handshake, ShoppingBag } from "@mui/icons-material";
import { fetchAffiliates, fetchEarnings, fetchSales } from "@/lib/api/partners";
import type { ChartPreviewData } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Filler, Tooltip, Legend);

const config: Record<string, { label: string; colors: string[]; borderColors?: string[] }> = {
  vendite: { label: "Vendite Dirette", colors: ["rgba(75,192,192,1)", "rgba(75,192,192,0.2)"] },
  commissioni: { label: "Commissioni Generate", colors: ["rgba(255,159,64,0.6)", "rgba(255,159,64,1)"] },
  guadagni: { label: "Guadagni Maturati", colors: ["rgba(54,162,235,0.6)", "rgba(54,162,235,1)"] },
  affiliati: {
    label: "Nuovi Affiliati",
    colors: ["rgba(255,99,132,0.6)", "rgba(153,102,255,0.6)", "rgba(255,206,86,0.6)", "rgba(75,192,192,0.6)", "rgba(54,162,235,0.6)", "rgba(255,159,64,0.6)"],
    borderColors: ["rgba(255,99,132,1)", "rgba(153,102,255,1)", "rgba(255,206,86,1)", "rgba(75,192,192,1)", "rgba(54,162,235,1)", "rgba(255,159,64,1)"],
  },
};

export default function StatsPage() {
  const [chartsPreview, setChartsPreview] = useState<Record<string, ChartPreviewData | null>>({ sales: null, earnings: null, affiliates: null });

  useEffect(() => {
    fetchEarnings().then((res) => setChartsPreview((p) => ({ ...p, earnings: res.data })));
    fetchSales().then((res) => setChartsPreview((p) => ({ ...p, sales: res.data })));
    fetchAffiliates().then((res) => setChartsPreview((p) => ({ ...p, affiliates: res.data })));
  }, []);

  const getChartData = (chartType: string, data: number[], labels: string[]) => {
    const { label, colors, borderColors } = config[chartType];
    if (chartType === "affiliati") {
      return [{ labels, label, data, backgroundColor: colors, borderColor: borderColors, borderWidth: 1 }];
    }
    return [{ labels, label, data, borderColor: colors[0], backgroundColor: colors[1], pointRadius: 0, fill: true, tension: 0.5, borderWidth: 1 }];
  };

  const fetchBigChart = (chartType: string, periodType: string, dateRange: { start: Date; end: Date }) => {
    let startDate: Date, endDate: Date;
    switch (periodType) {
      case "today": startDate = new Date(); endDate = new Date(); break;
      case "weekly": endDate = new Date(); startDate = new Date(); startDate.setDate(endDate.getDate() - 6); break;
      case "monthly": endDate = new Date(); startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1); break;
      case "trimester": endDate = new Date(); startDate = new Date(); startDate.setMonth(endDate.getMonth() - 2, 1); break;
      case "custom": startDate = dateRange.start; endDate = dateRange.end; break;
      default: startDate = new Date(); endDate = new Date();
    }

    const fetchMap: Record<string, typeof fetchEarnings> = { commissioni: fetchEarnings, vendite: fetchSales, affiliati: fetchAffiliates };
    const fetchFn = fetchMap[chartType];
    if (!fetchFn) throw new Error(`Invalid chartType: ${chartType}`);

    return fetchFn(startDate, endDate).then((res) => {
      let labels = Object.keys(res.data.data);
      if (periodType !== "today") labels = labels.map((l) => new Date(l).toLocaleDateString("it-IT", { month: "2-digit", day: "2-digit" }));
      return getChartData(chartType, Object.values(res.data.data), labels);
    });
  };

  return (
    <div className="container py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="page-title">Statistiche</h1>
        <p className="page-subtitle">Analisi delle tue performance</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <ChartPreview label="Vendite Dirette" icon={<ShoppingBag style={{ color: "#13131f", fontSize: "22px" }} />} obj={chartsPreview.sales} />
        <ChartPreview label="Guadagni Maturati" icon={<AttachMoney style={{ color: "#13131f", fontSize: "22px" }} />} obj={chartsPreview.earnings} />
        <ChartPreview label="Co-Partner" icon={<Handshake style={{ color: "#13131f", fontSize: "22px" }} />} obj={chartsPreview.affiliates} />
      </div>

      {/* Full-width chart */}
      <div className="dash-card p-6 mb-6">
        <p className="text-[15px] font-semibold text-[#13131f] tracking-tight mb-3 m-0">Totale Commissioni Generate</p>
        <StatsChart label="commissioni" chartType="line" fetchData={fetchBigChart} />
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="dash-card p-6">
          <p className="text-[15px] font-semibold text-[#13131f] tracking-tight mb-3 m-0">Totale Vendite Dirette</p>
          <StatsChart label="vendite" chartType="line" fetchData={fetchBigChart} />
        </div>
        <div className="dash-card p-6">
          <p className="text-[15px] font-semibold text-[#13131f] tracking-tight mb-3 m-0">Nuovi Affiliati Registrati</p>
          <StatsChart label="affiliati" chartType="bar" fetchData={fetchBigChart} />
        </div>
      </div>
    </div>
  );
}
