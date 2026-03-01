"use client";

import ContentLoader from "react-content-loader";
import { Tooltip, IconButton } from "@mui/material";
import { ArrowUpward, ArrowDownward, InfoOutlined } from "@mui/icons-material";
import { Sparklines, SparklinesCurve } from "react-sparklines";
import type { ChartPreviewData } from "@/lib/types";

const ChartSkeleton = () => (
  <div className="dash-card p-5">
    <ContentLoader
      speed={2}
      width="100%"
      height={100}
      viewBox="0 0 400 100"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <rect x="0" y="8" rx="8" ry="8" width="44" height="44" />
      <rect x="56" y="10" rx="3" ry="3" width="120" height="10" />
      <rect x="56" y="28" rx="3" ry="3" width="80" height="18" />
      <rect x="0" y="70" rx="3" ry="3" width="300" height="20" />
    </ContentLoader>
  </div>
);

interface ChartPreviewProps {
  obj: ChartPreviewData | null;
  icon: React.ReactNode;
  label: string;
}

export default function ChartPreview({ obj, icon, label }: ChartPreviewProps) {
  if (!obj) return <ChartSkeleton />;

  const data = Object.values(obj.data);
  const formatted = obj.total.toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const isPositive = obj.trend === "positive";

  const infoText =
    'In caso di statistica di vendite i dati visualizzati riguardano solo gli ordini marcati come "Completati", ovvero un ordine è marcato come completato soltanto dopo che il prodotto è stato consegnato dal corriere al cliente.';

  return (
    <div className="dash-card dash-card-hover p-5 relative">
      <div className="absolute top-2 right-2 z-10">
        <Tooltip title={infoText} arrow placement="left">
          <IconButton size="small" className="!opacity-40 hover:!opacity-70">
            <InfoOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#f6f8fb] flex items-center justify-center shrink-0" style={{ boxShadow: '0 1px 3px rgba(19, 19, 31, 0.06)' }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide m-0">{label}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[22px] font-bold text-[#13131f] leading-tight" style={{ letterSpacing: '-0.03em' }}>{formatted}</span>
            <span
              className={[
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold",
                isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600",
              ].join(" ")}
            >
              {isPositive ? <ArrowUpward sx={{ fontSize: 13 }} /> : <ArrowDownward sx={{ fontSize: 13 }} />}
              {obj.difference}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3.5 -mx-1">
        <Sparklines data={data} height={28} margin={4}>
          <SparklinesCurve
            color={isPositive ? "#059669" : "#dc2626"}
            style={{ strokeWidth: 1.5, fill: "none" }}
          />
        </Sparklines>
      </div>
    </div>
  );
}
